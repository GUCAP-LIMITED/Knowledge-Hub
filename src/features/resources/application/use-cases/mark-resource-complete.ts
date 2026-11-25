import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Resource, ResourceError, ResourceGateway } from '../../domain';

export interface MarkResourceCompleteUseCaseDeps {
  readonly resourceGateway: ResourceGateway;
  readonly logger: Logger;
}

/** Mark a resource as completed/downloaded for the current learner (idempotent on the backend). */
export class MarkResourceCompleteUseCase {
  private readonly resourceGateway: ResourceGateway;
  private readonly logger: Logger;

  public constructor(deps: MarkResourceCompleteUseCaseDeps) {
    this.resourceGateway = deps.resourceGateway;
    this.logger = deps.logger.child('mark-resource-complete');
  }

  public async execute(id: string): Promise<Result<Resource, ResourceError>> {
    const result = await this.resourceGateway.markComplete(id);
    if (!result.ok) {
      this.logger.warn('Marking resource complete failed', {
        code: result.error.code,
        id,
      });
    }
    return result;
  }
}
