import type { Result } from '@core/result';
import type { TeamError } from '../errors/team-errors';
import type { TeamMember } from '../entities/team-member';
import type { TeamProgressOverview } from '../entities/team-progress-overview';

export interface GetTeamMembersQuery {
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
  readonly filter?: string | undefined;
  readonly sorting?: string | undefined;
  readonly atRiskOnly?: boolean | undefined;
}

export interface PagedTeamMembersResult {
  readonly totalCount: number;
  readonly items: readonly TeamMember[];
}

/**
 * Port to the team roster. The domain states the contract in its own terms (`TeamProgressOverview`); storage
 * or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface TeamGateway {
  /** Fetch the team overview and its stats. */
  getOverview(): Promise<Result<TeamProgressOverview, TeamError>>;

  /** Fetch a paginated list of team members. */
  getMembers(
    query?: GetTeamMembersQuery,
  ): Promise<Result<PagedTeamMembersResult, TeamError>>;

  /** Fetch a paginated list of at-risk learners. */
  getAtRiskMembers(
    query?: GetTeamMembersQuery,
  ): Promise<Result<PagedTeamMembersResult, TeamError>>;
}
