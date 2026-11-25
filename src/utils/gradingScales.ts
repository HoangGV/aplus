import {
  ComputedCourse,
  ComputedSemester,
  CourseRecord,
  GradeLevel,
  GradingScale,
  GradingScaleId,
  OverallSummary,
  TargetPreset,
  TranscriptData,
} from "../types/grade";

export const GRADING_SCALES: Record<GradingScaleId, GradingScale> = {
  abcdf: {
    id: "abcdf",
    name: "Thang điểm chữ chuẩn (A, B, C, D, F)",
    shortName: "Hệ chữ chuẩn (ABCDF)",
    levels: [
      { letter: "A", gpa4: 4.0, min10: 8.5, max10: 10.0, rangeLabel: "8.5 – 10.0" },
      { letter: "B", gpa4: 3.0, min10: 7.0, max10: 8.49, rangeLabel: "7.0 – 8.4" },
      { letter: "C", gpa4: 2.0, min10: 5.5, max10: 6.99, rangeLabel: "5.5 – 6.9" },
      { letter: "D", gpa4: 1.0, min10: 4.0, max10: 5.49, rangeLabel: "4.0 – 5.4" },
      { letter: "F", gpa4: 0.0, min10: 0.0, max10: 3.99, rangeLabel: "< 4.0" },
    ],
  },
  plus_standard: {
    id: "plus_standard",
    name: "Thang điểm hệ 4 có dấu cộng phổ biến",
    shortName: "Hệ 4 dấu cộng phổ biến",
    levels: [
      { letter: "A+", gpa4: 4.0, min10: 9.0, max10: 10.0, rangeLabel: "9.0 – 10.0" },
      { letter: "A", gpa4: 4.0, min10: 8.5, max10: 8.99, rangeLabel: "8.5 – 8.9" },
      { letter: "B+", gpa4: 3.5, min10: 8.0, max10: 8.49, rangeLabel: "8.0 – 8.4" },
      { letter: "B", gpa4: 3.0, min10: 7.0, max10: 7.99, rangeLabel: "7.0 – 7.9" },
      { letter: "C+", gpa4: 2.5, min10: 6.5, max10: 6.99, rangeLabel: "6.5 – 6.9" },
      { letter: "C", gpa4: 2.0, min10: 5.5, max10: 6.49, rangeLabel: "5.5 – 6.4" },
      { letter: "D+", gpa4: 1.5, min10: 5.0, max10: 5.49, rangeLabel: "5.0 – 5.4" },
      { letter: "D", gpa4: 1.0, min10: 4.0, max10: 4.99, rangeLabel: "4.0 – 4.9" },
      { letter: "F", gpa4: 0.0, min10: 0.0, max10: 3.99, rangeLabel: "< 4.0" },
    ],
  },
  plus_detailed: {
    id: "plus_detailed",
    name: "Thang điểm hệ 4 chi tiết",
    shortName: "Hệ 4 chi tiết",
    levels: [
      { letter: "A+", gpa4: 4.0, min10: 9.0, max10: 10.0, rangeLabel: "9.0 – 10.0" },
      { letter: "A", gpa4: 3.7, min10: 8.5, max10: 8.99, rangeLabel: "8.5 – 8.9" },
      { letter: "B+", gpa4: 3.5, min10: 8.0, max10: 8.49, rangeLabel: "8.0 – 8.4" },
      { letter: "B", gpa4: 3.0, min10: 7.0, max10: 7.99, rangeLabel: "7.0 – 7.9" },
      { letter: "C+", gpa4: 2.5, min10: 6.5, max10: 6.99, rangeLabel: "6.5 – 6.9" },
      { letter: "C", gpa4: 2.0, min10: 5.5, max10: 6.49, rangeLabel: "5.5 – 6.4" },
      { letter: "D+", gpa4: 1.5, min10: 5.0, max10: 5.49, rangeLabel: "5.0 – 5.4" },
      { letter: "D", gpa4: 1.0, min10: 4.0, max10: 4.99, rangeLabel: "4.0 – 4.9" },
      { letter: "F", gpa4: 0.0, min10: 0.0, max10: 3.99, rangeLabel: "< 4.0" },
    ],
  },
};

