/**
 * Public API of the `courses` feature. The app shell and other features import ONLY from here.
 * Backed by an in-memory gateway seeded from the prototype catalog (swap for HTTP to go live).
 */
export {
  createCoursesModule,
  type CoursesModule,
  type CoursesModuleDeps,
} from './courses-module';
export {
  CoursesModuleProvider,
  useCourses,
  useInfiniteCourses,
  useCourse,
  useUpdateCourse,
  useUpdateCourseProgress,
  useEnrollCourse,
  useMarkLessonComplete,
  useMarkCourseHelpful,
  type MarkCourseHelpfulInput,
  useMyLearning,
  useEnrollmentStatuses,
  useCourseCategoryName,
  coursesQueryKey,
  CourseEditModal,
  type CourseEditModalProps,
  AssignmentLessonPlayer,
  type AssignmentLessonPlayerProps,
  useAssignmentBriefs,
  useUploadBriefFile,
  useRemoveBriefFile,
  useLessonSubmission,
  useUploadSubmissionFile,
  useRemoveSubmissionFile,
  useSubmitAndCompleteAssignment,
} from './presentation';
export {
  Course,
  type CourseProps,
  type CourseMediaAsset,
  type CourseCatalogParams,
  type MyLearningParams,
  type PagedResult,
  type EnrollmentStatusDto,
  type CourseLessonInput,
  type SubmissionFileDto,
  type LessonSubmissionDto,
  CourseNotFoundError,
} from './domain';
