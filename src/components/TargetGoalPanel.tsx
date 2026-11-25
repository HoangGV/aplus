import React from "react";
import { ArrowUpRight, CheckCircle2, Info, Target } from "lucide-react";
import { OverallSummary } from "../types/grade";
import {
  getAcademicClassification,
  TARGET_PRESETS,
} from "../utils/gradingScales";

interface TargetGoalPanelProps {
  summary: OverallSummary;
  targetCpa: number;
  onChangeTargetCpa: (value: number) => void;
}

export default function TargetGoalPanel({
  summary,
  targetCpa,
  onChangeTargetCpa,
}: TargetGoalPanelProps) {
  const safeTarget = Math.max(0, Math.min(4, targetCpa));
  const currentPct = Math.min(100, (summary.currentCpa / 4) * 100);
  const projectedPct = Math.min(100, (summary.projectedCpa / 4) * 100);
  const targetPct = Math.min(100, (safeTarget / 4) * 100);

  const hasImprovement = summary.cpaDelta > 0.0001;
  const targetReachedCurrent =
    summary.countedCredits > 0 && summary.currentCpa >= safeTarget - 0.0001;
  const targetReachedProjected =
    summary.countedCredits > 0 && summary.projectedCpa >= safeTarget - 0.0001;

  const gapToTarget = Math.max(0, safeTarget - summary.projectedCpa);
  const neededWeightedPoints = Math.max(
    0,
    safeTarget * summary.countedCredits - summary.projectedTotalPoints
  );

  // Credits needed if improving C (2.0) -> A (4.0) (gain +2.0 per credit)
  const approxCreditsCtoA =
    neededWeightedPoints > 0 ? Math.ceil(neededWeightedPoints / 2.0) : 0;

  // Additional new credits at A (4.0) needed if keeping existing grades
  const approxNewACredits =
    neededWeightedPoints > 0 && safeTarget < 4.0
      ? Math.ceil(neededWeightedPoints / (4.0 - safeTarget))
      : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (Number.isNaN(val)) {
      onChangeTargetCpa(0);
      return;
    }
    const clamped = Math.max(0, Math.min(4, Math.round(val * 100) / 100));
    onChangeTargetCpa(clamped);
  };

  return (
    <section
      aria-label="Tổng quan CPA và mục tiêu cải thiện"
      className="space-y-4"
    >
      {/* 4-Column KPI Summary Strip (Single Elevation, Hairline Dividers) */}
      <div className="grid grid-cols-2 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:divide-y-0 lg:grid-cols-4 lg:divide-x dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        <div className="p-5 border-r border-slate-200 lg:border-r-0 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            CPA hiện tại
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 sm:text-3xl tabular-nums dark:text-white">
              {summary.currentCpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / 4.00
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
            Xếp loại: {summary.classificationCurrent}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            CPA sau cải thiện dự kiến
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#4169E1] sm:text-3xl tabular-nums dark:text-[#6F8FF2]">
              {summary.projectedCpa.toFixed(2)}
            </span>
            {hasImprovement && (
              <span className="inline-flex items-center font-mono text-xs font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />+
                {summary.cpaDelta.toFixed(2)}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
            {hasImprovement
              ? `Xếp loại dự kiến: ${summary.classificationProjected}`
              : "Chưa chọn môn cải thiện"}
          </p>
        </div>

        <div className="p-5 border-r border-slate-200 lg:border-r-0 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            CPA mục tiêu
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 sm:text-3xl tabular-nums dark:text-white">
              {safeTarget.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {getAcademicClassification(safeTarget)}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
            {targetReachedProjected
              ? "Đã đạt mục tiêu đề ra"
              : `Còn thiếu ${gapToTarget.toFixed(2)} điểm CPA`}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tín chỉ &amp; học phần
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 sm:text-3xl tabular-nums dark:text-white">
              {summary.countedCredits}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              tín chỉ
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
            {summary.eligibleCoursesCount} môn dưới B ·{" "}
            {summary.plannedCoursesCount} môn dự kiến cải thiện
          </p>
        </div>
      </div>

      {/* Target Selector + Progress Bar Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <Target
              className="h-5 w-5 text-[#4169E1] dark:text-[#6F8FF2]"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Đặt mục tiêu CPA tích lũy
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chọn nhanh mốc xếp loại hoặc nhập điểm mục tiêu riêng của bạn
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {TARGET_PRESETS.map((preset) => {
                const isActive = Math.abs(safeTarget - preset.value) < 0.005;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChangeTargetCpa(preset.value)}
                    className={`min-h-[36px] whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors tabular-nums ${
                      isActive
                        ? "bg-white text-[#4169E1] shadow-sm dark:bg-slate-900 dark:text-[#9EB4FA]"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    {preset.label} ({preset.value.toFixed(2)})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="target-cpa-input"
                className="text-xs font-medium text-slate-600 whitespace-nowrap dark:text-slate-400"
              >
                Tùy chỉnh:
              </label>
              <input
                id="target-cpa-input"
                type="number"
                min={0}
                max={4}
                step={0.05}
                value={safeTarget}
                onChange={handleInputChange}
                className="h-10 w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm font-semibold text-slate-900 tabular-nums focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#6F8FF2]"
              />
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm bg-[#4169E1]"
                  aria-hidden="true"
                />
                <span>
                  Hiện tại:{" "}
                  <strong className="font-mono text-slate-900 tabular-nums dark:text-white">
                    {summary.currentCpa.toFixed(2)}
                  </strong>
                </span>
              </span>
              {hasImprovement && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500"
                    aria-hidden="true"
                  />
                  <span>
                    Dự kiến cải thiện:{" "}
                    <strong className="font-mono text-emerald-700 tabular-nums dark:text-emerald-400">
                      {summary.projectedCpa.toFixed(2)}
                    </strong>
                  </span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-0.5 bg-slate-900 dark:bg-white"
                  aria-hidden="true"
                />
                <span>
                  Mục tiêu:{" "}
                  <strong className="font-mono text-slate-900 tabular-nums dark:text-white">
                    {safeTarget.toFixed(2)}
                  </strong>
                </span>
              </span>
            </div>

            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {safeTarget > 0
                ? `${Math.min(100, Math.round((summary.projectedCpa / safeTarget) * 100))}% mục tiêu`
                : "100% mục tiêu"}
            </span>
          </div>

          <div
            className="relative h-3.5 w-full overflow-visible rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={Number(summary.projectedCpa.toFixed(2))}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-label="Tiến độ CPA so với mục tiêu"
          >
            {/* Projected gain layer */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-200"
              style={{ width: `${projectedPct}%` }}
            />
            {/* Current CPA layer */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#4169E1] transition-all duration-200"
              style={{ width: `${currentPct}%` }}
            />
            {/* Target marker line */}
            <div
              className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-slate-900 dark:bg-white transition-all duration-200"
              style={{ left: `${targetPct}%` }}
              title={`Mốc mục tiêu: ${safeTarget.toFixed(2)}`}
            />
          </div>

          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate-400 tabular-nums dark:text-slate-500">
            <span>0.00</span>
            <span>1.00</span>
            <span>2.00</span>
            <span>3.00</span>
            <span>4.00</span>
          </div>
        </div>

        {/* Actionable Gap Feedback */}
        <div
          className={`mt-4 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
            targetReachedProjected
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
          }`}
        >
          {targetReachedProjected ? (
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          ) : (
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-[#4169E1] dark:text-[#6F8FF2]"
              aria-hidden="true"
            />
          )}

          <div className="leading-relaxed">
            {targetReachedCurrent ? (
              <span>
                Chúc mừng! CPA hiện tại của bạn (
                <strong className="font-mono tabular-nums">
                  {summary.currentCpa.toFixed(2)}
                </strong>
                ) đã đạt mốc mục tiêu{" "}
                <strong className="font-mono tabular-nums">
                  {safeTarget.toFixed(2)}
                </strong>
                {summary.currentCpa > safeTarget + 0.005 && (
                  <>
                    {" "}
                    (dư{" "}
                    <strong className="font-mono tabular-nums">
                      +{(summary.currentCpa - safeTarget).toFixed(2)}
                    </strong>{" "}
                    điểm)
                  </>
                )}
                .
              </span>
            ) : targetReachedProjected ? (
              <span>
                Kế hoạch cải thiện hiện tại giúp CPA dự kiến đạt{" "}
                <strong className="font-mono tabular-nums">
                  {summary.projectedCpa.toFixed(2)}
                </strong>
                , hoàn thành mục tiêu{" "}
                <strong className="font-mono tabular-nums">
                  {safeTarget.toFixed(2)}
                </strong>{" "}
                (tăng{" "}
                <strong className="font-mono tabular-nums">
                  +{summary.cpaDelta.toFixed(2)}
                </strong>{" "}
                điểm với {summary.plannedCredits} tín chỉ cải thiện).
              </span>
            ) : (
              <span>
                Còn thiếu{" "}
                <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                  {gapToTarget.toFixed(2)}
                </strong>{" "}
                điểm CPA (tương đương{" "}
                <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                  {neededWeightedPoints.toFixed(1)}
                </strong>{" "}
                điểm×tín chỉ) để đạt mốc{" "}
                <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                  {safeTarget.toFixed(2)}
                </strong>
                . Ước tính cần cải thiện khoảng{" "}
                <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                  {approxCreditsCtoA} tín chỉ
                </strong>{" "}
                từ C lên A
                {approxNewACredits !== null && (
                  <>
                    , hoặc tích lũy thêm khoảng{" "}
                    <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                      {approxNewACredits} tín chỉ mới
                    </strong>{" "}
                    đạt điểm A (4.0)
                  </>
                )}
                .
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