export const GRADING_SCALE_LIST: GradingScale[] = [
  GRADING_SCALES.abcdf,
  GRADING_SCALES.plus_standard,
  GRADING_SCALES.plus_detailed,
];

export const TARGET_PRESETS: TargetPreset[] = [
  { id: "tb", label: "Trung bình", value: 2.0 },
  { id: "kha", label: "Khá", value: 2.5 },
  { id: "gioi", label: "Giỏi", value: 3.2 },
  { id: "xs", label: "Xuất sắc", value: 3.6 },
];

export function score10ToLevel(score10: number, scale: GradingScale): GradeLevel {
  for (const level of scale.levels) {
    if (score10 >= level.min10) {
      return level;
    }
  }
  return scale.levels[scale.levels.length - 1];
}

export function normalizeLetterToLevel(
  rawLetter: string,
  scale: GradingScale
): GradeLevel | null {
  const cleaned = rawLetter.trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned) return null;

  const exact = scale.levels.find((l) => l.letter === cleaned);
  if (exact) return exact;

  // Map plus/minus letters gracefully when switching to ABCDF or other scales
  const baseLetter = cleaned.charAt(0);
  if (["A", "B", "C", "D", "F"].includes(baseLetter)) {
    const baseMatch = scale.levels.find((l) => l.letter === baseLetter);
    if (baseMatch) return baseMatch;
  }

  return null;
}

export function resolveCourseGrade(
  course: CourseRecord,
  scale: GradingScale
): { hasGrade: boolean; letterGrade: string; gpa4: number } {
  if (course.rawScore10 !== null && !Number.isNaN(course.rawScore10)) {
    const clamped = Math.max(0, Math.min(10, course.rawScore10));
    const level = score10ToLevel(clamped, scale);
    return { hasGrade: true, letterGrade: level.letter, gpa4: level.gpa4 };
  }

  if (course.rawLetter) {
    const level = normalizeLetterToLevel(course.rawLetter, scale);
    if (level) {
      return { hasGrade: true, letterGrade: level.letter, gpa4: level.gpa4 };
    }
  }

  return { hasGrade: false, letterGrade: "", gpa4: 0 };
}

/**
 * Rule: Any course with grade >= B (GPA >= 3.0, including B, B+, A, A+)
 * is NOT eligible for grade improvement.
 */
export function isEligibleForImprovement(
  gpa4: number,
  hasGrade: boolean
): boolean {
  return hasGrade && gpa4 < 3.0;
}

/**
 * Returns selectable improvement target grades strictly higher than current GPA
 */
export function getImprovementOptions(
  currentGpa4: number,
  scale: GradingScale
): GradeLevel[] {
  return scale.levels.filter((level) => level.gpa4 > currentGpa4);
}

export function getAcademicClassification(cpa: number): string {
  if (cpa >= 3.6) return "Xuất sắc";
  if (cpa >= 3.2) return "Giỏi";
  if (cpa >= 2.5) return "Khá";
  if (cpa >= 2.0) return "Trung bình";
  if (cpa >= 1.0) return "Yếu";
  return "Chưa xếp loại";
}

