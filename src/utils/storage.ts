import { GradingScaleId, TranscriptData } from "../types/grade";

const KEYS = {
  THEME: "aplus-theme",
  SCALE: "aplus-grading-scale",
  TARGET_CPA: "aplus-target-cpa",
  TRANSCRIPT: "aplus-transcript-data",
  IMPROVEMENTS: "aplus-course-improvements",
  COURSE_NOTES: "aplus-course-notes",
  GENERAL_NOTE: "aplus-general-note",
} as const;

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore quota or private-mode errors gracefully
  }
}

export function loadTheme(): "light" | "dark" {
  try {
    return localStorage.getItem(KEYS.THEME) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function saveTheme(theme: "light" | "dark"): void {
  safeWrite(KEYS.THEME, theme);
}

export function loadGradingScale(): GradingScaleId {
  try {
    const raw = localStorage.getItem(KEYS.SCALE);
    if (raw === "abcdf" || raw === "plus_standard" || raw === "plus_detailed") {
      return raw;
    }
    return "abcdf";
  } catch {
    return "abcdf";
  }
}

export function saveGradingScale(scale: GradingScaleId): void {
  safeWrite(KEYS.SCALE, scale);
}

export function loadTargetCpa(): number {
  try {
    const raw = localStorage.getItem(KEYS.TARGET_CPA);
    if (!raw) return 3.2;
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 4) return 3.2;
    return parsed;
  } catch {
    return 3.2;
  }
}

export function saveTargetCpa(target: number): void {
  safeWrite(KEYS.TARGET_CPA, String(target));
}

export function loadTranscriptData(): TranscriptData | null {
  return safeReadJson<TranscriptData | null>(KEYS.TRANSCRIPT, null);
}

export function saveTranscriptData(data: TranscriptData | null): void {
  if (!data) {
    try {
      localStorage.removeItem(KEYS.TRANSCRIPT);
    } catch {
      // Ignore
    }
    return;
  }
  safeWrite(KEYS.TRANSCRIPT, JSON.stringify(data));
}

export function loadCourseImprovements(): Record<string, string> {
  return safeReadJson<Record<string, string>>(KEYS.IMPROVEMENTS, {});
}

export function saveCourseImprovements(map: Record<string, string>): void {
  safeWrite(KEYS.IMPROVEMENTS, JSON.stringify(map));
}

export function loadCourseNotes(): Record<string, string> {
  return safeReadJson<Record<string, string>>(KEYS.COURSE_NOTES, {});
}

export function saveCourseNotes(map: Record<string, string>): void {
  safeWrite(KEYS.COURSE_NOTES, JSON.stringify(map));
}

export function loadGeneralNote(): string {
  try {
    return localStorage.getItem(KEYS.GENERAL_NOTE) || "";
  } catch {
    return "";
  }
}

export function saveGeneralNote(note: string): void {
  safeWrite(KEYS.GENERAL_NOTE, note);
}
