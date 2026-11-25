import {
  Course,
  UNCATEGORIZED_LABEL,
  type CourseIntroMedia,
  type CourseLessonKind,
  type CourseSection,
  type Difficulty,
} from '../domain/entities/course';
import type { CourseRow, EnrollmentRow, IntroMediaRow } from './dto/course-api.dto';
import { formatDurationDisplay } from '@features/content';

const mapDifficulty = (
  difficulty?: number | string | null,
  difficultyName?: string | null,
): Difficulty => {
  if (difficultyName === 'Advanced' || difficulty === 10 || difficulty === 'Advanced') {
    return 'Advanced';
  }
  if (
    difficultyName === 'Intermediate' ||
    difficulty === 5 ||
    difficulty === 'Intermediate'
  ) {
    return 'Intermediate';
  }
  return 'Beginner';
};

const mapLessonKind = (kind: number): CourseLessonKind => {
  switch (kind) {
    case 5:
      return 'pdf';
    case 10:
      return 'quiz';
    case 15:
      return 'assignment';
    case 20:
      return 'link';
    default:
      return 'video';
  }
};

const mapIntroMedia = (
  introMedia: IntroMediaRow | null | undefined,
): CourseIntroMedia | null => {
  if (!introMedia?.url) return null;
  return {
    url: introMedia.url,
    mimeType: introMedia.mimeType ?? null,
    durationSeconds: introMedia.durationSeconds,
  };
};

const calculateDurationSeconds = (row: CourseRow): number =>
  row.durationSeconds > 0
    ? row.durationSeconds
    : row.sections
        .flatMap((s) => s.lessons)
        .reduce((sum, lesson) => sum + lesson.durationSeconds, 0);

const calculateDurationLabel = (row: CourseRow): string =>
  formatDurationDisplay(calculateDurationSeconds(row));

/**
 * Completed-lesson IDs come from two backend sources that can each be present on their own:
 * the enrollment's progress list, and the `isCompleted` flag on each curriculum lesson.
 */
const resolveCompletedLessons = (row: CourseRow): readonly string[] => {
  const fromProgress =
    row.enrollments[0]?.progress
      .filter((p) => p.isCompleted ?? true)
      .map((p) => p.curriculumLessonId) ?? [];
  const fromLessons = row.sections
    .flatMap((s) => s.lessons)
    .filter((l) => l.isCompleted)
    .map((l) => l.id);
  return Array.from(new Set([...fromProgress, ...fromLessons]));
};

const resolveIsCompleted = (row: CourseRow): boolean =>
  row.isCompleted || row.isCourseCompleted || row.enrollments[0]?.status === 15;

const resolveRowUpdatedAt = (row: CourseRow): Date => {
  if (row.lastModificationTime) return new Date(row.lastModificationTime);
  if (row.creationTime) return new Date(row.creationTime);
  return new Date();
};

const calculateProgress = (
  row: CourseRow,
  completedLessons: readonly string[],
): number => {
  if (resolveIsCompleted(row)) {
    return 100;
  }
  const totalLessons = row.totalLessons || row.sections.flatMap((s) => s.lessons).length;
  if (totalLessons === 0) {
    return row.progress;
  }
  if (completedLessons.length > 0) {
    return Math.min(100, Math.round((completedLessons.length / totalLessons) * 100));
  }
  return row.progress;
};

interface EnrollmentFields {
  readonly enrollmentId: string | null;
  readonly enrollmentStatus: number | null;
  readonly completedLessons: readonly string[];
}

const mapEnrollmentFields = (
  enrollment: EnrollmentRow | undefined,
  completedLessons: readonly string[],
): EnrollmentFields => ({
  enrollmentId: enrollment?.id ?? null,
  enrollmentStatus: enrollment?.status ?? null,
  completedLessons,
});

interface CoursePresentation {
  readonly subtitle: string | null;
  readonly description: string;
  readonly category: string;
  readonly categoryId: string | null;
  readonly thumbnailUrl: string | null;
  readonly addedDate: Date;
  readonly certificateId: string | null;
  readonly certificateUrl: string | null;
  readonly completedAt: string | null;
  readonly totalLessons: number;
}

const resolveCoursePresentation = (row: CourseRow): CoursePresentation => ({
  subtitle: row.subtitle ?? null,
  description: row.description ?? '',
  category: row.categoryName ?? row.category ?? UNCATEGORIZED_LABEL,
  categoryId: row.categoryId ?? null,
  thumbnailUrl: row.thumbnailUrl ?? null,
  addedDate: row.creationTime ? new Date(row.creationTime) : new Date(),
  certificateId: row.certificateId ?? null,
  certificateUrl: row.certificateUrl ?? null,
  completedAt: row.completedAt ?? null,
  totalLessons: row.totalLessons || row.sections.flatMap((s) => s.lessons).length,
});

const mapSections = (sections: CourseRow['sections']): readonly CourseSection[] =>
  sections.map((s) => ({
    id: s.id,
    title: s.title,
    lessons: s.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      durationSeconds: l.durationSeconds,
      kind: mapLessonKind(l.kind),
      mediaAssetId: l.mediaAssetId ?? null,
      quizId: l.quizId ?? null,
      externalUrl: l.externalUrl ?? null,
      isPreview: l.isPreview,
    })),
  }));

export const toCourse = (row: CourseRow): Course => {
  const completedLessons = resolveCompletedLessons(row);
  const enrollment = mapEnrollmentFields(row.enrollments[0], completedLessons);
  const pres = resolveCoursePresentation(row);
  const slug = row.slug ? row.slug : row.id;

  return new Course({
    id: row.id,
    slug,
    title: row.title,
    subtitle: pres.subtitle,
    description: pres.description,
    enrolled: row.enrollmentCount,
    isEnrolled: row.isEnrolled,
    category: pres.category,
    categoryId: pres.categoryId,
    difficulty: mapDifficulty(row.difficulty, row.difficultyName),
    duration: calculateDurationLabel(row),
    durationSeconds: calculateDurationSeconds(row),
    lessons: pres.totalLessons,
    mandatory: row.mandatory,
    rating: row.averageRating,
    totalReviews: row.totalReviews,
    addedDate: pres.addedDate,
    updatedAt: resolveRowUpdatedAt(row),
    outcomes: [],
    thumbnailUrl: pres.thumbnailUrl,
    introMedia: mapIntroMedia(row.introMedia),
    ...enrollment,
    progress: calculateProgress(row, completedLessons),
    completed: resolveIsCompleted(row),
    completedAt: pres.completedAt,
    certificateId: pres.certificateId,
    certificateUrl: pres.certificateUrl,
    helpfulCount: row.helpfulCount,
    isHelpful: row.isHelpful,
    canModify: row.canModify,
    media: row.media,
    sections: mapSections(row.sections),
  });
};
