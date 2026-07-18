import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import type { TeamGateway } from './domain';
import { TeamHttpGateway } from './infrastructure';

export interface TeamsModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export interface TeamsModule {
  readonly gateway: TeamGateway;
}

/** Composition root for the teams feature. Wires the HTTP gateway to the port. */
export const createTeamsModule = (deps: TeamsModuleDeps): TeamsModule => ({
  gateway: new TeamHttpGateway({ httpClient: deps.httpClient, logger: deps.logger }),
});
