import type { Logger } from '@core/logger';
import { type Result, ok } from '@core/result';
import { TeamMember, type TeamError, type TeamGateway } from '../domain';
import { TEAM_SEED } from './team-seed';

export interface InMemoryTeamGatewayDeps {
  readonly logger: Logger;
}

/**
 * In-memory implementation of {@link TeamGateway}, seeded from the prototype roster. A legitimate
 * infrastructure adapter (storage, not network) — it keeps the app a working prototype with no
 * backend while honouring the port contract. Replace with an HTTP adapter to go live.
 */
export class InMemoryTeamGateway implements TeamGateway {
  private readonly logger: Logger;
  private readonly members: readonly TeamMember[];

  public constructor(deps: InMemoryTeamGatewayDeps) {
    this.logger = deps.logger.child('team-gateway');
    this.members = TEAM_SEED.map((props) => new TeamMember(props));
  }

  public list(): Promise<Result<readonly TeamMember[], TeamError>> {
    this.logger.debug('Listing team members', { count: this.members.length });
    return Promise.resolve(ok([...this.members]));
  }
}
