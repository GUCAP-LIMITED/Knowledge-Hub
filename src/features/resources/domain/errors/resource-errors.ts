import { DomainError } from '@core/errors';

/** Base type for every resources-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class ResourceError extends DomainError {}

/** The resources source could not be reached or returned an unexpected response. */
export class ResourcesUnavailableError extends ResourceError {
  public readonly code = 'RESOURCES_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The knowledge base is currently unavailable. Please try again.', { cause });
  }
}

/** A resource title failed validation. */
export class InvalidResourceTitleError extends ResourceError {
  public readonly code = 'RESOURCES_INVALID_TITLE';

  public constructor(reason: string) {
    super(`Invalid resource title: ${reason}`, { context: { reason } });
  }
}

/** No resource exists for the given id. */
export class ResourceNotFoundError extends ResourceError {
  public readonly code = 'RESOURCES_NOT_FOUND';

  public constructor(id: string) {
    super(`No resource found for id "${id}".`, { context: { id } });
  }
}
