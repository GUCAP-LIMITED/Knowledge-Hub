import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { AssignmentError, AssignmentGateway } from '../../domain';

export interface DeleteAssignmentUseCaseDeps {
  readonly assignmentGateway: AssignmentGateway;
  readonly logger: Logger;
}

/** Remove a training assignment by id. */
export class DeleteAssignmentUseCase {
  private readonly assignmentGateway: AssignmentGateway;
  private readonly logger: Logger;

  public constructor(deps: DeleteAssignmentUseCaseDeps) {
    this.assignmentGateway = deps.assignmentGateway;
    this.logger = deps.logger.child('delete-assignment');
  }

  public async execute(id: string): Promise<Result<void, AssignmentError>> {
    const result = await this.assignmentGateway.remove(id);
    if (!result.ok) {
      this.logger.warn('Deleting assignment failed', { code: result.error.code, id });
    }
    return result;
  }
}
