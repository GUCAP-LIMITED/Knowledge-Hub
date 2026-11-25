import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import type { UserDirectoryGateway, PlatformSettingsGateway } from './domain';
import { UserDirectoryHttpGateway, PlatformSettingsHttpGateway } from './infrastructure';

export interface UsersModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The users feature module — the API-backed user directory gateway. */
export interface UsersModule {
  readonly gateway: UserDirectoryGateway;
  readonly platformSettingsGateway: PlatformSettingsGateway;
}

/** Composition root for the users feature. Wires the HTTP gateway to the port. */
export const createUsersModule = (deps: UsersModuleDeps): UsersModule => ({
  gateway: new UserDirectoryHttpGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  }),
  platformSettingsGateway: new PlatformSettingsHttpGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  }),
});
