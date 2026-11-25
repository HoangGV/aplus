import * as XLSX from "xlsx";
import { CourseRecord, SemesterRecord, TranscriptData } from "../types/grade";

const VALID_LETTERS = new Set(["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"]);

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .replace(/\uFEFF/g, "")
    .trim();
}

function normalizeHeader(value: unknown): string {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumericScore(raw: string): number | null {
  const cleaned = raw.replace(",", ".").trim();
  if (!cleaned || cleaned.toUpperCase() === "X") return null;
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const num = parseFloat(cleaned);
  if (Number.isNaN(num) || num < 0 || num > 10) return null;
  return num;
}

function parseLetterGrade(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (VALID_LETTERS.has(cleaned)) return cleaned;
  return "";
}

function parseCredits(raw: unknown): number {
  const cleaned = normalizeText(raw).replace(",", ".");
  const parsed = parseFloat(cleaned);
  if (Number.isNaN(parsed) || parsed <= 0) return 0;
  return parsed;
}

function makeStableKey(
  semesterKey: string,
  code: string,
  name: string,
  occurrenceIndex: number
): string {
  const base = (code || name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${semesterKey}::${base}${occurrenceIndex > 0 ? `::${occurrenceIndex}` : ""}`;
}

interface ColumnMapping {
  semesterIdx: number;
  codeIdx: number;
  nameIdx: number;
  creditsIdx: number;
  score10Idx: number;
  letterIdx: number;
  headerRowIdx: number;
  useOriginalSuffixGrouping: boolean;
}

function detectColumns(rows: string[][]): ColumnMapping {
  // Check first 12 rows for an explicit table header
  const scanLimit = Math.min(rows.length, 12);
  for (let r = 0; r < scanLimit; r++) {
    const normalizedCells = rows[r].map(normalizeHeader);
    let nameIdx = -1;
    let creditsIdx = -1;
    let semesterIdx = -1;
    let codeIdx = -1;
    let score10Idx = -1;
    let letterIdx = -1;

    normalizedCells.forEach((cell, idx) => {
      if (!cell) return;
      if (
        semesterIdx === -1 &&
        (cell === "hoc ky" ||
          cell === "ky" ||
          cell === "hk" ||
          cell.includes("hoc ky") ||
          cell.includes("nam hoc") ||
          cell === "semester")
      ) {
        semesterIdx = idx;
      } else if (
        codeIdx === -1 &&
        (cell === "ma hp" ||
          cell === "ma mon" ||
          cell === "ma hoc phan" ||
          cell.includes("ma hoc phan") ||
          cell.includes("ma hp") ||
          cell === "code")
      ) {
        codeIdx = idx;
      } else if (
        nameIdx === -1 &&
        (cell.includes("ten hoc phan") ||
          cell.includes("ten mon") ||
          cell === "hoc phan" ||
          cell === "mon hoc" ||
          cell === "course" ||
          cell === "subject")
      ) {
        nameIdx = idx;
      } else if (
        creditsIdx === -1 &&
        (cell.includes("tin chi") ||
          cell === "tc" ||
          cell === "stc" ||
          cell === "so tc" ||
          cell === "dvht" ||
          cell.includes("credit"))
      ) {
        creditsIdx = idx;
      } else if (
        letterIdx === -1 &&
        (cell.includes("diem chu") ||
          cell === "chu" ||
          cell === "letter" ||
          cell === "grade letter")
      ) {
        letterIdx = idx;
      } else if (
        score10Idx === -1 &&
        (cell.includes("diem he 10") ||
          cell.includes("he 10") ||
          cell.includes("tkhp") ||
          cell.includes("tong ket") ||
          cell.includes("diem so") ||
          cell === "diem" ||
          cell === "score" ||
          cell === "grade")
      ) {
        score10Idx = idx;
      }
    });

    if (nameIdx !== -1 && creditsIdx !== -1 && (score10Idx !== -1 || letterIdx !== -1)) {
      return {
        semesterIdx,
        codeIdx,
        nameIdx,
        creditsIdx,
        score10Idx,
        letterIdx,
        headerRowIdx: r,
        useOriginalSuffixGrouping: false,
      };
    }
  }

  // Fallback 1: Preserve original plugin.js dataRender 8+ column layout
  // columns[0] = fullSemesterId (grouped by slice(-2)), columns[2] = courseName, columns[3] = credits, columns[7] = grade
  const firstWideRow = rows.find((row) => row.length >= 8);
  if (firstWideRow) {
    return {
      semesterIdx: 0,
      codeIdx: 1,
      nameIdx: 2,
      creditsIdx: 3,
      score10Idx: 7,
      letterIdx: -1,
      headerRowIdx: -1,
      useOriginalSuffixGrouping: true,
    };
  }

  // Fallback 2: Compact 4-5 column CSV/Excel without headers
  // [Semester, (Code), CourseName, Credits, Grade]
  const sampleRow = rows.find((row) => row.filter((c) => c.trim()).length >= 4);
  if (sampleRow && sampleRow.length >= 5) {
    return {
      semesterIdx: 0,
      codeIdx: 1,
      nameIdx: 2,
      creditsIdx: 3,
      score10Idx: 4,
      letterIdx: 5 < sampleRow.length ? 5 : -1,
      headerRowIdx: -1,
      useOriginalSuffixGrouping: false,
    };
  }

  return {
    semesterIdx: 0,
    codeIdx: -1,
    nameIdx: 1,
    creditsIdx: 2,
    score10Idx: 3,
    letterIdx: -1,
    headerRowIdx: -1,
    useOriginalSuffixGrouping: false,
  };
}

function parseDelimitedText(text: string): string[][] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) return [];

  // Detect primary delimiter: prefer tab (original plugin.js format), then semicolon, then comma
  const tabCount = lines.slice(0, 10).reduce((acc, l) => acc + (l.split("\t").length - 1), 0);
  const semiCount = lines.slice(0, 10).reduce((acc, l) => acc + (l.split(";").length - 1), 0);
  const commaCount = lines.slice(0, 10).reduce((acc, l) => acc + (l.split(",").length - 1), 0);

  let delimiter = ",";
  if (tabCount >= Math.max(semiCount, commaCount) && tabCount > 0) {
    delimiter = "\t";
  } else if (semiCount > commaCount) {
    delimiter = ";";
  }

  return lines.map((line) => {
    if (delimiter === "\t") {
      return line.split("\t").map((cell) => normalizeText(cell));
    }
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        cells.push(normalizeText(current));
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(normalizeText(current));
    return cells;
  });
}

function buildTranscriptFromRows(
  rows: string[][],
  fileName: string
): TranscriptData {
  const nonEmptyRows = rows.filter((r) =>
    r.some((cell) => normalizeText(cell).length > 0)
  );
  if (nonEmptyRows.length === 0) {
    throw new Error("Tệp bảng điểm không có dữ liệu.");
  }

  const mapping = detectColumns(nonEmptyRows);
  const dataRows =
    mapping.headerRowIdx >= 0
      ? nonEmptyRows.slice(mapping.headerRowIdx + 1)
      : nonEmptyRows;

  const semesters: SemesterRecord[] = [];
  let currentSemester: SemesterRecord | null = null;
  let previousSemesterGroupKey: string | null = null;
  let semesterCounter = 0;
  let courseGlobalIdx = 0;
  const keyOccurrences: Record<string, number> = {};

  const semesterLookup = new Map<string, SemesterRecord>();

  for (const row of dataRows) {
    // Check if this row is a standalone semester banner row (e.g. "Học kỳ 1 - 2023-2024")
    const filledCells = row.filter((c) => c.trim().length > 0);
    if (
      filledCells.length === 1 &&
      /học kỳ|hoc ky|hk\s*\d|kỳ\s*\d/i.test(filledCells[0])
    ) {
      semesterCounter++;
      const label = filledCells[0].trim();
      const semId = `HK-${semesterCounter}`;
      currentSemester = { id: semId, label, courses: [] };
      semesters.push(currentSemester);
      previousSemesterGroupKey = label;
      semesterLookup.set(label, currentSemester);
      continue;
    }

    const courseName =
      mapping.nameIdx >= 0 && mapping.nameIdx < row.length
        ? normalizeText(row[mapping.nameIdx])
        : "";
    if (!courseName) continue;

    // Preserve original plugin.js exclusion rule: skip "Giáo dục thể chất"
    if (courseName.toLowerCase().includes("giáo dục thể chất")) {
      continue;
    }

    const creditsRaw =
      mapping.creditsIdx >= 0 && mapping.creditsIdx < row.length
        ? row[mapping.creditsIdx]
        : "";
    const credits = parseCredits(creditsRaw);
    if (credits <= 0) continue;

    const code =
      mapping.codeIdx >= 0 && mapping.codeIdx < row.length
        ? normalizeText(row[mapping.codeIdx])
        : "";

    const rawScoreCell =
      mapping.score10Idx >= 0 && mapping.score10Idx < row.length
        ? normalizeText(row[mapping.score10Idx])
        : "";
    const rawLetterCell =
      mapping.letterIdx >= 0 && mapping.letterIdx < row.length
        ? normalizeText(row[mapping.letterIdx])
        : "";

    let rawScore10 = parseNumericScore(rawScoreCell);
    let rawLetter = parseLetterGrade(rawLetterCell);

    // If score10 cell actually contains a letter grade (e.g., "B+", "C"), parse it as letter
    if (rawScore10 === null && !rawLetter && rawScoreCell) {
      rawLetter = parseLetterGrade(rawScoreCell);
    }
    // If letter cell actually contains a numeric score, parse it as numeric
    if (rawScore10 === null && !rawLetter && rawLetterCell) {
      rawScore10 = parseNumericScore(rawLetterCell);
    }

    // Determine semester grouping
    let rawSemester =
      mapping.semesterIdx >= 0 && mapping.semesterIdx < row.length
        ? normalizeText(row[mapping.semesterIdx])
        : "";

    if (mapping.useOriginalSuffixGrouping) {
      const suffix = rawSemester ? rawSemester.slice(-2) : "01";
      if (previousSemesterGroupKey !== suffix || !currentSemester) {
        semesterCounter++;
        currentSemester = {
          id: `HK-${semesterCounter}`,
          label: `Học kỳ ${semesterCounter}`,
          courses: [],
        };
        semesters.push(currentSemester);
        previousSemesterGroupKey = suffix;
      }
    } else if (rawSemester) {
      const existing = semesterLookup.get(rawSemester);
      if (existing) {
        currentSemester = existing;
      } else {
        semesterCounter++;
        const cleanLabel = /^\d+$/.test(rawSemester)
          ? `Học kỳ ${rawSemester}`
          : rawSemester;
        currentSemester = {
          id: `HK-${semesterCounter}`,
          label: cleanLabel,
          courses: [],
        };
        semesters.push(currentSemester);
        semesterLookup.set(rawSemester, currentSemester);
      }
    } else if (!currentSemester) {
      semesterCounter++;
      currentSemester = {
        id: `HK-${semesterCounter}`,
        label: `Học kỳ ${semesterCounter}`,
        courses: [],
      };
      semesters.push(currentSemester);
    }

    courseGlobalIdx++;
    const baseKey = makeStableKey(currentSemester.label, code, courseName, 0);
    const count = keyOccurrences[baseKey] || 0;
    keyOccurrences[baseKey] = count + 1;
    const stableKey = makeStableKey(currentSemester.label, code, courseName, count);

    const record: CourseRecord = {
      id: `course-${courseGlobalIdx}`,
      stableKey,
      code,
      name: courseName,
      credits,
      rawScore10,
      rawLetter,
      semesterId: currentSemester.id,
    };

    currentSemester.courses.push(record);
  }

  const nonEmptySemesters = semesters.filter((s) => s.courses.length > 0);
  if (nonEmptySemesters.length === 0) {
    throw new Error(
      "Không tìm thấy học phần hợp lệ trong tệp. Vui lòng kiểm tra các cột: Học kỳ, Tên học phần, Số tín chỉ và Điểm."
    );
  }

  return {
    fileName,
    uploadedAt: new Date().toISOString(),
    semesters: nonEmptySemesters,
  };
}

export async function parseTranscriptFile(file: File): Promise<TranscriptData> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    if (!workbook.SheetNames.length) {
      throw new Error("Tệp Excel không có trang tính nào.");
    }
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawMatrix = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
      header: 1,
      defval: "",
      raw: false,
    });
    const rows = rawMatrix.map((row) =>
      Array.isArray(row) ? row.map((cell) => normalizeText(cell)) : []
    );
    return buildTranscriptFromRows(rows, file.name);
  }

  if (
    lowerName.endsWith(".csv") ||
    lowerName.endsWith(".tsv") ||
    lowerName.endsWith(".txt")
  ) {
    const text = await file.text();
    const rows = parseDelimitedText(text);
    return buildTranscriptFromRows(rows, file.name);
  }

  throw new Error(
    "Định dạng tệp chưa được hỗ trợ. Vui lòng chọn tệp .xlsx, .xls, .csv, .tsv hoặc .txt."
  );
}

const SAMPLE_ROWS = [
  ["Học kỳ", "Mã học phần", "Tên học phần", "Số tín chỉ", "Điểm hệ 10"],
  ["Học kỳ 1 (2024-2025)", "TIN101", "Nhập môn lập trình", 3, 8.6],
  ["Học kỳ 1 (2024-2025)", "TOA102", "Giải tích 1", 3, 6.2],
  ["Học kỳ 1 (2024-2025)", "LY101", "Vật lý đại cương", 2, 5.1],
  ["Học kỳ 1 (2024-2025)", "ANH101", "Tiếng Anh cơ bản 1", 3, 7.8],
  ["Học kỳ 2 (2024-2025)", "TIN201", "Cấu trúc dữ liệu và giải thuật", 4, 6.6],
  ["Học kỳ 2 (2024-2025)", "TOA201", "Xác suất thống kê", 3, 4.8],
  ["Học kỳ 2 (2024-2025)", "TIN204", "Cơ sở dữ liệu", 3, 8.2],
  ["Học kỳ 2 (2024-2025)", "CT102", "Kinh tế chính trị", 2, 7.2],
  ["Học kỳ 3 (2025-2026)", "TIN301", "Lập trình hướng đối tượng", 3, 9.1],
  ["Học kỳ 3 (2025-2026)", "TIN305", "Mạng máy tính", 3, 5.8],
  ["Học kỳ 3 (2025-2026)", "TIN308", "Hệ điều hành", 3, 3.6],
  ["Học kỳ 3 (2025-2026)", "KT301", "Quản trị dự án phần mềm", 2, 8.0],
];

export function downloadSampleTranscriptXlsx(): void {
  const worksheet = XLSX.utils.aoa_to_sheet(SAMPLE_ROWS);
  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 14 },
    { wch: 34 },
    { wch: 12 },
    { wch: 14 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BangDiem");
  XLSX.writeFile(workbook, "bang-diem-mau-aplus.xlsx");
}

export function createSampleTranscriptData(): TranscriptData {
  const stringRows = SAMPLE_ROWS.map((row) => row.map((cell) => String(cell)));
  return buildTranscriptFromRows(stringRows, "bang-diem-mau-aplus.xlsx");
}
