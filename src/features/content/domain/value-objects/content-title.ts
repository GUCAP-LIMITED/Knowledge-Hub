import { type Result, ok, err } from '@core/result';
import { InvalidContentTitleError } from '../errors/content-errors';

const MIN_LENGTH = 3;
const MAX_LENGTH = 120;

/**
 * Content title value object. Trimmed, non-empty, bounded (3–120 chars). An invalid title is
 * unrepresentable — construct via `ContentTitle.create`.
 */
export class ContentTitle {
  public static readonly minLength = MIN_LENGTH;
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<ContentTitle, InvalidContentTitleError> {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      return err(
        new InvalidContentTitleError(`must be at least ${String(MIN_LENGTH)} characters`),
      );
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidContentTitleError(`must be at most ${String(MAX_LENGTH)} characters`),
      );
    }
    return ok(new ContentTitle(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
