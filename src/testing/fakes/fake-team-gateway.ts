import { type Result, ok } from '@core/result';
import {
  TeamProgressOverview,
  type GetTeamMembersQuery,
  type PagedTeamMembersResult,
  type TeamError,
  type TeamGateway,
} from '@features/team/domain';

/** Hand-written, fully-typed fake of the {@link TeamGateway} port. */
export class FakeTeamGateway implements TeamGateway {
  public getOverviewResult: Result<TeamProgressOverview, TeamError> = ok(
    new TeamProgressOverview({
      totalMembers: 0,
      avgProgress: 0,
      activeNow: 0,
      atRisk: 0,
      teamTotalCourses: 0,
      teamCompletedCourses: 0,
      progressDistribution: {
        risk: 0,
        progressing: 0,
        onTrack: 0,
        complete: 0,
      },
      members: [],
      atRiskMembers: [],
      certificatesEarnedDates: [],
    }),
  );

  public getMembersResult: Result<PagedTeamMembersResult, TeamError> = ok({
    totalCount: 0,
    items: [],
  });

  public getAtRiskMembersResult: Result<PagedTeamMembersResult, TeamError> = ok({
    totalCount: 0,
    items: [],
  });

  public getOverview(): Promise<Result<TeamProgressOverview, TeamError>> {
    return Promise.resolve(this.getOverviewResult);
  }

  public getMembers(
    _query?: GetTeamMembersQuery,
  ): Promise<Result<PagedTeamMembersResult, TeamError>> {
    return Promise.resolve(this.getMembersResult);
  }

  public getAtRiskMembers(
    _query?: GetTeamMembersQuery,
  ): Promise<Result<PagedTeamMembersResult, TeamError>> {
    return Promise.resolve(this.getAtRiskMembersResult);
  }
}
