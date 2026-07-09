import { type Result, ok, err } from '@core/result';
import { InvalidReviewFeedbackError } from '../errors/review-errors';

const MIN_LENGTH = 3;
const MAX_LENGTH = 2000;

/** Written review value object: trimmed, non-empty, bounded. Construct via `create`. */
export class ReviewFeedback {
  public static readonly minLength = MIN_LENGTH;
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<ReviewFeedback, InvalidReviewFeedbackError> {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      return err(new InvalidReviewFeedbackError('a written comment is required'));
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidReviewFeedbackError(
          `must be at most ${String(MAX_LENGTH)} characters`,
        ),
      );
    }
    return ok(new ReviewFeedback(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
