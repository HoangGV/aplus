import React, { useMemo, useRef, useState } from "react";
import { CourseRecord, GradingScaleId, TranscriptData } from "../types/grade";
import { computeTranscriptMetrics } from "../utils/gradingScales";
import {
  createSampleTranscriptData,
  downloadSampleTranscriptXlsx,
  parseTranscriptFile,
} from "../utils/transcriptParser";
import {
  loadCourseImprovements,
  loadCourseNotes,
  loadGeneralNote,
  loadGradingScale,
  loadTargetCpa,
  loadTranscriptData,
  saveCourseImprovements,
  saveCourseNotes,
  saveGeneralNote,
  saveGradingScale,
  saveTargetCpa,
  saveTranscriptData,
} from "../utils/storage";
import FileUploadCard from "../components/FileUploadCard";
import ScaleSelectorBar from "../components/ScaleSelectorBar";
import ManualEntryPanel, {
  ManualCourseInput,
} from "../components/ManualEntryPanel";
import TargetGoalPanel from "../components/TargetGoalPanel";
import SemesterCourseList from "../components/SemesterCourseList";
import ImprovementSummaryAndNotes from "../components/ImprovementSummaryAndNotes";

function buildManualStableKey(
  semesterLabel: string,
  code: string,
  name: string
): string {
  const base = (code || name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${semesterLabel}::${base}::${Date.now().toString(36)}`;
}

export default function CalculatorPage() {
  const [transcript, setTranscript] = useState<TranscriptData | null>(() =>
    loadTranscriptData()
  );
  const [scaleId, setScaleId] = useState<GradingScaleId>(() =>
    loadGradingScale()
  );
  const [targetCpa, setTargetCpa] = useState<number>(() => loadTargetCpa());
  const [improvements, setImprovements] = useState<Record<string, string>>(() =>
    loadCourseImprovements()
  );
  const [courseNotes, setCourseNotes] = useState<Record<string, string>>(() =>
    loadCourseNotes()
  );
  const [generalNote, setGeneralNote] = useState<string>(() =>
    loadGeneralNote()
  );
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Manual entry & edit state
  const [manualOpen, setManualOpen] = useState(false);
  const [manualSemesterId, setManualSemesterId] = useState<string | undefined>(
    undefined
  );
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const manualPanelRef = useRef<HTMLDivElement>(null);

  const { semesters, summary } = useMemo(
    () => computeTranscriptMetrics(transcript, scaleId, improvements),
    [transcript, scaleId, improvements]
  );

  const updateTranscript = (next: TranscriptData | null) => {
    setTranscript(next);
    saveTranscriptData(next);
  };

  const scrollToManualPanel = () => {
    setTimeout(() => {
      manualPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 50);
  };

  const handleOpenManualEntry = (semesterId?: string) => {
    setEditingCourse(null);
    setManualSemesterId(semesterId);
    setManualOpen(true);
    scrollToManualPanel();
  };

  const handleEditCourse = (course: CourseRecord) => {
    setEditingCourse(course);
    setManualSemesterId(course.semesterId);
    setManualOpen(true);
    scrollToManualPanel();
  };

  const handleCloseManualPanel = () => {
    setManualOpen(false);
    setEditingCourse(null);
  };

  const handleSubmitManualCourse = (
    input: ManualCourseInput,
    editingCourseId?: string
  ) => {
    const nowIso = new Date().toISOString();

    if (editingCourseId && transcript) {
      const updatedSemesters = transcript.semesters.map((sem) => ({
        ...sem,
        courses: sem.courses.map((c) => {
          if (c.id !== editingCourseId) return c;
          return {
            ...c,
            code: input.code,
            name: input.name,
            credits: input.credits,
            rawScore10: input.rawScore10,
            rawLetter: input.rawLetter,
          };
        }),
      }));

      updateTranscript({
        ...transcript,
        semesters: updatedSemesters,
      });
      setEditingCourse(null);
      setManualOpen(false);
      return;
    }

    const baseTranscript: TranscriptData = transcript || {
      fileName: "Bảng điểm nhập thủ công",
      uploadedAt: nowIso,
      semesters: [],
    };

    let nextSemesters = [...baseTranscript.semesters];
    let targetSemester = nextSemesters.find((s) => s.id === input.semesterId);

    if (!targetSemester) {
      const nextNum = nextSemesters.length + 1;
      const newSemId = `HK-${Date.now().toString(36)}-${nextNum}`;
      targetSemester = {
        id: newSemId,
        label: input.newSemesterLabel || `Học kỳ ${nextNum}`,
        courses: [],
      };
      nextSemesters.push(targetSemester);
    }

    const newCourse: CourseRecord = {
      id: `manual-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      stableKey: buildManualStableKey(
        targetSemester.label,
        input.code,
        input.name
      ),
      code: input.code,
      name: input.name,
      credits: input.credits,
      rawScore10: input.rawScore10,
      rawLetter: input.rawLetter,
      semesterId: targetSemester.id,
    };

    nextSemesters = nextSemesters.map((sem) =>
      sem.id === targetSemester!.id
        ? { ...sem, courses: [...sem.courses, newCourse] }
        : sem
    );

    updateTranscript({
      ...baseTranscript,
      semesters: nextSemesters,
    });
    setManualSemesterId(targetSemester.id);
  };

  const handleDeleteCourse = (semesterId: string, courseId: string) => {
    if (!transcript) return;
    const updatedSemesters = transcript.semesters.map((sem) =>
      sem.id === semesterId
        ? { ...sem, courses: sem.courses.filter((c) => c.id !== courseId) }
        : sem
    );
    updateTranscript({
      ...transcript,
      semesters: updatedSemesters,
    });
    if (editingCourse?.id === courseId) {
      setEditingCourse(null);
      setManualOpen(false);
    }
  };

  const handleAddSemester = () => {
    const nowIso = new Date().toISOString();
    const baseTranscript: TranscriptData = transcript || {
      fileName: "Bảng điểm nhập thủ công",
      uploadedAt: nowIso,
      semesters: [],
    };
    const nextNum = baseTranscript.semesters.length + 1;
    const newSemId = `HK-${Date.now().toString(36)}-${nextNum}`;
    updateTranscript({
      ...baseTranscript,
      semesters: [
        ...baseTranscript.semesters,
        {
          id: newSemId,
          label: `Học kỳ ${nextNum}`,
          courses: [],
        },
      ],
    });
  };

  const handleDeleteSemester = (semesterId: string) => {
    if (!transcript) return;
    const remaining = transcript.semesters.filter((s) => s.id !== semesterId);
    if (remaining.length === 0) {
      updateTranscript(null);
      return;
    }
    updateTranscript({
      ...transcript,
      semesters: remaining,
    });
  };

  const handleFileSelected = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    try {
      const parsed = await parseTranscriptFile(file);
      updateTranscript(parsed);
      setManualOpen(false);
      setEditingCourse(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể đọc tệp bảng điểm. Vui lòng thử lại với định dạng .xlsx, .xls hoặc .csv.";
      setParseError(message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadSamplePreview = () => {
    setParseError(null);
    const sample = createSampleTranscriptData();
    updateTranscript(sample);
  };

  const handleClearTranscript = () => {
    updateTranscript(null);
    setParseError(null);
    setEditingCourse(null);
  };

  const handleChangeScale = (nextScale: GradingScaleId) => {
    setScaleId(nextScale);
    saveGradingScale(nextScale);
  };

  const handleChangeTargetCpa = (nextTarget: number) => {
    setTargetCpa(nextTarget);
    saveTargetCpa(nextTarget);
  };

  const handleChangeImprovement = (stableKey: string, letter: string) => {
    setImprovements((prev) => {
      const updated = { ...prev };
      if (!letter) {
        delete updated[stableKey];
      } else {
        updated[stableKey] = letter;
      }
      saveCourseImprovements(updated);
      return updated;
    });
  };

  const handleResetImprovements = () => {
    setImprovements({});
    saveCourseImprovements({});
  };

  const handleChangeCourseNote = (stableKey: string, note: string) => {
    setCourseNotes((prev) => {
      const updated = { ...prev };
      if (!note) {
        delete updated[stableKey];
      } else {
        updated[stableKey] = note;
      }
      saveCourseNotes(updated);
      return updated;
    });
  };

  const handleChangeGeneralNote = (note: string) => {
    setGeneralNote(note);
    saveGeneralNote(note);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Brand Title & Slogan Intro */}
      <section className="mb-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[#4169E1] dark:text-[#6F8FF2]">
            Aplus grande | Người đồng hành
          </p>
          <h1
            className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white"
            style={{ textWrap: "balance" }}
          >
            Điểm số chỉ có thể tốt hơn
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            Tải tệp bảng điểm hoặc nhập điểm thủ công để tính nhanh GPA từng học
            kỳ, CPA tích lũy theo nhiều thang điểm chuẩn và mô phỏng lộ trình
            học cải thiện cho các học phần dưới điểm B.
          </p>
        </div>
      </section>

      <div className="space-y-6">
        {/* Transcript File Upload Area */}
        <FileUploadCard
          transcript={transcript}
          summary={summary}
          isParsing={isParsing}
          error={parseError}
          onFileSelected={handleFileSelected}
          onClearTranscript={handleClearTranscript}
          onDownloadSample={downloadSampleTranscriptXlsx}
          onLoadSamplePreview={handleLoadSamplePreview}
          onOpenManualEntry={() => handleOpenManualEntry()}
        />

        {/* Grading Scale Selector */}
        <ScaleSelectorBar scaleId={scaleId} onChangeScale={handleChangeScale} />

        {/* Manual Course Entry / Edit Panel */}
        {manualOpen && (
          <div ref={manualPanelRef}>
            <ManualEntryPanel
              semesters={transcript?.semesters || []}
              scaleId={scaleId}
              initialSemesterId={manualSemesterId}
              editingCourse={editingCourse}
              onSubmitCourse={handleSubmitManualCourse}
              onClose={handleCloseManualPanel}
            />
          </div>
        )}

        {/* Populated Calculator Workspace */}
        {transcript ? (
          <>
            <TargetGoalPanel
              summary={summary}
              targetCpa={targetCpa}
              onChangeTargetCpa={handleChangeTargetCpa}
            />

            <SemesterCourseList
              semesters={semesters}
              summary={summary}
              scaleId={scaleId}
              courseNotes={courseNotes}
              onChangeImprovement={handleChangeImprovement}
              onChangeCourseNote={handleChangeCourseNote}
              onResetImprovements={handleResetImprovements}
              onAddCourseToSemester={(semId) => handleOpenManualEntry(semId)}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddSemester={handleAddSemester}
              onDeleteSemester={handleDeleteSemester}
            />

            <ImprovementSummaryAndNotes
              semesters={semesters}
              summary={summary}
              courseNotes={courseNotes}
              generalNote={generalNote}
              onRemoveImprovement={(key) => handleChangeImprovement(key, "")}
              onChangeGeneralNote={handleChangeGeneralNote}
            />
          </>
        ) : (
          /* Clean 3-Step Usage Overview when Empty */
          <section
            aria-label="Hướng dẫn sử dụng nhanh"
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs font-semibold text-[#4169E1] dark:text-[#6F8FF2]">
                01. Tải bảng điểm hoặc nhập tay
              </p>
              <h3 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                Linh hoạt nguồn dữ liệu
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Kéo thả tệp Excel (.xlsx, .xls), CSV/TSV hoặc bấm Nhập điểm thủ
                công để tự thêm học kỳ, môn học và điểm số.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs font-semibold text-[#4169E1] dark:text-[#6F8FF2]">
                02. Chọn thang điểm &amp; cải thiện
              </p>
              <h3 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                Mô phỏng nâng điểm các môn dưới B
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Các môn đạt từ điểm B trở lên (≥ 3.0) được tự động khóa. Chọn
                điểm dự kiến cho các học phần dưới B để xem mức tăng CPA tức
                thì.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs font-semibold text-[#4169E1] dark:text-[#6F8FF2]">
                03. Đặt mục tiêu &amp; ghi chú
              </p>
              <h3 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                Theo dõi tiến độ &amp; lưu kế hoạch
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Thiết lập mốc CPA mục tiêu và ghi chú học lại cho từng học phần.
                Toàn bộ dữ liệu được tự động lưu trên trình duyệt.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
