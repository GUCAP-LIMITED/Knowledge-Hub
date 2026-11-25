import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  GetTeamMembersQuery,
  PagedTeamMembersResult,
  TeamError,
  TeamGateway,
} from '../../domain';

export interface GetTeamMembersUseCaseDeps {
  readonly teamGateway: TeamGateway;
  readonly logger: Logger;
}

/** Fetch a paginated batch of team members. */
export class GetTeamMembersUseCase {
  private readonly teamGateway: TeamGateway;
  private readonly logger: Logger;

  public constructor(deps: GetTeamMembersUseCaseDeps) {
    this.teamGateway = deps.teamGateway;
    this.logger = deps.logger.child('get-team-members');
  }

  public async execute(
    query?: GetTeamMembersQuery,
  ): Promise<Result<PagedTeamMembersResult, TeamError>> {
    const result = await this.teamGateway.getMembers(query);
    if (!result.ok) {
      this.logger.warn('Fetching team members failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
