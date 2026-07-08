import { type Result, ok, err } from '@core/result';
import { InvalidTutorialTitleError } from '../errors/tutorial-errors';

const MIN_LENGTH = 3;
const MAX_LENGTH = 90;

/**
 * Tutorial title value object. Trimmed, non-empty, bounded (3–90 chars, matching the authoring
 * flow). An invalid title is unrepresentable — construct via `TutorialTitle.create`.
 */
export class TutorialTitle {
  public static readonly minLength = MIN_LENGTH;
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<TutorialTitle, InvalidTutorialTitleError> {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      return err(
        new InvalidTutorialTitleError(
          `must be at least ${String(MIN_LENGTH)} characters`,
        ),
      );
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidTutorialTitleError(`must be at most ${String(MAX_LENGTH)} characters`),
      );
    }
    return ok(new TutorialTitle(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
