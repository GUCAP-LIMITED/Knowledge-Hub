import { type Result, ok, err } from '@core/result';
import { InvalidCourseTitleError } from '../errors/course-errors';

const MIN_LENGTH = 3;
const MAX_LENGTH = 90;

/**
 * Course title value object. Trimmed, non-empty, bounded (3–90 chars, matching the authoring
 * flow). An invalid title is unrepresentable — construct via `CourseTitle.create`.
 */
export class CourseTitle {
  public static readonly minLength = MIN_LENGTH;
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<CourseTitle, InvalidCourseTitleError> {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      return err(
        new InvalidCourseTitleError(`must be at least ${String(MIN_LENGTH)} characters`),
      );
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidCourseTitleError(`must be at most ${String(MAX_LENGTH)} characters`),
      );
    }
    return ok(new CourseTitle(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
