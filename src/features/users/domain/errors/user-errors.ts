import { DomainError } from '@core/errors';

/** Base type for every users-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class UserError extends DomainError {}

/** The users source could not be reached or returned an unexpected response. */
export class UsersUnavailableError extends UserError {
  public readonly code = 'USERS_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The user directory is currently unavailable. Please try again.', { cause });
  }
}

/** No user account exists for the given id. */
export class UserNotFoundError extends UserError {
  public readonly code = 'USER_NOT_FOUND';

  public constructor(id: string) {
    super(`No user found for id "${id}".`, { context: { id } });
  }
}
