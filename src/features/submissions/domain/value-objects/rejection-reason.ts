import { type Result, ok, err } from '@core/result';
import { InvalidRejectionReasonError } from '../errors/submission-errors';

const MIN_LENGTH = 3;
const MAX_LENGTH = 500;

/**
 * Rejection reason value object. A rejection is only valid with a real explanation, so the "reason
 * is required" rule lives here — the reviewer UI and the use case both go through `create`.
 */
export class RejectionReason {
  public static readonly minLength = MIN_LENGTH;
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(
    raw: string,
  ): Result<RejectionReason, InvalidRejectionReasonError> {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      return err(new InvalidRejectionReasonError('a reason is required'));
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidRejectionReasonError(
          `must be at most ${String(MAX_LENGTH)} characters`,
        ),
      );
    }
    return ok(new RejectionReason(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
