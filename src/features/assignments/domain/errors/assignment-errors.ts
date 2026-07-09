import { DomainError } from '@core/errors';

/** Base type for every assignments-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class AssignmentError extends DomainError {}

/** The assignments source could not be reached or returned an unexpected response. */
export class AssignmentsUnavailableError extends AssignmentError {
  public readonly code = 'ASSIGNMENTS_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('Training assignments are currently unavailable. Please try again.', { cause });
  }
}

/** An assignment target (assignee) failed validation. */
export class InvalidAssignmentTargetError extends AssignmentError {
  public readonly code = 'ASSIGNMENTS_INVALID_TARGET';

  public constructor(reason: string) {
    super(`Invalid assignment target: ${reason}`, { context: { reason } });
  }
}

/** No assignment exists for the given id. */
export class AssignmentNotFoundError extends AssignmentError {
  public readonly code = 'ASSIGNMENTS_NOT_FOUND';

  public constructor(id: string) {
    super(`No assignment found for id "${id}".`, { context: { id } });
  }
}
