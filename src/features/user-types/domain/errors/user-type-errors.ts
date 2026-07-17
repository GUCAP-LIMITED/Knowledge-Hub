import { DomainError } from '@core/errors';

/** Base type for every user-types-domain failure. Lets callers catch/switch on intent. */
export abstract class UserTypeError extends DomainError {}

/** The user-types API could not be reached or returned an unexpected response. */
export class UserTypesUnavailableError extends UserTypeError {
  public readonly code = 'USER_TYPES_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The user-types service is currently unavailable. Please try again.', {
      cause,
    });
  }
}

/** A userType name failed validation (empty, blank, or too long). */
export class InvalidUserTypeNameError extends UserTypeError {
  public readonly code = 'USER_TYPES_INVALID_NAME';

  public constructor(reason: string) {
    super('Invalid user type name: ' + reason, { context: { reason } });
  }
}

/** The chosen name already exists in this tenant (backend 403 validation). */
export class DuplicateUserTypeNameError extends UserTypeError {
  public readonly code = 'USER_TYPES_DUPLICATE_NAME';

  public constructor(name: string) {
    super('A user type named "' + name + '" already exists.', { context: { name } });
  }
}

/** Attempted to edit/delete/change roles on a seeded (default) type — blocked by the backend. */
export class SeededUserTypeImmutableError extends UserTypeError {
  public readonly code = 'USER_TYPES_SEEDED_IMMUTABLE';

  public constructor() {
    super('Default user types cannot be modified or deleted.');
  }
}

/** Attempted to delete a type still assigned to users — reassign them first. */
export class UserTypeInUseError extends UserTypeError {
  public readonly code = 'USER_TYPES_IN_USE';

  public constructor() {
    super('This user type is assigned to users and cannot be deleted.');
  }
}
