import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  GetAtRiskMembersUseCase,
  GetTeamMembersUseCase,
  GetTeamProgressOverviewUseCase,
} from './application';
import { HttpTeamGateway } from './infrastructure';

export interface TeamModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the team feature, consumed via a context provider. */
export interface TeamModule {
  readonly getTeamProgressOverview: GetTeamProgressOverviewUseCase;
  readonly getTeamMembers: GetTeamMembersUseCase;
  readonly getAtRiskMembers: GetAtRiskMembersUseCase;
}

/**
 * Composition root *for the team feature*. Wires the in-memory gateway to the use cases. The
 * only place inside the feature where layers are joined. Bind an HTTP gateway here to go live.
 */
export const createTeamModule = (deps: TeamModuleDeps): TeamModule => {
  const teamGateway = new HttpTeamGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });

  return {
    getTeamProgressOverview: new GetTeamProgressOverviewUseCase({
      teamGateway,
      logger: deps.logger,
    }),
    getTeamMembers: new GetTeamMembersUseCase({
      teamGateway,
      logger: deps.logger,
    }),
    getAtRiskMembers: new GetAtRiskMembersUseCase({
      teamGateway,
      logger: deps.logger,
    }),
  };
};
