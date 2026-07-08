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
