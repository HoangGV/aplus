import React, { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { GradingScaleId } from "../types/grade";
import { GRADING_SCALES, GRADING_SCALE_LIST } from "../utils/gradingScales";

interface ScaleSelectorBarProps {
  scaleId: GradingScaleId;
  onChangeScale: (scaleId: GradingScaleId) => void;
}

export default function ScaleSelectorBar({
  scaleId,
  onChangeScale,
}: ScaleSelectorBarProps) {
  const [showTable, setShowTable] = useState(false);
  const activeScale = GRADING_SCALES[scaleId];

  return (
    <section
      aria-label="Chọn thang điểm quy đổi"
      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            <SlidersHorizontal
              className="h-4 w-4 text-[#4169E1] dark:text-[#6F8FF2]"
              aria-hidden="true"
            />
            <label htmlFor="grading-scale-select">Thang điểm quy đổi</label>
          </div>

          <select
            id="grading-scale-select"
            value={scaleId}
            onChange={(e) => onChangeScale(e.target.value as GradingScaleId)}
            className="min-h-[42px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-900 transition-colors hover:border-slate-300 focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 sm:w-auto sm:min-w-[300px] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#6F8FF2] dark:focus:bg-slate-900"
          >
            {GRADING_SCALE_LIST.map((scale) => (
              <option
                key={scale.id}
                value={scale.id}
                className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
              >
                {scale.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums">
            {activeScale.levels.map((lvl, index) => (
              <span key={lvl.letter} className="inline-flex items-center gap-1">
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {lvl.letter}
                </span>
                <span>{lvl.gpa4.toFixed(1)}</span>
                {index < activeScale.levels.length - 1 && (
                  <span
                    className="ml-2 text-slate-300 dark:text-slate-700"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowTable((prev) => !prev)}
            className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#4169E1] transition-colors hover:bg-[#4169E1]/10 dark:text-[#9EB4FA] dark:hover:bg-[#4169E1]/15"
          >
            <span>{showTable ? "Thu gọn bảng quy đổi" : "Chi tiết quy đổi"}</span>
            {showTable ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {showTable && (
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-4 font-medium">Điểm chữ</th>
                  <th className="py-2 pr-4 font-medium">Thang điểm 10</th>
                  <th className="py-2 pr-4 font-medium">Quy đổi hệ 4</th>
                  <th className="py-2 font-medium">Điều kiện học cải thiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {activeScale.levels.map((lvl) => {
                  const locked = lvl.gpa4 >= 3.0;
                  return (
                    <tr key={lvl.letter} className="text-slate-700 dark:text-slate-300">
                      <td className="py-2 pr-4 font-mono font-semibold text-slate-900 dark:text-white">
                        {lvl.letter}
                      </td>
                      <td className="py-2 pr-4 font-mono tabular-nums">
                        {lvl.rangeLabel}
                      </td>
                      <td className="py-2 pr-4 font-mono font-medium tabular-nums">
                        {lvl.gpa4.toFixed(1)}
                      </td>
                      <td className="py-2">
                        {locked ? (
                          <span className="text-slate-500 dark:text-slate-400">
                            Không thuộc diện cải thiện (≥ B)
                          </span>
                        ) : (
                          <span className="text-[#4169E1] dark:text-[#9EB4FA] font-medium">
                            Được phép đăng ký cải thiện
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
