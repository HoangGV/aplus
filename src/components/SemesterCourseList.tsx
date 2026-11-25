import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import {
  ComputedCourse,
  ComputedSemester,
  CourseRecord,
  GradingScaleId,
  OverallSummary,
} from "../types/grade";
import {
  getImprovementOptions,
  GRADING_SCALES,
} from "../utils/gradingScales";

type FilterMode = "all" | "eligible" | "planned" | "locked";

interface SemesterCourseListProps {
  semesters: ComputedSemester[];
  summary: OverallSummary;
  scaleId: GradingScaleId;
  courseNotes: Record<string, string>;
  onChangeImprovement: (stableKey: string, letter: string) => void;
  onChangeCourseNote: (stableKey: string, note: string) => void;
  onResetImprovements: () => void;
  onAddCourseToSemester: (semesterId: string) => void;
  onEditCourse: (course: CourseRecord) => void;
  onDeleteCourse: (semesterId: string, courseId: string) => void;
  onAddSemester: () => void;
  onDeleteSemester: (semesterId: string) => void;
}

function getGradeTextColor(gpa4: number, hasGrade: boolean): string {
  if (!hasGrade) return "text-slate-400 dark:text-slate-500";
  if (gpa4 >= 3.5) return "text-emerald-700 dark:text-emerald-400";
  if (gpa4 >= 3.0) return "text-[#4169E1] dark:text-[#9EB4FA]";
  if (gpa4 >= 2.0) return "text-amber-700 dark:text-amber-400";
  return "text-rose-700 dark:text-rose-400";
}

