import React, { useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { CourseRecord, GradingScaleId, SemesterRecord } from "../types/grade";
import { GRADING_SCALES, score10ToLevel } from "../utils/gradingScales";

export interface ManualCourseInput {
  semesterId: string;
  newSemesterLabel?: string;
  code: string;
  name: string;
  credits: number;
  rawScore10: number | null;
  rawLetter: string;
}

interface ManualEntryPanelProps {
  semesters: SemesterRecord[];
  scaleId: GradingScaleId;
  initialSemesterId?: string;
  editingCourse?: CourseRecord | null;
  onSubmitCourse: (input: ManualCourseInput, editingCourseId?: string) => void;
  onClose: () => void;
}

const NEW_SEMESTER_VALUE = "__NEW_SEMESTER__";

export default function ManualEntryPanel({
  semesters,
  scaleId,
  initialSemesterId,
  editingCourse,
  onSubmitCourse,
  onClose,
}: ManualEntryPanelProps) {
  const activeScale = GRADING_SCALES[scaleId];
  const isEditing = Boolean(editingCourse);

  const defaultSemesterValue = editingCourse
    ? editingCourse.semesterId
    : initialSemesterId && semesters.some((s) => s.id === initialSemesterId)
      ? initialSemesterId
      : semesters.length > 0
        ? semesters[semesters.length - 1].id
        : NEW_SEMESTER_VALUE;

  const [semesterChoice, setSemesterChoice] =
    useState<string>(defaultSemesterValue);
  const [newSemesterLabel, setNewSemesterLabel] = useState<string>(
    `Học kỳ ${semesters.length + 1}`
  );
  const [code, setCode] = useState<string>(editingCourse?.code || "");
  const [name, setName] = useState<string>(editingCourse?.name || "");
  const [credits, setCredits] = useState<string>(
    editingCourse ? String(editingCourse.credits) : "3"
  );
  const [gradeInputMode, setGradeInputMode] = useState<"letter" | "score10">(
    editingCourse && editingCourse.rawScore10 !== null ? "score10" : "letter"
  );
  const [letterGrade, setLetterGrade] = useState<string>(
    editingCourse?.rawLetter || activeScale.levels[0]?.letter || "A"
  );
  const [score10, setScore10] = useState<string>(
    editingCourse && editingCourse.rawScore10 !== null
      ? String(editingCourse.rawScore10)
      : ""
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCourse) {
      setSemesterChoice(editingCourse.semesterId);
      setCode(editingCourse.code || "");
      setName(editingCourse.name);
      setCredits(String(editingCourse.credits));
      if (editingCourse.rawScore10 !== null) {
        setGradeInputMode("score10");
        setScore10(String(editingCourse.rawScore10));
        setLetterGrade(
          score10ToLevel(editingCourse.rawScore10, activeScale).letter
        );
      } else {
        setGradeInputMode("letter");
        setScore10("");
        setLetterGrade(
          editingCourse.rawLetter || activeScale.levels[0]?.letter || "A"
        );
      }
      setFormError(null);
    }
  }, [editingCourse, activeScale]);

  // Keep selected letter valid if user switches grading scales while panel is open
  useEffect(() => {
    const exists = activeScale.levels.some((l) => l.letter === letterGrade);
    if (!exists) {
      const base = letterGrade.charAt(0);
      const fallback =
        activeScale.levels.find((l) => l.letter === base)?.letter ||
        activeScale.levels[0]?.letter ||
        "A";
      setLetterGrade(fallback);
    }
  }, [activeScale, letterGrade]);

  const parsedScore10Preview = (() => {
    const val = parseFloat(score10.replace(",", "."));
    if (Number.isNaN(val) || val < 0 || val > 10) return null;
    return score10ToLevel(val, activeScale);
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Vui lòng nhập tên học phần.");
      return;
    }

    const parsedCredits = parseFloat(credits.replace(",", "."));
    if (Number.isNaN(parsedCredits) || parsedCredits <= 0 || parsedCredits > 30) {
      setFormError("Số tín chỉ phải lớn hơn 0 và không quá 30.");
      return;
    }

    let finalScore10: number | null = null;
    let finalLetter = "";

    if (gradeInputMode === "score10") {
      const parsedScore = parseFloat(score10.replace(",", "."));
      if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10) {
        setFormError("Điểm hệ 10 phải nằm trong khoảng từ 0.0 đến 10.0.");
        return;
      }
      finalScore10 = Math.round(parsedScore * 100) / 100;
      finalLetter = score10ToLevel(finalScore10, activeScale).letter;
    } else {
      finalLetter = letterGrade;
      finalScore10 = null;
    }

    const isCreatingSemester = semesterChoice === NEW_SEMESTER_VALUE;
    const cleanNewSemLabel =
      newSemesterLabel.trim() || `Học kỳ ${semesters.length + 1}`;

    onSubmitCourse(
      {
        semesterId: isCreatingSemester ? NEW_SEMESTER_VALUE : semesterChoice,
        newSemesterLabel: isCreatingSemester ? cleanNewSemLabel : undefined,
        code: code.trim(),
        name: trimmedName,
        credits: parsedCredits,
        rawScore10: finalScore10,
        rawLetter: finalLetter,
      },
      editingCourse?.id
    );

    if (!isEditing) {
      // Reset fields for fast consecutive manual entry
      setName("");
      setCode("");
      setScore10("");
      if (isCreatingSemester) {
        setNewSemesterLabel(`Học kỳ ${semesters.length + 2}`);
      }
    }
  };

  return (
    <section
      aria-label={isEditing ? "Chỉnh sửa học phần" : "Nhập điểm thủ công"}
      className="rounded-2xl border border-[#4169E1]/40 bg-white p-5 sm:p-6 dark:border-[#6F8FF2]/40 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {isEditing ? "Chỉnh sửa học phần" : "Nhập điểm học phần thủ công"}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {isEditing
              ? "Cập nhật thông tin học phần, tín chỉ và điểm số."
              : "Thêm nhanh học phần theo điểm chữ hoặc điểm hệ 10 để tính GPA, CPA và lập kế hoạch cải thiện."}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng khung nhập điểm thủ công"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {/* Semester Selector */}
          {!isEditing && (
            <div className="lg:col-span-3">
              <label
                htmlFor="manual-semester-select"
                className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Học kỳ
              </label>
              <select
                id="manual-semester-select"
                value={semesterChoice}
                onChange={(e) => setSemesterChoice(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-[#6F8FF2]"
              >
                {semesters.map((sem) => (
                  <option
                    key={sem.id}
                    value={sem.id}
                    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {sem.label}
                  </option>
                ))}
                <option
                  value={NEW_SEMESTER_VALUE}
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                >
                  + Tạo học kỳ mới
                </option>
              </select>
            </div>
          )}

          {!isEditing && semesterChoice === NEW_SEMESTER_VALUE && (
            <div className="lg:col-span-3">
              <label
                htmlFor="manual-new-semester"
                className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Tên học kỳ mới
              </label>
              <input
                id="manual-new-semester"
                type="text"
                value={newSemesterLabel}
                onChange={(e) => setNewSemesterLabel(e.target.value)}
                placeholder="VD: Học kỳ 1 (2025-2026)"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          )}

          {/* Course Name */}
          <div
            className={
              isEditing
                ? "lg:col-span-5"
                : semesterChoice === NEW_SEMESTER_VALUE
                  ? "lg:col-span-4"
                  : "lg:col-span-5"
            }
          >
            <label
              htmlFor="manual-course-name"
              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Tên học phần <span className="text-rose-500">*</span>
            </label>
            <input
              id="manual-course-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cấu trúc dữ liệu và giải thuật"
              required
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          {/* Course Code (Optional) */}
          <div className="lg:col-span-2">
            <label
              htmlFor="manual-course-code"
              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Mã HP (tùy chọn)
            </label>
            <input
              id="manual-course-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: TIN201"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          {/* Credits */}
          <div className={isEditing ? "lg:col-span-2" : "lg:col-span-2"}>
            <label
              htmlFor="manual-course-credits"
              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Số tín chỉ <span className="text-rose-500">*</span>
            </label>
            <input
              id="manual-course-credits"
              type="number"
              min={0.5}
              max={30}
              step={0.5}
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              required
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-900 tabular-nums focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Grade Input Row */}
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Kiểu nhập điểm
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setGradeInputMode("letter")}
                  className={`min-h-[34px] whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors ${
                    gradeInputMode === "letter"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  Điểm chữ
                </button>
                <button
                  type="button"
                  onClick={() => setGradeInputMode("score10")}
                  className={`min-h-[34px] whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors ${
                    gradeInputMode === "score10"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  Điểm hệ 10
                </button>
              </div>
            </div>

            {gradeInputMode === "letter" ? (
              <div className="sm:w-56">
                <label
                  htmlFor="manual-grade-letter"
                  className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Điểm đạt được ({activeScale.shortName})
                </label>
                <select
                  id="manual-grade-letter"
                  value={letterGrade}
                  onChange={(e) => setLetterGrade(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm font-semibold text-slate-900 focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-[#6F8FF2]"
                >
                  {activeScale.levels.map((lvl) => (
                    <option
                      key={lvl.letter}
                      value={lvl.letter}
                      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {lvl.letter} — Hệ 4: {lvl.gpa4.toFixed(1)} ({lvl.rangeLabel})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <div className="w-36">
                  <label
                    htmlFor="manual-grade-score10"
                    className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Điểm hệ 10 (0 – 10)
                  </label>
                  <input
                    id="manual-grade-score10"
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={score10}
                    onChange={(e) => setScore10(e.target.value)}
                    placeholder="VD: 7.4"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm font-semibold text-slate-900 tabular-nums placeholder:text-slate-400 focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
                {parsedScore10Preview && (
                  <p className="pb-2 font-mono text-xs text-slate-600 tabular-nums dark:text-slate-300">
                    Quy đổi:{" "}
                    <strong className="text-[#4169E1] dark:text-[#9EB4FA]">
                      {parsedScore10Preview.letter} (
                      {parsedScore10Preview.gpa4.toFixed(1)})
                    </strong>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#4169E1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3457C8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>Lưu thay đổi</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Thêm học phần</span>
                </>
              )}
            </button>
          </div>
        </div>

        {formError && (
          <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {formError}
          </p>
        )}
      </form>
    </section>
  );
}
