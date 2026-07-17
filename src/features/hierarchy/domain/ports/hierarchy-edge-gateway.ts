import type { Result } from '@core/result';
import type { HierarchyError } from '../errors/hierarchy-edge-errors';
import type { HierarchyNode } from '../entities/hierarchy-node';
import type { HierarchyEdge } from '../entities/hierarchy-edge';

/** Identifies a subordinate `(user, type)` in a branch — the composite key of an edge. */
export interface EdgeKey {
  readonly subordinateId: string;
  readonly subordinateUserTypeId: string;
  readonly branchId: string;
}

/** Full input to assign/replace a subordinate's manager. */
export interface AssignManagerInput extends EdgeKey {
  readonly managerId: string;
  readonly managerUserTypeId: string;
}

/**
 * Port to the user-hierarchy service. The domain states the contract in its own terms; HTTP details
 * live in the infrastructure implementation.
 */
export interface HierarchyGateway {
  /** The nested org chart for a branch. */
  branchTree(branchId: string): Promise<Result<readonly HierarchyNode[], HierarchyError>>;

  /** Flat edges, optionally filtered to one branch. */
  edges(branchId?: string): Promise<Result<readonly HierarchyEdge[], HierarchyError>>;

  /** Set or replace a subordinate's manager (writes a Local override). */
  assignManager(
    input: AssignManagerInput,
  ): Promise<Result<HierarchyEdge, HierarchyError>>;

  /** Remove a Local override edge by its composite key. */
  removeOverride(key: EdgeKey): Promise<Result<void, HierarchyError>>;
}
