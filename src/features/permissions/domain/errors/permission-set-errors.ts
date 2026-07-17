import { DomainError } from '@core/errors';

/** Base type for every permissions-domain failure. Lets callers catch/switch on intent. */
export abstract class PermissionSetError extends DomainError {}

/** The permissions API could not be reached or returned an unexpected response. */
export class PermissionsUnavailableError extends PermissionSetError {
  public readonly code = 'PERMISSIONS_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The permissions service is currently unavailable. Please try again.', {
      cause,
    });
  }
}

/** A permission-set name failed validation (empty, blank, or too long). */
export class InvalidPermissionSetNameError extends PermissionSetError {
  public readonly code = 'PERMISSIONS_INVALID_NAME';

  public constructor(reason: string) {
    super('Invalid permission-set name: ' + reason, { context: { reason } });
  }
}

/** A write was rejected by the backend (e.g. delete a system default, admin type default). */
export class PermissionOperationError extends PermissionSetError {
  public readonly code = 'PERMISSIONS_OPERATION_REJECTED';

  public constructor(message: string) {
    super(message);
  }
}
