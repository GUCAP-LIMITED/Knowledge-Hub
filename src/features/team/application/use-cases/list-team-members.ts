import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { TeamMember, TeamError, TeamGateway } from '../../domain';

export interface ListTeamMembersUseCaseDeps {
  readonly teamGateway: TeamGateway;
  readonly logger: Logger;
}

/** Fetch the whole team roster. Pure orchestration: delegate to the gateway and return its `Result`. */
export class ListTeamMembersUseCase {
  private readonly teamGateway: TeamGateway;
  private readonly logger: Logger;

  public constructor(deps: ListTeamMembersUseCaseDeps) {
    this.teamGateway = deps.teamGateway;
    this.logger = deps.logger.child('list-team-members');
  }

  public async execute(): Promise<Result<readonly TeamMember[], TeamError>> {
    const result = await this.teamGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing team members failed', { code: result.error.code });
    }
    return result;
  }
}
