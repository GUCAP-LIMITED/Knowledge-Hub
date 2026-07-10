import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { ResourceError, ResourceGateway } from '../../domain';

export interface DeleteResourceUseCaseDeps {
  readonly resourceGateway: ResourceGateway;
  readonly logger: Logger;
}

/** Remove a resource from the knowledge base (admin). */
export class DeleteResourceUseCase {
  private readonly resourceGateway: ResourceGateway;
  private readonly logger: Logger;

  public constructor(deps: DeleteResourceUseCaseDeps) {
    this.resourceGateway = deps.resourceGateway;
    this.logger = deps.logger.child('delete-resource');
  }

  public execute(id: string): Promise<Result<void, ResourceError>> {
    this.logger.info('Deleting resource', { id });
    return this.resourceGateway.remove(id);
  }
}
