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
  useUpdateCourseProgress,
  coursesQueryKey,
} from './presentation';
export { Course, type CourseProps } from './domain';
