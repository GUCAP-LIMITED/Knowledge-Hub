import { type Result, ok, err } from '@core/result';
import { InvalidResourceTitleError } from '../errors/resource-errors';

const MIN_LENGTH = 3;
const MAX_LENGTH = 90;

/**
 * Resource title value object. Trimmed, non-empty, bounded (3–90 chars, matching the authoring
 * flow). An invalid title is unrepresentable — construct via `ResourceTitle.create`.
 */
export class ResourceTitle {
  public static readonly minLength = MIN_LENGTH;
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<ResourceTitle, InvalidResourceTitleError> {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      return err(
        new InvalidResourceTitleError(
          `must be at least ${String(MIN_LENGTH)} characters`,
        ),
      );
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidResourceTitleError(`must be at most ${String(MAX_LENGTH)} characters`),
      );
    }
    return ok(new ResourceTitle(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
