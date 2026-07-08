import type { Result } from '@core/result';
import type { CourseError } from '../errors/course-errors';
import type { Course } from '../entities/course';

/**
 * Port to the course catalog. The domain states the contract in its own terms (`Course`); storage
 * or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface CourseGateway {
  /** Fetch every course (with the current learner's progress merged in). */
  list(): Promise<Result<readonly Course[], CourseError>>;

  /** Fetch a single course by id. */
  getById(id: string): Promise<Result<Course, CourseError>>;

  /** Persist the learner's progress for a course and return the updated course. */
  setProgress(id: string, progress: number): Promise<Result<Course, CourseError>>;
}
