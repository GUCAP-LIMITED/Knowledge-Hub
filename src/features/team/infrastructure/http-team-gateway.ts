import { type HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  TeamMember,
  TeamProgressOverview,
  TeamUnavailableError,
  type GetTeamMembersQuery,
  type PagedTeamMembersResult,
  type TeamError,
  type TeamGateway,
} from '../domain';
import { z } from 'zod';

const BASE = '/api/app/team-progress';

const TeamMemberRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  progress: z.number(),
  completed: z.number(),
  total: z.number(),
  lastActive: z.string(),
  status: z.enum(['online', 'offline', 'away']),
});

const ProgressDistributionBandSchema = z.object({
  key: z.string(),
  label: z.string(),
  min: z.number(),
  max: z.number(),
  count: z.number(),
});

const ProgressDistributionSchema = z.object({
  risk: z.number(),
  progressing: z.number(),
  onTrack: z.number(),
  complete: z.number(),
  bands: z.array(ProgressDistributionBandSchema).default([]),
});

const TeamProgressOverviewSchema = z.object({
  totalMembers: z.number(),
  avgProgress: z.number(),
  activeNow: z.number(),
  atRisk: z.number(),
  teamTotalCourses: z.number(),
  teamCompletedCourses: z.number(),
  progressDistribution: ProgressDistributionSchema.default({
    risk: 0,
    progressing: 0,
    onTrack: 0,
    complete: 0,
    bands: [],
  }),
  members: z.array(TeamMemberRowSchema).default([]),
  atRiskMembers: z.array(TeamMemberRowSchema).default([]),
  certificatesEarnedDates: z.array(z.coerce.date()).default([]),
});

const PagedTeamMembersDtoSchema = z.object({
  totalCount: z.number(),
  items: z.array(TeamMemberRowSchema),
});

type TeamProgressOverviewDto = z.infer<typeof TeamProgressOverviewSchema>;

/**
 * Maps the wire DTO to the rich domain entity. Pure, sync, easily unit-tested.
 */
const mapOverviewToDomain = (dto: TeamProgressOverviewDto): TeamProgressOverview => {
  return new TeamProgressOverview({
    totalMembers: dto.totalMembers,
    avgProgress: dto.avgProgress,
    activeNow: dto.activeNow,
    atRisk: dto.atRisk,
    teamTotalCourses: dto.teamTotalCourses,
    teamCompletedCourses: dto.teamCompletedCourses,
    progressDistribution: dto.progressDistribution,
    members: dto.members,
    atRiskMembers: dto.atRiskMembers,
    certificatesEarnedDates: dto.certificatesEarnedDates,
  });
};

export interface HttpTeamGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export class HttpTeamGateway implements TeamGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HttpTeamGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('team-gateway');
  }

  public async getOverview(): Promise<Result<TeamProgressOverview, TeamError>> {
    try {
      const raw = await this.httpClient.get<unknown>(`${BASE}/overview`);
      const parsed = TeamProgressOverviewSchema.parse(raw);
      const overview = mapOverviewToDomain(parsed);
      return ok(overview);
    } catch (e) {
      this.logger.error('Failed to fetch team progress overview', e);
      return err(new TeamUnavailableError(e));
    }
  }

  public async getMembers(
    query?: GetTeamMembersQuery,
  ): Promise<Result<PagedTeamMembersResult, TeamError>> {
    try {
      const raw = await this.httpClient.get<unknown>(`${BASE}/members`, {
        query: {
          skipCount: query?.skipCount,
          maxResultCount: query?.maxResultCount,
          filter: query?.filter,
          sorting: query?.sorting,
          atRiskOnly: query?.atRiskOnly,
        },
      });
      const parsed = PagedTeamMembersDtoSchema.parse(raw);
      return ok({
        totalCount: parsed.totalCount,
        items: parsed.items.map((m) => new TeamMember(m)),
      });
    } catch (e) {
      this.logger.error('Failed to fetch team members', e);
      return err(new TeamUnavailableError(e));
    }
  }

  public async getAtRiskMembers(
    query?: GetTeamMembersQuery,
  ): Promise<Result<PagedTeamMembersResult, TeamError>> {
    try {
      const raw = await this.httpClient.get<unknown>(`${BASE}/at-risk-members`, {
        query: {
          skipCount: query?.skipCount,
          maxResultCount: query?.maxResultCount,
          filter: query?.filter,
          sorting: query?.sorting,
        },
      });
      const parsed = PagedTeamMembersDtoSchema.parse(raw);
      return ok({
        totalCount: parsed.totalCount,
        items: parsed.items.map((m) => new TeamMember(m)),
      });
    } catch (e) {
      this.logger.error('Failed to fetch at-risk team members', e);
      return err(new TeamUnavailableError(e));
    }
  }
}
