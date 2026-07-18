import { type Result, ok, err } from '@core/result';
import { InvalidTeamNameError } from '../errors/team-errors';

const MAX_LENGTH = 128;

/**
 * Team name value object. Immutable and self-validating: trimmed and bounded in length.
 * Construct through TeamName.create (returns a Result) — used by the form's domainResolver so the
 * same rule the backend enforces drives inline validation.
 */
export class TeamName {
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<TeamName, InvalidTeamNameError> {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      return err(new InvalidTeamNameError('a name is required'));
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(
        new InvalidTeamNameError('must be at most ' + String(MAX_LENGTH) + ' characters'),
      );
    }
    return ok(new TeamName(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
