import React, { useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  PenLine,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { OverallSummary, TranscriptData } from "../types/grade";

interface FileUploadCardProps {
  transcript: TranscriptData | null;
  summary: OverallSummary;
  isParsing: boolean;
  error: string | null;
  onFileSelected: (file: File) => void;
  onClearTranscript: () => void;
  onDownloadSample: () => void;
  onLoadSamplePreview: () => void;
  onOpenManualEntry: () => void;
}

export default function FileUploadCard({
  transcript,
  summary,
  isParsing,
  error,
  onFileSelected,
  onClearTranscript,
  onDownloadSample,
  onLoadSamplePreview,
  onOpenManualEntry,
}: FileUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <section
      aria-label="Tải lên tệp bảng điểm hoặc nhập thủ công"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-2xl border bg-white transition-colors dark:bg-slate-900 ${
        isDragging
          ? "border-[#4169E1] bg-[#4169E1]/[0.04] dark:border-[#6F8FF2] dark:bg-[#4169E1]/10"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.tsv,.txt"
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Chọn tệp bảng điểm"
      />

      {!transcript ? (
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4169E1]/10 text-[#4169E1] dark:bg-[#4169E1]/20 dark:text-[#9EB4FA]">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </div>

            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Tải lên tệp bảng điểm hoặc nhập điểm thủ công
            </h2>
            <p className="mt-1.5 max-w-lg text-sm text-slate-600 dark:text-slate-400">
              Kéo thả tệp vào khung này, chọn tệp từ thiết bị hoặc thêm từng học
              phần thủ công để tính GPA, CPA và lập kế hoạch cải thiện.
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Hỗ trợ định dạng: Excel (.xlsx, .xls) · CSV · TSV · TXT
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleBrowseClick}
                disabled={isParsing}
                className="inline-flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-lg bg-[#4169E1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3457C8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] focus-visible:ring-offset-2 disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                <span>
                  {isParsing ? "Đang đọc tệp..." : "Chọn tệp bảng điểm"}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenManualEntry}
                className="inline-flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-lg border border-[#4169E1]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#4169E1] transition-colors hover:bg-[#4169E1]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] dark:border-[#6F8FF2]/40 dark:bg-slate-900 dark:text-[#9EB4FA] dark:hover:bg-[#4169E1]/15"
              >
                <PenLine className="h-4 w-4" aria-hidden="true" />
                <span>Nhập điểm thủ công</span>
              </button>

              <button
                type="button"
                onClick={onDownloadSample}
                className="inline-flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Tải tệp mẫu (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={onLoadSamplePreview}
                className="inline-flex min-h-[42px] items-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Xem thử dữ liệu mẫu
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4169E1]/10 text-[#4169E1] dark:bg-[#4169E1]/20 dark:text-[#9EB4FA]">
              <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {transcript.fileName}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {transcript.semesters.length} học kỳ · {summary.totalCourses}{" "}
                học phần · {summary.countedCredits} tín chỉ tính điểm
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenManualEntry}
              className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#4169E1] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3457C8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1]"
            >
              <PenLine className="h-4 w-4" aria-hidden="true" />
              <span>Nhập điểm thủ công</span>
            </button>
            <button
              type="button"
              onClick={handleBrowseClick}
              disabled={isParsing}
              className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw
                className={`h-4 w-4 ${isParsing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>Tải tệp khác</span>
            </button>
            <button
              type="button"
              onClick={onClearTranscript}
              className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Xóa dữ liệu</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mx-5 mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
