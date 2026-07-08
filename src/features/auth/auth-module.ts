import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import type { AuthGateway } from './domain';
import {
  LoginUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  RestoreSessionUseCase,
} from './application';
import {
  AuthHttpGateway,
  InMemoryAuthGateway,
  LocalSessionStore,
  type KeyValueStorage,
} from './infrastructure';
import { createAuthStore, type AuthStore } from './store';

export interface AuthModuleDeps {
  readonly httpClient: HttpClient;
  readonly clock: Clock;
  readonly logger: Logger;
  readonly storage: KeyValueStorage;
  /** Bridges the active token into the HTTP layer (set by the composition root). */
  readonly setAccessToken: (token: string | null) => void;
  /** When true, authenticate against the in-memory demo directory instead of the HTTP API. */
  readonly demoAuth?: boolean;
}

/**
 * Composition root *for the auth feature*. Wires concrete infrastructure to the use cases and
 * returns a ready-to-use store. This is the only place inside the feature where layers are joined;
 * everything else depends on abstractions. `demoAuth` swaps the gateway adapter — nothing in the
 * domain/application/presentation changes, which is the whole point of the port.
 */
export const createAuthModule = (deps: AuthModuleDeps): AuthStore => {
  const authGateway: AuthGateway =
    deps.demoAuth === true
      ? new InMemoryAuthGateway({ clock: deps.clock, logger: deps.logger })
      : new AuthHttpGateway({
          httpClient: deps.httpClient,
          clock: deps.clock,
          logger: deps.logger,
        });

  const sessionStore = new LocalSessionStore(deps.storage, deps.logger);

  const loginUseCase = new LoginUseCase({
    authGateway,
    sessionStore,
    logger: deps.logger,
  });

  const logoutUseCase = new LogoutUseCase({
    authGateway,
    sessionStore,
    logger: deps.logger,
  });

  const restoreSessionUseCase = new RestoreSessionUseCase({
    authGateway,
    sessionStore,
    clock: deps.clock,
    logger: deps.logger,
  });

  const refreshSessionUseCase = new RefreshSessionUseCase({
    authGateway,
    sessionStore,
    logger: deps.logger,
  });

  return createAuthStore({
    loginUseCase,
    logoutUseCase,
    restoreSessionUseCase,
    refreshSessionUseCase,
    setAccessToken: deps.setAccessToken,
  });
};
