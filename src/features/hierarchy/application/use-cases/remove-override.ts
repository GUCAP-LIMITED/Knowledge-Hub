import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { EdgeKey, HierarchyError, HierarchyGateway } from '../../domain';

export interface RemoveOverrideUseCaseDeps {
  readonly hierarchyGateway: HierarchyGateway;
  readonly logger: Logger;
}

/** Remove a Local override reporting line. */
export class RemoveOverrideUseCase {
  private readonly hierarchyGateway: HierarchyGateway;
  private readonly logger: Logger;

  public constructor(deps: RemoveOverrideUseCaseDeps) {
    this.hierarchyGateway = deps.hierarchyGateway;
    this.logger = deps.logger.child('remove-override');
  }

  public async execute(key: EdgeKey): Promise<Result<void, HierarchyError>> {
    const result = await this.hierarchyGateway.removeOverride(key);
    if (!result.ok) {
      this.logger.warn('Removing override failed', { code: result.error.code });
    }
    return result;
  }
}
