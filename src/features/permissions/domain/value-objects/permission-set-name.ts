import { type Result, ok, err } from '@core/result';
import { InvalidPermissionSetNameError } from '../errors/permission-set-errors';

const MAX_LENGTH = 120;

/**
 * PermissionSet name value object. Immutable and self-validating: trimmed and bounded in length.
 * Construct through PermissionSetName.create (returns a Result) — the private constructor makes an invalid
 * name unrepresentable anywhere in the system.
 */
export class PermissionSetName {
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(
    raw: string,
  ): Result<PermissionSetName, InvalidPermissionSetNameError> {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      return err(new InvalidPermissionSetNameError('a name is required'));
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidPermissionSetNameError(
          'must be at most ' + String(MAX_LENGTH) + ' characters',
        ),
      );
    }
    return ok(new PermissionSetName(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
