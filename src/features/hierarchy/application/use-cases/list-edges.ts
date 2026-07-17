import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { HierarchyEdge, HierarchyError, HierarchyGateway } from '../../domain';

export interface ListEdgesUseCaseDeps {
  readonly hierarchyGateway: HierarchyGateway;
  readonly logger: Logger;
}

/** List the flat reporting edges, optionally scoped to one branch. */
export class ListEdgesUseCase {
  private readonly hierarchyGateway: HierarchyGateway;
  private readonly logger: Logger;

  public constructor(deps: ListEdgesUseCaseDeps) {
    this.hierarchyGateway = deps.hierarchyGateway;
    this.logger = deps.logger.child('list-edges');
  }

  public async execute(
    branchId?: string,
  ): Promise<Result<readonly HierarchyEdge[], HierarchyError>> {
    const result = await this.hierarchyGateway.edges(branchId);
    if (!result.ok) {
      this.logger.warn('Listing edges failed', { code: result.error.code });
    }
    return result;
  }
}
