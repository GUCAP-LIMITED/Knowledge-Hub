import type { Logger } from '@core/logger';
import {
  CreateAssignmentUseCase,
  DeleteAssignmentUseCase,
  ListAssignmentsUseCase,
} from './application';
import { InMemoryAssignmentGateway } from './infrastructure';

export interface AssignmentsModuleDeps {
  readonly logger: Logger;
}

/** The use cases exposed by the assignments feature, consumed via a context provider. */
export interface AssignmentsModule {
  readonly listAssignments: ListAssignmentsUseCase;
  readonly createAssignment: CreateAssignmentUseCase;
  readonly deleteAssignment: DeleteAssignmentUseCase;
}

/** Composition root for the assignments feature: wires the in-memory gateway to the use cases. */
export const createAssignmentsModule = (
  deps: AssignmentsModuleDeps,
): AssignmentsModule => {
  const assignmentGateway = new InMemoryAssignmentGateway({ logger: deps.logger });
  const shared = { assignmentGateway, logger: deps.logger };

  return {
    listAssignments: new ListAssignmentsUseCase(shared),
    createAssignment: new CreateAssignmentUseCase(shared),
    deleteAssignment: new DeleteAssignmentUseCase(shared),
  };
};
