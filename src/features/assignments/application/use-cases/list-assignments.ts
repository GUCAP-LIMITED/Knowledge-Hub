import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  AssignmentError,
  AssignmentGateway,
  AssignmentListFilter,
  AssignmentListResult,
} from '../../domain';

export interface ListAssignmentsUseCaseDeps {
  readonly assignmentGateway: AssignmentGateway;
  readonly logger: Logger;
}

/** Fetch assignments, optionally filtered by status. Pure orchestration over the gateway. */
export class ListAssignmentsUseCase {
  private readonly assignmentGateway: AssignmentGateway;
  private readonly logger: Logger;

  public constructor(deps: ListAssignmentsUseCaseDeps) {
    this.assignmentGateway = deps.assignmentGateway;
    this.logger = deps.logger.child('list-assignments');
  }

  public async execute(
    filter?: AssignmentListFilter,
  ): Promise<Result<AssignmentListResult, AssignmentError>> {
    const result = await this.assignmentGateway.list(filter);
    if (!result.ok) {
      this.logger.warn('Listing assignments failed', { code: result.error.code });
    }
    return result;
  }
}
