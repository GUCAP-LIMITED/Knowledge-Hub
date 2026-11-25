import {
  type Lesson,
  type Section,
  type SlotFiles,
  missingQuiz,
  requiredSlotsFilled,
} from './upload-content-types';

const SECTION_TITLE_MAX = 200;
const LESSON_TITLE_MAX = 300;

const quizIssues = (lesson: Lesson): readonly string[] =>
  missingQuiz(lesson.quiz, `Quiz "${lesson.title}"`);

/** True when a video/pdf lesson has no media attached yet. */
export const lessonNeedsMedia = (lesson: Lesson): boolean =>
  (lesson.kind === 'video' || lesson.kind === 'pdf') && !lesson.file;

/** Everything blocking publish for one lesson. */
export const lessonIssues = (lesson: Lesson): readonly string[] => {
  const issues: string[] = [];
  if (!lesson.title.trim()) issues.push('All lesson titles');
  if (lesson.title.trim().length > LESSON_TITLE_MAX) {
    issues.push('Lesson titles under 300 characters');
  }
  if (lessonNeedsMedia(lesson)) issues.push('Media for all video/pdf lessons');
  if (lesson.kind === 'quiz') issues.push(...quizIssues(lesson));
  return issues;
};

/** Blocking issues on the section itself (its title and whether it has lessons), not its lessons'. */
export const sectionOwnIssues = (section: Section): readonly string[] => {
  const issues: string[] = [];
  if (!section.title.trim()) issues.push('All section titles');
  if (section.title.trim().length > SECTION_TITLE_MAX) {
    issues.push('Section titles under 200 characters');
  }
  if (section.lessons.length === 0) issues.push('At least one lesson per section');
  return issues;
};

/** True when the section or any of its lessons blocks publishing. */
export const sectionHasIssues = (section: Section): boolean =>
  sectionOwnIssues(section).length > 0 ||
  section.lessons.some((lesson) => lessonIssues(lesson).length > 0);

/** Where in the course studio a blocking issue lives — mirrors the studio's selection shape. */
export type StudioIssueTarget =
  | { readonly type: 'course' }
  | { readonly type: 'section'; readonly sectionId: string }
  | { readonly type: 'lesson'; readonly lessonId: string; readonly sectionId: string };

/** The first publish-blocking item in outline order (course media, then each section and its
 * lessons), so a blocked publish can jump the studio straight to it. */
export const firstStudioIssue = (
  files: SlotFiles,
  sections: readonly Section[],
): StudioIssueTarget | null => {
  if (!requiredSlotsFilled('course', files)) return { type: 'course' };
  for (const section of sections) {
    if (sectionOwnIssues(section).length > 0) {
      return { type: 'section', sectionId: section.id };
    }
    const lesson = section.lessons.find((l) => lessonIssues(l).length > 0);
    if (lesson) return { type: 'lesson', lessonId: lesson.id, sectionId: section.id };
  }
  return null;
};

export interface StudioIssue {
  readonly label: string;
  readonly target: StudioIssueTarget;
}

/** Every publish-blocking item in outline order, each with where to fix it — the clickable list
 * behind the studio's "fix these" summary. */
export const studioIssues = (
  files: SlotFiles,
  sections: readonly Section[],
): readonly StudioIssue[] => {
  const issues: StudioIssue[] = [];
  if (!requiredSlotsFilled('course', files)) {
    issues.push({ label: 'Course thumbnail is missing', target: { type: 'course' } });
  }
  if (sections.length === 0) {
    issues.push({ label: 'Add at least one section', target: { type: 'course' } });
  }
  sections.forEach((section, sIndex) => {
    const sectionName = `Section ${String(sIndex + 1)}`;
    for (const issue of sectionOwnIssues(section)) {
      issues.push({
        label: `${sectionName}: ${issue}`,
        target: { type: 'section', sectionId: section.id },
      });
    }
    section.lessons.forEach((lesson, lIndex) => {
      for (const issue of lessonIssues(lesson)) {
        issues.push({
          label: `${sectionName} · Lesson ${String(lIndex + 1)}: ${issue}`,
          target: { type: 'lesson', lessonId: lesson.id, sectionId: section.id },
        });
      }
    });
  });
  return issues;
};

/** Validation logic to ensure the studio step is completely filled out for courses. */
export const missingStudio = (
  files: SlotFiles,
  sections: readonly Section[],
): readonly string[] => {
  const missing: string[] = [];
  if (!requiredSlotsFilled('course', files)) {
    missing.push('Course thumbnail');
  }
  if (sections.length === 0) {
    missing.push('At least one section');
  } else {
    missing.push(
      ...sections.flatMap((s) => [
        ...sectionOwnIssues(s),
        ...s.lessons.flatMap(lessonIssues),
      ]),
    );
  }
  return Array.from(new Set(missing));
};
