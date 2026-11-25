import { type Result, ok, err } from '@core/result';
import { InvalidSubmissionTitleError } from '../errors/submission-errors';

const MIN_LENGTH = 3;
const MAX_LENGTH = 200;

/** Submission title value object: trimmed, non-empty, bounded. Construct via `create`. */
export class SubmissionTitle {
  public static readonly minLength = MIN_LENGTH;
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(
    raw: string | undefined | null,
  ): Result<SubmissionTitle, InvalidSubmissionTitleError> {
    const val = raw ?? '';
    const trimmed = val.trim();
    if (trimmed.length === 0) {
      return err(new InvalidSubmissionTitleError('is required.'));
    }
    if (trimmed.length < MIN_LENGTH) {
      return err(
        new InvalidSubmissionTitleError(
          `must be at least ${String(MIN_LENGTH)} characters.`,
        ),
      );
    }
    if (val.length > MAX_LENGTH) {
      return err(
        new InvalidSubmissionTitleError(
          `must not exceed ${String(MAX_LENGTH)} characters.`,
        ),
      );
    }
    return ok(new SubmissionTitle(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
