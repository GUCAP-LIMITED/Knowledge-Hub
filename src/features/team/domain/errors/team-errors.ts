import { DomainError } from '@core/errors';

/** Base type for every team-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class TeamError extends DomainError {}

/** The team source could not be reached or returned an unexpected response. */
export class TeamUnavailableError extends TeamError {
  public readonly code = 'TEAM_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The team roster is currently unavailable. Please try again.', { cause });
  }
}
