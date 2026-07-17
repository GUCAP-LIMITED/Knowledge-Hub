import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import {
  ExchangeSsoSecretUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  RestoreSessionUseCase,
} from './application';
import {
  AcademyAuthGateway,
  type AcademyOAuthConfig,
  LocalSessionStore,
  type KeyValueStorage,
  type PortalConfig,
} from './infrastructure';
import { createAuthStore, type AuthStore } from './store';

export interface AuthModuleDeps {
  readonly httpClient: HttpClient;
  readonly clock: Clock;
  readonly logger: Logger;
  readonly storage: KeyValueStorage;
  /** Bridges the active token into the HTTP layer (set by the composition root). */
  readonly setAccessToken: (token: string | null) => void;
  /** Uapp Portal SSO redirect config. */
  readonly portal: PortalConfig;
  /** OpenIddict client id + scope for the token exchange. */
  readonly oauth: AcademyOAuthConfig;
}

/**
 * Composition root *for the auth feature*. Wires the concrete SSO gateway to the use cases and
 * returns a ready-to-use store. This is the only place inside the feature where layers are joined.
 */
export const createAuthModule = (deps: AuthModuleDeps): AuthStore => {
  const authGateway = new AcademyAuthGateway({
    httpClient: deps.httpClient,
    clock: deps.clock,
    logger: deps.logger,
    oauth: deps.oauth,
  });

  const sessionStore = new LocalSessionStore(deps.storage, deps.logger);

  return createAuthStore({
    exchangeSsoUseCase: new ExchangeSsoSecretUseCase({
      authGateway,
      sessionStore,
      logger: deps.logger,
    }),
    logoutUseCase: new LogoutUseCase({ authGateway, sessionStore, logger: deps.logger }),
    restoreSessionUseCase: new RestoreSessionUseCase({
      authGateway,
      sessionStore,
      clock: deps.clock,
      logger: deps.logger,
    }),
    refreshSessionUseCase: new RefreshSessionUseCase({
      authGateway,
      sessionStore,
      logger: deps.logger,
    }),
    setAccessToken: deps.setAccessToken,
    portal: deps.portal,
  });
};
