import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Assignment, AssignmentError, AssignmentGateway } from '../../domain';

export interface ListAssignmentsUseCaseDeps {
  readonly assignmentGateway: AssignmentGateway;
  readonly logger: Logger;
}

/** Fetch every assignment. Pure orchestration: delegate to the gateway and return its `Result`. */
export class ListAssignmentsUseCase {
  private readonly assignmentGateway: AssignmentGateway;
  private readonly logger: Logger;

  public constructor(deps: ListAssignmentsUseCaseDeps) {
    this.assignmentGateway = deps.assignmentGateway;
    this.logger = deps.logger.child('list-assignments');
  }

  public async execute(): Promise<Result<readonly Assignment[], AssignmentError>> {
    const result = await this.assignmentGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing assignments failed', { code: result.error.code });
    }
    return result;
  }
}
