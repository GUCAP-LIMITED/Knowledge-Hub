import { type Result, ok, err } from '@core/result';
import { InvalidUserTypeNameError } from '../errors/user-type-errors';

const MAX_LENGTH = 128;

/**
 * UserType name value object. Immutable and self-validating: trimmed and bounded in length.
 * Construct through UserTypeName.create (returns a Result) — the private constructor makes an invalid
 * name unrepresentable anywhere in the system.
 */
export class UserTypeName {
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<UserTypeName, InvalidUserTypeNameError> {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      return err(new InvalidUserTypeNameError('a name is required'));
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidUserTypeNameError(
          'must be at most ' + String(MAX_LENGTH) + ' characters',
        ),
      );
    }
    return ok(new UserTypeName(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
