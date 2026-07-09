import { type Result, ok, err } from '@core/result';
import { InvalidAssignmentTargetError } from '../errors/assignment-errors';

const MIN_LENGTH = 2;
const MAX_LENGTH = 80;

/**
 * Assignment target value object — the person or group a training is assigned to. Trimmed,
 * non-empty, bounded (2–80 chars). An invalid target is unrepresentable — construct via
 * `AssignmentTarget.create`.
 */
export class AssignmentTarget {
  public static readonly minLength = MIN_LENGTH;
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(
    raw: string,
  ): Result<AssignmentTarget, InvalidAssignmentTargetError> {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      return err(
        new InvalidAssignmentTargetError(
          `must be at least ${String(MIN_LENGTH)} characters`,
        ),
      );
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidAssignmentTargetError(
          `must be at most ${String(MAX_LENGTH)} characters`,
        ),
      );
    }
    return ok(new AssignmentTarget(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
