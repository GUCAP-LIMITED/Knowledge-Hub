import { type Result, ok, err } from '@core/result';
import { InvalidSubmissionTitleError } from '../errors/submission-errors';

const MIN_LENGTH = 3;
const MAX_LENGTH = 120;

/** Submission title value object: trimmed, non-empty, bounded. Construct via `create`. */
export class SubmissionTitle {
  public static readonly minLength = MIN_LENGTH;
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(
    raw: string,
  ): Result<SubmissionTitle, InvalidSubmissionTitleError> {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      return err(
        new InvalidSubmissionTitleError(
          `must be at least ${String(MIN_LENGTH)} characters`,
        ),
      );
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidSubmissionTitleError(
          `must be at most ${String(MAX_LENGTH)} characters`,
        ),
      );
    }
    return ok(new SubmissionTitle(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
