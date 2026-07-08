import { DomainError } from '@core/errors';

/** Base type for every courses-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class CourseError extends DomainError {}

/** The courses source could not be reached or returned an unexpected response. */
export class CoursesUnavailableError extends CourseError {
  public readonly code = 'COURSES_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The course catalog is currently unavailable. Please try again.', { cause });
  }
}

/** A course title failed validation. */
export class InvalidCourseTitleError extends CourseError {
  public readonly code = 'COURSES_INVALID_TITLE';

  public constructor(reason: string) {
    super(`Invalid course title: ${reason}`, { context: { reason } });
  }
}

/** No course exists for the given id. */
export class CourseNotFoundError extends CourseError {
  public readonly code = 'COURSES_NOT_FOUND';

  public constructor(id: string) {
    super(`No course found for id "${id}".`, { context: { id } });
  }
}
