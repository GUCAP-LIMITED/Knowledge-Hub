import { type Result, ok, err } from '@core/result';
import { InvalidEmailError } from '../errors/invalid-email-error';

// Pragmatic, deliberately-not-RFC-5322 check: catches obvious mistakes without false negatives.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email value object. Immutable and self-validating: once you hold an `Email`, it is guaranteed
 * well-formed. Construct it through `Email.create` (which returns a `Result`) — the constructor is
 * private so an invalid `Email` cannot exist anywhere in the system.
 *
 * Part of the shared domain kernel (`@core/domain`): reusable by any feature that handles email
 * addresses, with no dependency on a feature.
 */
export class Email {
  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<Email, InvalidEmailError> {
    const normalized = raw.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      return err(new InvalidEmailError(raw));
    }
    return ok(new Email(normalized));
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
