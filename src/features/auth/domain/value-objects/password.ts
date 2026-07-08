import { type Result, ok, err } from '@core/result';
import { EmptyPasswordError } from '../errors/auth-errors';

/**
 * Password value object. Wrapping the raw credential keeps the "must be non-empty" rule in one
 * place and makes the type self-documenting at call sites (you pass a `Password`, not just another
 * `string`). The value is never logged — `toString` redacts it.
 */
export class Password {
  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<Password, EmptyPasswordError> {
    if (raw.trim().length === 0) {
      return err(new EmptyPasswordError());
    }
    return ok(new Password(raw));
  }

  /** Never log the raw password — redact it. */
  public toString(): string {
    return '***';
  }
}
