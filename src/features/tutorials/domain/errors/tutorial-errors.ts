import { DomainError } from '@core/errors';

/** Base type for every tutorials-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class TutorialError extends DomainError {}

/** The tutorials source could not be reached or returned an unexpected response. */
export class TutorialsUnavailableError extends TutorialError {
  public readonly code = 'TUTORIALS_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The tutorials library is currently unavailable. Please try again.', { cause });
  }
}

/** A tutorial title failed validation. */
export class InvalidTutorialTitleError extends TutorialError {
  public readonly code = 'TUTORIALS_INVALID_TITLE';

  public constructor(reason: string) {
    super(`Invalid tutorial title: ${reason}`, { context: { reason } });
  }
}

/** No tutorial exists for the given id. */
export class TutorialNotFoundError extends TutorialError {
  public readonly code = 'TUTORIALS_NOT_FOUND';

  public constructor(id: string) {
    super(`No tutorial found for id "${id}".`, { context: { id } });
  }
}
