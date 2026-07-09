import type { Logger } from '@core/logger';
import { type Result, ok } from '@core/result';
import { UserAccount, type UserError, type UserGateway } from '../domain';
import { USER_SEED } from './user-seed';

export interface InMemoryUserGatewayDeps {
  readonly logger: Logger;
}

/**
 * In-memory implementation of {@link UserGateway}, seeded from the prototype directory. A
 * legitimate infrastructure adapter (storage, not network) — it keeps the app a working prototype
 * with no backend while honouring the port contract. Replace with an HTTP adapter to go live.
 */
export class InMemoryUserGateway implements UserGateway {
  private readonly logger: Logger;
  private readonly users: readonly UserAccount[];

  public constructor(deps: InMemoryUserGatewayDeps) {
    this.logger = deps.logger.child('user-gateway');
    this.users = USER_SEED.map((props) => new UserAccount(props));
  }

  public list(): Promise<Result<readonly UserAccount[], UserError>> {
    this.logger.debug('Listing users', { count: this.users.length });
    return Promise.resolve(ok([...this.users]));
  }
}
