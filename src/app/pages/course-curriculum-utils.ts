import type { Course } from '@features/courses';
import type { CourseLessonKind } from '@features/courses/domain';

export interface LessonWithState {
  readonly id: string;
  readonly title: string;
  readonly kind: CourseLessonKind;
  readonly duration: string;
  readonly durationSeconds?: number;
  readonly completed: boolean;
  readonly current: boolean;
  readonly mediaAssetId: string | null;
  readonly quizId: string | null;
  readonly externalUrl: string | null;
  readonly isPreview: boolean;
}

export interface SectionWithState {
  readonly id: string;
  readonly title: string;
  readonly lessons: readonly LessonWithState[];
}

export const buildCurriculum = (course: Course): readonly SectionWithState[] => {
  let foundCurrent = false;

  return course.sections.map((section) => ({
    id: section.id,
    title: section.title,
    lessons: section.lessons.map((lesson) => {
      const completed = course.completedLessons.includes(lesson.id);
      let current = false;
      if (!completed && !foundCurrent && course.isEnrolled) {
        current = true;
        foundCurrent = true;
      }
      return {
        id: lesson.id,
        title: lesson.title,
        kind: lesson.kind,
        duration:
          lesson.durationSeconds > 0
            ? `${String(Math.round(lesson.durationSeconds / 60))} min`
            : 'N/A',
        durationSeconds: lesson.durationSeconds,
        completed,
        current,
        mediaAssetId: lesson.mediaAssetId,
        quizId: lesson.quizId ?? null,
        externalUrl: lesson.externalUrl,
        isPreview: lesson.isPreview ?? false,
      };
    }),
  }));
};