export function computeTranscriptMetrics(
  transcript: TranscriptData | null,
  scaleId: GradingScaleId,
  improvements: Record<string, string>
): { semesters: ComputedSemester[]; summary: OverallSummary } {
  const scale = GRADING_SCALES[scaleId] || GRADING_SCALES.abcdf;

  if (!transcript || transcript.semesters.length === 0) {
    return {
      semesters: [],
      summary: {
        currentCpa: 0,
        projectedCpa: 0,
        cpaDelta: 0,
        totalCredits: 0,
        countedCredits: 0,
        totalCourses: 0,
        eligibleCoursesCount: 0,
        lockedCoursesCount: 0,
        plannedCoursesCount: 0,
        plannedCredits: 0,
        currentTotalPoints: 0,
        projectedTotalPoints: 0,
        classificationCurrent: "Chưa xếp loại",
        classificationProjected: "Chưa xếp loại",
      },
    };
  }

  let allTotalCredits = 0;
  let allCountedCredits = 0;
  let allCurrentPoints = 0;
  let allProjectedPoints = 0;
  let totalCourses = 0;
  let eligibleCoursesCount = 0;
  let lockedCoursesCount = 0;
  let plannedCoursesCount = 0;
  let plannedCredits = 0;

  const computedSemesters: ComputedSemester[] = transcript.semesters.map(
    (semester) => {
      let semTotalCredits = 0;
      let semCountedCredits = 0;
      let semCurrentPoints = 0;
      let semProjectedPoints = 0;
      let semEligibleCount = 0;
      let semPlannedCount = 0;

      const computedCourses: ComputedCourse[] = semester.courses.map(
        (course) => {
          const { hasGrade, letterGrade, gpa4 } = resolveCourseGrade(
            course,
            scale
          );
          const eligible = isEligibleForImprovement(gpa4, hasGrade);

          let improvedLetter: string | null = null;
          let improvedGpa4: number | null = null;

          if (eligible) {
            const selectedRaw = improvements[course.stableKey];
            if (selectedRaw) {
              const targetLevel = normalizeLetterToLevel(selectedRaw, scale);
              if (targetLevel && targetLevel.gpa4 > gpa4) {
                improvedLetter = targetLevel.letter;
                improvedGpa4 = targetLevel.gpa4;
              }
            }
          }

          const effectiveGpa4 = improvedGpa4 !== null ? improvedGpa4 : gpa4;
          const effectiveLetter =
            improvedLetter !== null ? improvedLetter : letterGrade;
          const pointGain =
            improvedGpa4 !== null
              ? (improvedGpa4 - gpa4) * course.credits
              : 0;

          totalCourses += 1;
          semTotalCredits += course.credits;
          allTotalCredits += course.credits;

          if (hasGrade) {
            semCountedCredits += course.credits;
            allCountedCredits += course.credits;
            semCurrentPoints += gpa4 * course.credits;
            allCurrentPoints += gpa4 * course.credits;
            semProjectedPoints += effectiveGpa4 * course.credits;
            allProjectedPoints += effectiveGpa4 * course.credits;

            if (eligible) {
              semEligibleCount += 1;
              eligibleCoursesCount += 1;
              if (improvedGpa4 !== null) {
                semPlannedCount += 1;
                plannedCoursesCount += 1;
                plannedCredits += course.credits;
              }
            } else {
              lockedCoursesCount += 1;
            }
          }

          return {
            ...course,
            hasGrade,
            letterGrade,
            gpa4,
            isEligibleForImprovement: eligible,
            improvedLetter,
            improvedGpa4,
            effectiveGpa4,
            effectiveLetter,
            pointGain,
          };
        }
      );

      // Preserve exact original GPA formula: totalCredits > 0 ? totalPoints / totalCredits : 0
      const currentGpa =
        semCountedCredits > 0 ? semCurrentPoints / semCountedCredits : 0;
      const projectedGpa =
        semCountedCredits > 0 ? semProjectedPoints / semCountedCredits : 0;

      return {
        id: semester.id,
        label: semester.label,
        courses: computedCourses,
        totalCredits: semTotalCredits,
        countedCredits: semCountedCredits,
        currentGpa,
        projectedGpa,
        eligibleCount: semEligibleCount,
        plannedCount: semPlannedCount,
      };
    }
  );

  // Preserve exact original CPA formula: totalCredits > 0 ? totalPoints / totalCredits : 0
  const currentCpa =
    allCountedCredits > 0 ? allCurrentPoints / allCountedCredits : 0;
  const projectedCpa =
    allCountedCredits > 0 ? allProjectedPoints / allCountedCredits : 0;
  const cpaDelta = Math.max(0, projectedCpa - currentCpa);

  return {
    semesters: computedSemesters,
    summary: {
      currentCpa,
      projectedCpa,
      cpaDelta,
      totalCredits: allTotalCredits,
      countedCredits: allCountedCredits,
      totalCourses,
      eligibleCoursesCount,
      lockedCoursesCount,
      plannedCoursesCount,
      plannedCredits,
      currentTotalPoints: allCurrentPoints,
      projectedTotalPoints: allProjectedPoints,
      classificationCurrent:
        allCountedCredits > 0
          ? getAcademicClassification(currentCpa)
          : "Chưa xếp loại",
      classificationProjected:
        allCountedCredits > 0
          ? getAcademicClassification(projectedCpa)
          : "Chưa xếp loại",
    },
  };
}
