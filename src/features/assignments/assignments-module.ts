import type { Logger } from '@core/logger';
import {
  CreateAssignmentUseCase,
  DeleteAssignmentUseCase,
  ListAssignmentsUseCase,
  SearchAssignableUsersUseCase,
} from './application';
import { HttpAssignmentGateway } from './infrastructure';

import type { HttpClient } from '@core/http';

export interface AssignmentsModuleDeps {
  readonly logger: Logger;
  readonly httpClient: HttpClient;
}

/** The use cases exposed by the assignments feature, consumed via a context provider. */
export interface AssignmentsModule {
  readonly listAssignments: ListAssignmentsUseCase;
  readonly createAssignment: CreateAssignmentUseCase;
  readonly deleteAssignment: DeleteAssignmentUseCase;
  readonly searchAssignableUsers: SearchAssignableUsersUseCase;
}

/** Composition root for the assignments feature: wires the in-memory gateway to the use cases. */
export const createAssignmentsModule = (
  deps: AssignmentsModuleDeps,
): AssignmentsModule => {
  const assignmentGateway = new HttpAssignmentGateway({
    logger: deps.logger,
    httpClient: deps.httpClient,
  });
  const shared = { assignmentGateway, logger: deps.logger };

  return {
    listAssignments: new ListAssignmentsUseCase(shared),
    createAssignment: new CreateAssignmentUseCase(shared),
    deleteAssignment: new DeleteAssignmentUseCase(shared),
    searchAssignableUsers: new SearchAssignableUsersUseCase(shared),
  };
};
