/**
 * Formatting utilities for curriculum sections and lessons.
 * Decouples structural ordinal numbering (e.g. "[1]") from content titles,
 * making it immediately transparent to instructors when a section or lesson is untitled.
 */

export interface CurriculumDisplayItem {
  /** The bracketed index badge, e.g. "[1]" */
  readonly indexBadge: string;
  /** The natural structural label, e.g. "Section 1" or "Lesson 1" */
  readonly ordinalLabel: string;
  /** The raw trimmed user-provided title */
  readonly title: string;
  /** The display title shown in UI; falls back to "Untitled Section" or "Untitled Lesson" */
  readonly displayTitle: string;
  /** Whether the user has not entered a title yet */
  readonly isUntitled: boolean;
  /** Learner-facing full label, e.g. "Section 1: Introduction" */
  readonly learnerPreview: string;
}

export const formatSectionDisplay = (
  title: string | undefined | null,
  index: number,
): CurriculumDisplayItem => {
  const trimmed = (title ?? '').trim();
  const num = index + 1;
  const ordinalLabel = `Section ${String(num)}`;
  const isUntitled = trimmed.length === 0;
  const displayTitle = isUntitled ? 'Untitled Section' : trimmed;

  return {
    indexBadge: `[${String(num)}]`,
    ordinalLabel,
    title: trimmed,
    displayTitle,
    isUntitled,
    learnerPreview: `${ordinalLabel}: ${displayTitle}`,
  };
};

export const formatLessonDisplay = (
  title: string | undefined | null,
  lessonIndex: number,
): CurriculumDisplayItem => {
  const trimmed = (title ?? '').trim();
  const num = lessonIndex + 1;
  const ordinalLabel = `Lesson ${String(num)}`;
  const isUntitled = trimmed.length === 0;
  const displayTitle = isUntitled ? 'Untitled Lesson' : trimmed;

  return {
    indexBadge: `[${String(num)}]`,
    ordinalLabel,
    title: trimmed,
    displayTitle,
    isUntitled,
    learnerPreview: displayTitle,
  };
};
