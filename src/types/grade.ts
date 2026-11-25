export type GradingScaleId = "abcdf" | "plus_standard" | "plus_detailed";

export interface GradeLevel {
  letter: string;
  gpa4: number;
  min10: number;
  max10: number;
  rangeLabel: string;
}

export interface GradingScale {
  id: GradingScaleId;
  name: string;
  shortName: string;
  levels: GradeLevel[];
}

export interface CourseRecord {
  id: string;
  stableKey: string;
  code: string;
  name: string;
  credits: number;
  rawScore10: number | null;
  rawLetter: string;
  semesterId: string;
}

export interface SemesterRecord {
  id: string;
  label: string;
  courses: CourseRecord[];
}

export interface TranscriptData {
  fileName: string;
  uploadedAt: string;
  semesters: SemesterRecord[];
}

export interface ComputedCourse extends CourseRecord {
  hasGrade: boolean;
  letterGrade: string;
  gpa4: number;
  isEligibleForImprovement: boolean;
  improvedLetter: string | null;
  improvedGpa4: number | null;
  effectiveGpa4: number;
  effectiveLetter: string;
  pointGain: number;
}

export interface ComputedSemester {
  id: string;
  label: string;
  courses: ComputedCourse[];
  totalCredits: number;
  countedCredits: number;
  currentGpa: number;
  projectedGpa: number;
  eligibleCount: number;
  plannedCount: number;
}

export interface OverallSummary {
  currentCpa: number;
  projectedCpa: number;
  cpaDelta: number;
  totalCredits: number;
  countedCredits: number;
  totalCourses: number;
  eligibleCoursesCount: number;
  lockedCoursesCount: number;
  plannedCoursesCount: number;
  plannedCredits: number;
  currentTotalPoints: number;
  projectedTotalPoints: number;
  classificationCurrent: string;
  classificationProjected: string;
}

export interface TargetPreset {
  id: string;
  label: string;
  value: number;
}
