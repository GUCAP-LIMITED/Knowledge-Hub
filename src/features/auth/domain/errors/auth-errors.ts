import { DomainError } from '@core/errors';

/** Base type for every authentication-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class AuthError extends DomainError {}

/** The supplied credentials were rejected by the authentication service. */
export class InvalidCredentialsError extends AuthError {
  public readonly code = 'AUTH_INVALID_CREDENTIALS';

  public constructor() {
    super('The sign-in credentials were invalid or have expired.');
  }
}

// DEAD CODE (unused): commented out pending removal.
// /** The user authenticated but their account is not allowed to use this app. */
// export class AccountInactiveError extends AuthError {
//   public readonly code = 'AUTH_ACCOUNT_INACTIVE';
//
//   public constructor() {
//     super('This account is inactive. Please contact your administrator.');
//   }
// }

/** The user's role is prohibited from logging in to this app. */
export class UserTypeLoginProhibitedError extends AuthError {
  public readonly code = 'AUTH_USER_TYPE_PROHIBITED';

  public constructor(
    message = 'The User Type you belong to is prohibited from accessing this application. Please contact your supervisor.',
  ) {
    super(message);
  }
}

/** The authority could not be reached or returned an unexpected error. */
export class AuthServiceUnavailableError extends AuthError {
  public readonly code = 'AUTH_SERVICE_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The authentication service is currently unavailable. Please try again.', {
      cause,
    });
  }
}

// DEAD CODE (unused; only used by the unused Password VO): commented out pending removal.
// /** A required password was empty. */
// export class EmptyPasswordError extends AuthError {
//   public readonly code = 'AUTH_EMPTY_PASSWORD';
//
//   public constructor() {
//     super('A password is required.');
//   }
// }
