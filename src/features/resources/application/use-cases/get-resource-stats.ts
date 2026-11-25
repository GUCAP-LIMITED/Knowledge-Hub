import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { ResourceError, ResourceGateway, ResourceStats } from '../../domain';

export interface GetResourceStatsUseCaseDeps {
  readonly resourceGateway: ResourceGateway;
  readonly logger: Logger;
}

/** Fetch knowledge base statistics (total count and per-category counts). */
export class GetResourceStatsUseCase {
  private readonly resourceGateway: ResourceGateway;
  private readonly logger: Logger;

  public constructor(deps: GetResourceStatsUseCaseDeps) {
    this.resourceGateway = deps.resourceGateway;
    this.logger = deps.logger.child('get-resource-stats');
  }

  public async execute(): Promise<Result<ResourceStats, ResourceError>> {
    const result = await this.resourceGateway.getStats();
    if (!result.ok) {
      this.logger.warn('Fetching resource stats failed', { code: result.error.code });
    }
    return result;
  }
}
