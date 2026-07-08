import { DomainError } from '@core/errors';

/**
 * Raised by the {@link Email} value object when given a malformed address.
 *
 * Lives in the shared domain kernel (not in any feature) because `Email` is used across features.
 * A feature that wants to express this failure in its own vocabulary maps it at its boundary
 * (e.g. the auth login use case maps it to an `InvalidCredentialsError`).
 */
export class InvalidEmailError extends DomainError {
  public readonly code = 'INVALID_EMAIL';

  public constructor(value: string) {
    super(`"${value}" is not a valid email address.`, { context: { value } });
  }
}
