import type { Logger } from '@core/logger';
import { ListTeamMembersUseCase } from './application';
import { InMemoryTeamGateway } from './infrastructure';

export interface TeamModuleDeps {
  readonly logger: Logger;
}

/** The use cases exposed by the team feature, consumed via a context provider. */
export interface TeamModule {
  readonly listTeamMembers: ListTeamMembersUseCase;
}

/**
 * Composition root *for the team feature*. Wires the in-memory gateway to the use cases. The
 * only place inside the feature where layers are joined. Bind an HTTP gateway here to go live.
 */
export const createTeamModule = (deps: TeamModuleDeps): TeamModule => {
  const teamGateway = new InMemoryTeamGateway({ logger: deps.logger });

  return {
    listTeamMembers: new ListTeamMembersUseCase({ teamGateway, logger: deps.logger }),
  };
};
