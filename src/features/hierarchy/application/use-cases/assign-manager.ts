import { type Result, err } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type AssignManagerInput,
  type HierarchyEdge,
  type HierarchyError,
  type HierarchyGateway,
  HierarchyRuleError,
} from '../../domain';

export interface AssignManagerUseCaseDeps {
  readonly hierarchyGateway: HierarchyGateway;
  readonly logger: Logger;
}

/** Assign or replace a subordinate's manager. Rejects a self-manager before hitting the API. */
export class AssignManagerUseCase {
  private readonly hierarchyGateway: HierarchyGateway;
  private readonly logger: Logger;

  public constructor(deps: AssignManagerUseCaseDeps) {
    this.hierarchyGateway = deps.hierarchyGateway;
    this.logger = deps.logger.child('assign-manager');
  }

  public async execute(
    input: AssignManagerInput,
  ): Promise<Result<HierarchyEdge, HierarchyError>> {
    if (input.subordinateId === input.managerId) {
      return err(new HierarchyRuleError('A user cannot be their own manager.'));
    }

    const result = await this.hierarchyGateway.assignManager(input);
    if (!result.ok) {
      this.logger.warn('Assigning manager failed', { code: result.error.code });
    }
    return result;
  }
}
