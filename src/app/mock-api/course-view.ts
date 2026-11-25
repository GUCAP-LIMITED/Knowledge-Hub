import { ratingOf } from './content-index';
import type { MockState } from './mock-state';
import { can } from './mock-context';
import { courseCategoryId, type CourseSeed, type LessonSeed } from './seed/course-seed';
import type { MockEnrollment } from './seed/enrollment-seed';
import { findMediaAsset } from './seed/media-assets';
import type { MockUser } from './seed/mock-users';
import { svgThumb } from './seed/svg-thumb';

const STATUS_NAMES: Readonly<Record<number, string>> = {
  0: 'NotStarted',
  5: 'InProgress',
  10: 'Paused',
  15: 'Completed',
};

const DIFFICULTY_NAMES: Readonly<Record<number, string>> = {
  0: 'Beginner',
  5: 'Intermediate',
  10: 'Advanced',
};

export const allLessons = (course: CourseSeed): readonly LessonSeed[] =>
  course.sections.flatMap((section) => section.lessons);

export const courseDurationSeconds = (course: CourseSeed): number =>
  allLessons(course).reduce((sum, lesson) => sum + lesson.minutes * 60, 0);

export const findEnrollment = (
  state: MockState,
  userId: string,
  courseId: string,
): MockEnrollment | undefined =>
  state.enrollments.find((e) => e.userId === userId && e.courseId === courseId);

export const categoryNameOf = (state: MockState, course: CourseSeed): string =>
  state.categories.find((c) => c.id === courseCategoryId(course))?.name ??
  course.category;

const enrollmentDto = (enrollment: MockEnrollment): Record<string, unknown> => ({
  id: enrollment.id,
  status: enrollment.status,
  statusName: STATUS_NAMES[enrollment.status],
  progress: [...enrollment.completedLessons].map(([lessonId, at]) => ({
    curriculumLessonId: lessonId,
    isCompleted: true,
    completedAt: at,
  })),
});

const lessonDto = (
  lesson: LessonSeed,
  order: number,
  enrollment: MockEnrollment | undefined,
): Record<string, unknown> => ({
  id: lesson.id,
  title: lesson.title,
  durationSeconds: lesson.minutes * 60,
  kind: lesson.kind,
  displayOrder: order,
  mediaAssetId: lesson.mediaAssetId ?? null,
  quizId: lesson.quizId ?? null,
  externalUrl: lesson.externalUrl ?? null,
  isCompleted: enrollment?.completedLessons.has(lesson.id) ?? false,
  isPreview: lesson.isPreview ?? false,
});

const mediaDtos = (course: CourseSeed): Record<string, unknown>[] =>
  allLessons(course).flatMap((lesson) => {
    const asset =
      lesson.mediaAssetId === undefined ? undefined : findMediaAsset(lesson.mediaAssetId);
    return asset === undefined
      ? []
      : [
          {
            id: asset.id,
            slot: 0,
            kind: asset.kind,
            originalFileName: asset.fileName,
            mimeType: asset.mimeType,
            sizeBytes: asset.sizeBytes,
            url: asset.url,
            referencedLessonId: lesson.id,
          },
        ];
  });

const introMedia = (course: CourseSeed): Record<string, unknown> | null => {
  const asset =
    course.introAssetId === null ? undefined : findMediaAsset(course.introAssetId);
  return asset === undefined
    ? null
    : { url: asset.url, mimeType: asset.mimeType, durationSeconds: 45 };
};

/** The `CourseRow` wire shape for a course as seen by `user` (their enrollment, votes, rights). */
export const toCourseRow = (
  state: MockState,
  course: CourseSeed,
  user: MockUser,
): Record<string, unknown> => {
  const enrollment = findEnrollment(state, user.id, course.id);
  const lessons = allLessons(course);
  const done = enrollment?.completedLessons.size ?? 0;
  const completed = enrollment?.status === 15;
  const helpful = state.helpfulVotes.has(`${user.id}:${course.id}`);
  const rating = ratingOf(state, course.id);
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    durationSeconds: courseDurationSeconds(course),
    isEnrolled: enrollment !== undefined,
    isCompleted: completed,
    isCourseCompleted: completed,
    completedAt: enrollment?.completedAt ?? null,
    certificateId: completed ? `cert-${enrollment.id}` : null,
    certificateUrl: null,
    enrollmentCount:
      state.enrollments.filter((e) => e.courseId === course.id).length +
      course.enrollmentCount,
    thumbnailUrl: svgThumb(course.title, course.hue),
    introMedia: introMedia(course),
    sections: course.sections.map((section, sectionIndex) => ({
      id: section.id,
      title: section.title,
      displayOrder: sectionIndex,
      lessons: section.lessons.map((lesson, index) =>
        lessonDto(lesson, index, enrollment),
      ),
    })),
    enrollments: enrollment === undefined ? [] : [enrollmentDto(enrollment)],
    media: mediaDtos(course),
    creationTime: course.createdAt,
    lastModificationTime: course.createdAt,
    helpfulCount: course.helpfulCount + (helpful ? 1 : 0),
    isHelpful: helpful,
    averageRating: rating.average,
    rating: rating.average,
    totalReviews: rating.total,
    categoryId: courseCategoryId(course),
    categoryName: categoryNameOf(state, course),
    difficulty: course.difficulty,
    difficultyName: DIFFICULTY_NAMES[course.difficulty],
    mandatory: course.mandatory,
    progress: lessons.length === 0 ? 0 : Math.round((done / lessons.length) * 100),
    totalLessons: lessons.length,
    canModify: can(state, user, 'Courses.Edit'),
  };
};

export { DIFFICULTY_NAMES, STATUS_NAMES };
