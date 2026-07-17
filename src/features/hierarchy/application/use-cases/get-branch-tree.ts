import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { HierarchyError, HierarchyGateway, HierarchyNode } from '../../domain';

export interface GetBranchTreeUseCaseDeps {
  readonly hierarchyGateway: HierarchyGateway;
  readonly logger: Logger;
}

/** Load the nested org chart for a branch. */
export class GetBranchTreeUseCase {
  private readonly hierarchyGateway: HierarchyGateway;
  private readonly logger: Logger;

  public constructor(deps: GetBranchTreeUseCaseDeps) {
    this.hierarchyGateway = deps.hierarchyGateway;
    this.logger = deps.logger.child('get-branch-tree');
  }

  public async execute(
    branchId: string,
  ): Promise<Result<readonly HierarchyNode[], HierarchyError>> {
    const result = await this.hierarchyGateway.branchTree(branchId);
    if (!result.ok) {
      this.logger.warn('Loading branch tree failed', { code: result.error.code });
    }
    return result;
  }
}
