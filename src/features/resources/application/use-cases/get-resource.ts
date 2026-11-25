import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Resource, ResourceError, ResourceGateway } from '../../domain';

export interface GetResourceUseCaseDeps {
  readonly resourceGateway: ResourceGateway;
  readonly logger: Logger;
}

/** Fetch a single resource by its ID from the knowledge base. */
export class GetResourceUseCase {
  private readonly resourceGateway: ResourceGateway;
  private readonly logger: Logger;

  public constructor(deps: GetResourceUseCaseDeps) {
    this.resourceGateway = deps.resourceGateway;
    this.logger = deps.logger.child('get-resource');
  }

  public async execute(id: string): Promise<Result<Resource, ResourceError>> {
    const result = await this.resourceGateway.getById(id);
    if (!result.ok) {
      this.logger.warn('Fetching resource by ID failed', {
        id,
        code: result.error.code,
      });
    }
    return result;
  }
}
