import React, { useMemo } from "react";
import { ArrowRight, ClipboardList, StickyNote, X } from "lucide-react";
import { ComputedCourse, ComputedSemester, OverallSummary } from "../types/grade";

interface ImprovementSummaryAndNotesProps {
  semesters: ComputedSemester[];
  summary: OverallSummary;
  courseNotes: Record<string, string>;
  generalNote: string;
  onRemoveImprovement: (stableKey: string) => void;
  onChangeGeneralNote: (note: string) => void;
}

export default function ImprovementSummaryAndNotes({
  semesters,
  summary,
  courseNotes,
  generalNote,
  onRemoveImprovement,
  onChangeGeneralNote,
}: ImprovementSummaryAndNotesProps) {
  const plannedItems = useMemo(() => {
    const list: { semesterLabel: string; course: ComputedCourse }[] = [];
    semesters.forEach((sem) => {
      sem.courses.forEach((course) => {
        if (course.improvedLetter !== null) {
          list.push({ semesterLabel: sem.label, course });
        }
      });
    });
    return list;
  }, [semesters]);

  return (
    <section
      aria-label="Tổng hợp kế hoạch cải thiện và ghi chú lộ trình"
      className="grid grid-cols-1 gap-6 lg:grid-cols-12"
    >
      {/* Planned Improvements Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ClipboardList
              className="h-5 w-5 text-[#4169E1] dark:text-[#6F8FF2]"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Danh sách học phần dự kiến cải thiện
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {plannedItems.length > 0
                  ? `${plannedItems.length} học phần · ${summary.plannedCredits} tín chỉ · Dự kiến tăng +${summary.cpaDelta.toFixed(2)} CPA`
                  : "Chọn điểm dự kiến ở các môn dưới B để lập kế hoạch"}
              </p>
            </div>
          </div>
        </div>

        {plannedItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Chưa có học phần nào được chọn để cải thiện.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Hãy chọn điểm cải thiện dự kiến ở bảng học kỳ phía trên (áp dụng
              cho các học phần có điểm dưới B).
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {plannedItems.map(({ semesterLabel, course }) => {
              const note = courseNotes[course.stableKey]?.trim();
              return (
                <li
                  key={course.id}
                  className="flex items-start justify-between gap-3 py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {course.name}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        {course.credits} TC · {semesterLabel}
                      </span>
                    </div>
                    {note && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        Ghi chú: {note}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {course.letterGrade}
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      <span className="font-bold text-[#4169E1] dark:text-[#9EB4FA]">
                        {course.improvedLetter}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveImprovement(course.stableKey)}
                      aria-label={`Bỏ chọn cải thiện môn ${course.name}`}
                      title="Bỏ chọn cải thiện"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* General Roadmap Note */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-2 pb-4">
          <div className="flex items-center gap-2.5">
            <StickyNote
              className="h-5 w-5 text-[#4169E1] dark:text-[#6F8FF2]"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Ghi chú lộ trình học tập
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động lưu trên trình duyệt của bạn
              </p>
            </div>
          </div>
        </div>

        <textarea
          value={generalNote}
          onChange={(e) => onChangeGeneralNote(e.target.value)}
          rows={6}
          placeholder="Ghi lại kế hoạch tổng quát: ưu tiên học cải thiện các môn nhiều tín chỉ vào kỳ hè, mục tiêu điểm từng kỳ, lịch đăng ký tín chỉ..."
          aria-label="Ghi chú tổng quát cho lộ trình học tập"
          className="w-full flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 transition-colors focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#6F8FF2] dark:focus:bg-slate-800"
        />

        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>Dữ liệu mục tiêu và ghi chú được giữ nguyên khi tải lại trang.</span>
          <span className="font-mono tabular-nums">{generalNote.length} ký tự</span>
        </div>
      </div>
    </section>
  );
}
