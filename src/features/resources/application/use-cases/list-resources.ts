import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Resource, ResourceError, ResourceGateway } from '../../domain';

export interface ListResourcesUseCaseDeps {
  readonly resourceGateway: ResourceGateway;
  readonly logger: Logger;
}

/** Fetch the whole knowledge base. Pure orchestration: delegate to the gateway and return its `Result`. */
export class ListResourcesUseCase {
  private readonly resourceGateway: ResourceGateway;
  private readonly logger: Logger;

  public constructor(deps: ListResourcesUseCaseDeps) {
    this.resourceGateway = deps.resourceGateway;
    this.logger = deps.logger.child('list-resources');
  }

  public async execute(): Promise<Result<readonly Resource[], ResourceError>> {
    const result = await this.resourceGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing resources failed', { code: result.error.code });
    }
    return result;
  }
}
