import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  GetTeamMembersQuery,
  PagedTeamMembersResult,
  TeamError,
  TeamGateway,
} from '../../domain';

export interface GetAtRiskMembersUseCaseDeps {
  readonly teamGateway: TeamGateway;
  readonly logger: Logger;
}

/** Fetch a paginated batch of at-risk learners. */
export class GetAtRiskMembersUseCase {
  private readonly teamGateway: TeamGateway;
  private readonly logger: Logger;

  public constructor(deps: GetAtRiskMembersUseCaseDeps) {
    this.teamGateway = deps.teamGateway;
    this.logger = deps.logger.child('get-at-risk-members');
  }

  public async execute(
    query?: GetTeamMembersQuery,
  ): Promise<Result<PagedTeamMembersResult, TeamError>> {
    const result = await this.teamGateway.getAtRiskMembers(query);
    if (!result.ok) {
      this.logger.warn('Fetching at-risk members failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
