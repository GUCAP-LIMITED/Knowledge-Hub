import { DomainError } from '@core/errors';

/** Base type for every content-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class ContentError extends DomainError {}

/** The content source could not be reached or returned an unexpected response. */
export class ContentUnavailableError extends ContentError {
  public readonly code = 'CONTENT_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The content library is currently unavailable. Please try again.', { cause });
  }
}

/** No content item exists for the given id. */
export class ContentNotFoundError extends ContentError {
  public readonly code = 'CONTENT_NOT_FOUND';

  public constructor(id: string) {
    super(`No content found for id "${id}".`, { context: { id } });
  }
}

/** A content title failed validation. */
export class InvalidContentTitleError extends ContentError {
  public readonly code = 'CONTENT_INVALID_TITLE';

  public constructor(reason: string) {
    super(`Invalid content title: ${reason}`, { context: { reason } });
  }
}

/** A state transition was attempted that the content lifecycle does not allow. */
export class InvalidContentTransitionError extends ContentError {
  public readonly code = 'CONTENT_INVALID_TRANSITION';

  public constructor(from: string, action: string) {
    super(`Cannot ${action} content while it is "${from}".`, {
      context: { from, action },
    });
  }
}
