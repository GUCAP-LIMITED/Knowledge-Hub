import { DomainError } from '@core/errors';

/** Base type for every submissions-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class SubmissionError extends DomainError {}

/** The submissions source could not be reached or returned an unexpected response. */
export class SubmissionsUnavailableError extends SubmissionError {
  public readonly code = 'SUBMISSIONS_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The submissions service is currently unavailable. Please try again.', {
      cause,
    });
  }
}

/**
 * The submissions service reached the server, which refused the request with a readable reason
 * (e.g. an illegal workflow transition or a missing permission). Carries that server message through.
 */
export class SubmissionRequestRejectedError extends SubmissionError {
  public readonly code = 'SUBMISSIONS_REQUEST_REJECTED';

  public constructor(message: string, cause?: unknown) {
    super(message, { cause });
  }
}

/** No submission exists for the given id. */
export class SubmissionNotFoundError extends SubmissionError {
  public readonly code = 'SUBMISSIONS_NOT_FOUND';

  public constructor(id: string) {
    super(`No submission found for id "${id}".`, { context: { id } });
  }
}

/** A submission title failed validation. */
export class InvalidSubmissionTitleError extends SubmissionError {
  public readonly code = 'SUBMISSIONS_INVALID_TITLE';

  public constructor(reason: string) {
    super(`Invalid submission title: ${reason}`, { context: { reason } });
  }
}

/** A mandatory Details-step field was left empty. Carries the field label for the inline message. */
export class RequiredFieldError extends SubmissionError {
  public readonly code = 'SUBMISSIONS_REQUIRED_FIELD';

  public constructor(field: string) {
    super(`${field} is required.`, { context: { field } });
  }
}

/** A rejection was attempted without a valid reason. */
export class InvalidRejectionReasonError extends SubmissionError {
  public readonly code = 'SUBMISSIONS_INVALID_REASON';

  public constructor(reason: string) {
    super(`Invalid rejection reason: ${reason}`, { context: { reason } });
  }
}

/** A state transition was attempted that the workflow does not allow. */
export class InvalidSubmissionTransitionError extends SubmissionError {
  public readonly code = 'SUBMISSIONS_INVALID_TRANSITION';

  public constructor(from: string, action: string) {
    super(`Cannot ${action} a submission while it is "${from}".`, {
      context: { from, action },
    });
  }
}
