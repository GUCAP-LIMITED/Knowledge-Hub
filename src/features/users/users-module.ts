import type { Logger } from '@core/logger';
import { ListUsersUseCase, SetUserStatusUseCase } from './application';
import { InMemoryUserGateway } from './infrastructure';

export interface UsersModuleDeps {
  readonly logger: Logger;
}

/** The use cases exposed by the users feature, consumed via a context provider. */
export interface UsersModule {
  readonly listUsers: ListUsersUseCase;
  readonly setUserStatus: SetUserStatusUseCase;
}

/**
 * Composition root *for the users feature*. Wires the in-memory gateway to the use cases. The
 * only place inside the feature where layers are joined. Bind an HTTP gateway here to go live.
 */
export const createUsersModule = (deps: UsersModuleDeps): UsersModule => {
  const userGateway = new InMemoryUserGateway({ logger: deps.logger });
  const shared = { userGateway, logger: deps.logger };

  return {
    listUsers: new ListUsersUseCase(shared),
    setUserStatus: new SetUserStatusUseCase(shared),
  };
};
