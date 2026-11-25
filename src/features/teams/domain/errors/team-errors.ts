import { DomainError } from '@core/errors';

/** Base type for every teams-domain failure. Lets callers catch/switch on intent. */
export abstract class TeamError extends DomainError {}

/** The teams API could not be reached or returned an unexpected response. */
export class TeamsUnavailableError extends TeamError {
  public readonly code = 'TEAMS_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The teams service is currently unavailable. Please try again.', { cause });
  }
}

/** A team name failed validation (empty, blank, or too long). */
export class InvalidTeamNameError extends TeamError {
  public readonly code = 'TEAMS_INVALID_NAME';

  public constructor(reason: string) {
    super('Invalid team name: ' + reason, { context: { reason } });
  }
}