export default function SemesterCourseList({
  semesters,
  summary,
  scaleId,
  courseNotes,
  onChangeImprovement,
  onChangeCourseNote,
  onResetImprovements,
  onAddCourseToSemester,
  onEditCourse,
  onDeleteCourse,
  onAddSemester,
  onDeleteSemester,
}: SemesterCourseListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [collapsedSemesters, setCollapsedSemesters] = useState<
    Record<string, boolean>
  >({});

  const activeScale = GRADING_SCALES[scaleId];

  const toggleSemester = (semesterId: string) => {
    setCollapsedSemesters((prev) => ({
      ...prev,
      [semesterId]: !prev[semesterId],
    }));
  };

  const filteredSemesters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const isFiltering = filterMode !== "all" || query.length > 0;

    return semesters
      .map((semester) => {
        const filteredCourses = semester.courses.filter((course) => {
          if (filterMode === "eligible" && !course.isEligibleForImprovement) {
            return false;
          }
          if (filterMode === "planned" && course.improvedLetter === null) {
            return false;
          }
          if (
            filterMode === "locked" &&
            (!course.hasGrade || course.isEligibleForImprovement)
          ) {
            return false;
          }
          if (query) {
            const haystack = `${course.code} ${course.name}`.toLowerCase();
            if (!haystack.includes(query)) return false;
          }
          return true;
        });

        return {
          ...semester,
          visibleCourses: filteredCourses,
        };
      })
      .filter((sem) => (!isFiltering ? true : sem.visibleCourses.length > 0));
  }, [semesters, searchQuery, filterMode]);

  const filterTabs: { id: FilterMode; label: string; count: number }[] = [
    { id: "all", label: "Tất cả", count: summary.totalCourses },
    {
      id: "eligible",
      label: "Diện cải thiện (< B)",
      count: summary.eligibleCoursesCount,
    },
    {
      id: "planned",
      label: "Đang chọn cải thiện",
      count: summary.plannedCoursesCount,
    },
    {
      id: "locked",
      label: "Đạt chuẩn (≥ B)",
      count: summary.lockedCoursesCount,
    },
  ];

  const renderImprovementControl = (
    course: ComputedCourse,
    isMobile = false
  ) => {
    if (!course.hasGrade) {
      return (
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Chưa có điểm
        </span>
      );
    }

    if (!course.isEligibleForImprovement) {
      return (
        <div
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
          title="Học phần đạt từ điểm B trở lên không thuộc diện cải thiện"
        >
          <select
            disabled
            aria-label={`Học phần ${course.name} không thuộc diện cải thiện`}
            title="Học phần đạt từ điểm B trở lên không thuộc diện cải thiện"
            value=""
            className="sr-only"
            tabIndex={-1}
          >
            <option
              value=""
              className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
            >
              Không cải thiện
            </option>
          </select>
          <Lock
            className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <span className="font-medium text-slate-600 dark:text-slate-400">
            Đạt chuẩn (≥ B)
          </span>
        </div>
      );
    }

    const options = getImprovementOptions(course.gpa4, activeScale);
    const selectedValue = course.improvedLetter || "";

    return (
      <div className={`flex items-center gap-2 ${isMobile ? "w-full" : ""}`}>
        <select
          aria-label={`Chọn điểm cải thiện dự kiến cho ${course.name}`}
          value={selectedValue}
          onChange={(e) =>
            onChangeImprovement(course.stableKey, e.target.value)
          }
          className={`min-h-[38px] rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#4169E1]/25 ${
            isMobile ? "min-h-[44px] w-full text-sm" : "w-[150px]"
          } ${
            selectedValue
              ? "border-[#4169E1] bg-royal-50 text-[#4169E1] dark:border-[#6F8FF2] dark:bg-[#172546] dark:text-[#C4D1FD]"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
          }`}
        >
          <option
            value=""
            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
          >
            Giữ nguyên ({course.letterGrade})
          </option>
          {options.map((lvl) => (
            <option
              key={lvl.letter}
              value={lvl.letter}
              className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
            >
              Lên {lvl.letter} ({lvl.gpa4.toFixed(1)})
            </option>
          ))}
        </select>

        {course.pointGain > 0 && (
          <span className="shrink-0 font-mono text-xs font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
            +{course.pointGain.toFixed(1)}
          </span>
        )}
      </div>
    );
  };

  return (
    <section aria-label="Bảng điểm chi tiết theo học kỳ" className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {filterTabs.map((tab) => {
            const active = filterMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={`min-h-[36px] whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors tabular-nums ${
                  active
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                {tab.label}{" "}
                <span className="ml-0.5 font-mono text-[11px] opacity-70">
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:w-60">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên hoặc mã học phần..."
              aria-label="Tìm kiếm học phần"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#6F8FF2]"
            />
          </div>

          {summary.plannedCoursesCount > 0 && (
            <button
              type="button"
              onClick={onResetImprovements}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Đặt lại cải thiện</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty Filter Result */}
      {filteredSemesters.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Không tìm thấy học phần phù hợp với bộ lọc hiện tại.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Thử đổi từ khóa tìm kiếm hoặc chuyển về chế độ xem Tất cả học phần.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterMode("all");
            }}
            className="mt-4 inline-flex min-h-[38px] items-center rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Xem toàn bộ học phần
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSemesters.map((semester) => {
            const isCollapsed = !!collapsedSemesters[semester.id];
            const semHasGain =
              semester.projectedGpa > semester.currentGpa + 0.001;

            return (
              <article
                key={semester.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Semester Header */}
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSemester(semester.id)}
                    aria-expanded={!isCollapsed}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    {isCollapsed ? (
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDown
                        className="h-4 w-4 shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
                        {semester.label}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        {semester.courses.length} học phần ·{" "}
                        {semester.totalCredits} tín chỉ
                        {semester.courses.length === 0
                          ? " · Chưa có học phần"
                          : semester.eligibleCount > 0
                            ? ` · ${semester.eligibleCount} môn dưới B`
                            : " · Tất cả đạt chuẩn ≥ B"}
                      </p>
                    </div>
                  </button>

                  <div className="flex flex-wrap items-center justify-between gap-3 pl-6 sm:justify-end sm:pl-0">
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        <span>GPA kỳ: </span>
                        <strong className="font-mono text-sm font-bold text-slate-900 tabular-nums dark:text-white">
                          {semester.currentGpa.toFixed(2)}
                        </strong>
                      </div>

                      {semHasGain && (
                        <div className="text-xs text-[#4169E1] dark:text-[#9EB4FA]">
                          <span>Dự kiến: </span>
                          <strong className="font-mono text-sm font-bold tabular-nums">
                            {semester.projectedGpa.toFixed(2)}
                          </strong>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onAddCourseToSemester(semester.id)}
                        className="inline-flex min-h-[34px] items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-[#4169E1] transition-colors hover:border-[#4169E1]/40 hover:bg-[#4169E1]/[0.06] dark:border-slate-700 dark:bg-slate-800 dark:text-[#9EB4FA] dark:hover:bg-slate-700"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Thêm môn</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteSemester(semester.id)}
                        aria-label={`Xóa ${semester.label}`}
                        title={`Xóa ${semester.label}`}
                        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="border-t border-slate-200 dark:border-slate-800">
                    {semester.visibleCourses.length === 0 ? (
                      <div className="px-5 py-6 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Học kỳ này chưa có học phần nào.
                        </p>
                        <button
                          type="button"
                          onClick={() => onAddCourseToSemester(semester.id)}
                          className="mt-2.5 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#4169E1]/10 px-3 py-1.5 text-xs font-semibold text-[#4169E1] hover:bg-[#4169E1]/15 dark:bg-[#4169E1]/20 dark:text-[#9EB4FA]"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Thêm học phần đầu tiên</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden overflow-x-auto md:block">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                                <th className="py-3 pl-5 pr-3">Học phần</th>
                                <th className="px-3 py-3 text-right">TC</th>
                                <th className="px-3 py-3 text-right">
                                  Điểm gốc
                                </th>
                                <th className="px-3 py-3 text-right">Hệ 4</th>
                                <th className="px-3 py-3">
                                  Điểm cải thiện dự kiến
                                </th>
                                <th className="px-3 py-3">
                                  Ghi chú kế hoạch cải thiện
                                </th>
                                <th className="py-3 pl-2 pr-5 text-right">
                                  Thao tác
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                              {semester.visibleCourses.map((course) => {
                                const isPlanned = course.improvedLetter !== null;
                                const noteValue =
                                  courseNotes[course.stableKey] || "";

                                return (
                                  <tr
                                    key={course.id}
                                    className={`transition-colors ${
                                      isPlanned
                                        ? "bg-[#4169E1]/[0.03] dark:bg-[#4169E1]/[0.07]"
                                        : "hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                                    }`}
                                  >
                                    <td className="py-3.5 pl-5 pr-3 align-middle">
                                      <div className="font-medium text-slate-900 dark:text-slate-100">
                                        {course.name}
                                      </div>
                                      {course.code && (
                                        <div className="mt-0.5 font-mono text-xs text-slate-400 dark:text-slate-500">
                                          {course.code}
                                        </div>
                                      )}
                                    </td>

                                    <td className="px-3 py-3.5 text-right align-middle font-mono text-sm text-slate-700 tabular-nums dark:text-slate-300">
                                      {course.credits}
                                    </td>

                                    <td className="px-3 py-3.5 text-right align-middle font-mono tabular-nums">
                                      <span
                                        className={`font-bold ${getGradeTextColor(
                                          course.gpa4,
                                          course.hasGrade
                                        )}`}
                                      >
                                        {course.hasGrade
                                          ? course.letterGrade
                                          : "—"}
                                      </span>
                                      {course.rawScore10 !== null && (
                                        <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
                                          ({course.rawScore10.toFixed(1)})
                                        </span>
                                      )}
                                    </td>

                                    <td className="px-3 py-3.5 text-right align-middle font-mono text-sm font-semibold text-slate-800 tabular-nums dark:text-slate-200">
                                      {course.hasGrade
                                        ? course.gpa4.toFixed(1)
                                        : "—"}
                                    </td>

                                    <td className="px-3 py-3.5 align-middle">
                                      {renderImprovementControl(course, false)}
                                    </td>

                                    <td className="px-3 py-3.5 align-middle">
                                      {course.isEligibleForImprovement ? (
                                        <input
                                          type="text"
                                          value={noteValue}
                                          onChange={(e) =>
                                            onChangeCourseNote(
                                              course.stableKey,
                                              e.target.value
                                            )
                                          }
                                          placeholder="VD: Đăng ký học lại kỳ hè..."
                                          aria-label={`Ghi chú cải thiện cho ${course.name}`}
                                          className="h-9 w-full min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 transition-colors focus:border-[#4169E1] focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#6F8FF2]"
                                        />
                                      ) : (
                                        <span className="text-xs text-slate-400 dark:text-slate-500">
                                          Không cần cải thiện
                                        </span>
                                      )}
                                    </td>

                                    <td className="py-3.5 pl-2 pr-5 text-right align-middle">
                                      <div className="inline-flex items-center justify-end gap-1">
                                        <button
                                          type="button"
                                          onClick={() => onEditCourse(course)}
                                          aria-label={`Chỉnh sửa môn ${course.name}`}
                                          title="Chỉnh sửa học phần"
                                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                        >
                                          <Pencil
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                          />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onDeleteCourse(
                                              semester.id,
                                              course.id
                                            )
                                          }
                                          aria-label={`Xóa môn ${course.name}`}
                                          title="Xóa học phần"
                                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                                        >
                                          <Trash2
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Stacked Cards View */}
                        <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-800">
                          {semester.visibleCourses.map((course) => {
                            const isPlanned = course.improvedLetter !== null;
                            const noteValue =
                              courseNotes[course.stableKey] || "";

                            return (
                              <div
                                key={course.id}
                                className={`space-y-3 p-4 ${
                                  isPlanned
                                    ? "bg-[#4169E1]/[0.04] dark:bg-[#4169E1]/[0.08]"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                      {course.name}
                                    </h4>
                                    <p className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                                      {course.code ? `${course.code} · ` : ""}
                                      {course.credits} tín chỉ
                                      {course.rawScore10 !== null
                                        ? ` · Hệ 10: ${course.rawScore10.toFixed(1)}`
                                        : ""}
                                    </p>
                                  </div>

                                  <div className="flex shrink-0 items-start gap-2">
                                    <div className="text-right font-mono tabular-nums">
                                      <div
                                        className={`text-base font-bold ${getGradeTextColor(
                                          course.gpa4,
                                          course.hasGrade
                                        )}`}
                                      >
                                        {course.hasGrade
                                          ? course.letterGrade
                                          : "—"}
                                      </div>
                                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {course.hasGrade
                                          ? `Hệ 4: ${course.gpa4.toFixed(1)}`
                                          : "Chưa tính"}
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => onEditCourse(course)}
                                      aria-label={`Chỉnh sửa môn ${course.name}`}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                                    >
                                      <Pencil
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onDeleteCourse(semester.id, course.id)
                                      }
                                      aria-label={`Xóa môn ${course.name}`}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-rose-500 dark:border-slate-700 dark:text-rose-400"
                                    >
                                      <Trash2
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                      />
                                    </button>
                                  </div>
                                </div>

                                {course.isEligibleForImprovement ? (
                                  <div className="space-y-2.5 pt-1">
                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                                        Điểm cải thiện dự kiến
                                      </label>
                                      {renderImprovementControl(course, true)}
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                                        Ghi chú cải thiện
                                      </label>
                                      <input
                                        type="text"
                                        value={noteValue}
                                        onChange={(e) =>
                                          onChangeCourseNote(
                                            course.stableKey,
                                            e.target.value
                                          )
                                        }
                                        placeholder="VD: Đăng ký học lại kỳ hè..."
                                        aria-label={`Ghi chú cải thiện cho ${course.name}`}
                                        className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#4169E1] focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="pt-0.5">
                                    {renderImprovementControl(course, true)}
                                    {course.hasGrade && (
                                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                        Học phần đạt từ điểm B trở lên không
                                        thuộc diện cải thiện.
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {/* Add New Semester Button */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={onAddSemester}
              className="inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#4169E1] hover:text-[#4169E1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-[#6F8FF2] dark:hover:text-[#9EB4FA]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Thêm học kỳ mới</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
