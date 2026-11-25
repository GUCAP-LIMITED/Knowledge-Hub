import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { TeamProgressOverview, TeamError, TeamGateway } from '../../domain';

export interface GetTeamProgressOverviewUseCaseDeps {
  readonly teamGateway: TeamGateway;
  readonly logger: Logger;
}

/** Fetch the whole team progress overview. Pure orchestration: delegate to the gateway and return its `Result`. */
export class GetTeamProgressOverviewUseCase {
  private readonly teamGateway: TeamGateway;
  private readonly logger: Logger;

  public constructor(deps: GetTeamProgressOverviewUseCaseDeps) {
    this.teamGateway = deps.teamGateway;
    this.logger = deps.logger.child('get-team-progress-overview');
  }

  public async execute(): Promise<Result<TeamProgressOverview, TeamError>> {
    const result = await this.teamGateway.getOverview();
    if (!result.ok) {
      this.logger.warn('Fetching team progress overview failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
