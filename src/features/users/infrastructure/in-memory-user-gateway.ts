import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  UserAccount,
  type UserError,
  type UserGateway,
  UserNotFoundError,
} from '../domain';
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
  private readonly users: Map<string, UserAccount>;

  public constructor(deps: InMemoryUserGatewayDeps) {
    this.logger = deps.logger.child('user-gateway');
    this.users = new Map(USER_SEED.map((props) => [props.id, new UserAccount(props)]));
  }

  public list(): Promise<Result<readonly UserAccount[], UserError>> {
    this.logger.debug('Listing users', { count: this.users.size });
    return Promise.resolve(ok([...this.users.values()]));
  }

  public getById(id: string): Promise<Result<UserAccount, UserError>> {
    const user = this.users.get(id);
    if (user === undefined) {
      this.logger.warn('User not found', { id });
      return Promise.resolve(err(new UserNotFoundError(id)));
    }
    return Promise.resolve(ok(user));
  }

  public save(user: UserAccount): Promise<Result<UserAccount, UserError>> {
    this.users.set(user.id, user);
    return Promise.resolve(ok(user));
  }
}
