import { type Result, ok } from '@core/result';
import type {
  AssignManagerInput,
  EdgeKey,
  HierarchyEdge,
  HierarchyError,
  HierarchyGateway,
  HierarchyNode,
} from '@features/hierarchy/domain';
import { buildHierarchyEdge } from '../builders/hierarchy-edge.builder';

/** Hand-written, fully-typed fake of the {@link HierarchyGateway} port. */
export class FakeHierarchyEdgeGateway implements HierarchyGateway {
  public treeResult: Result<readonly HierarchyNode[], HierarchyError> = ok([]);
  public edgesResult: Result<readonly HierarchyEdge[], HierarchyError> = ok([]);
  public assignResult: Result<HierarchyEdge, HierarchyError> = ok(buildHierarchyEdge());
  public removeResult: Result<void, HierarchyError> = ok(undefined);

  public lastAssign: AssignManagerInput | null = null;
  public lastRemove: EdgeKey | null = null;

  public branchTree(): Promise<Result<readonly HierarchyNode[], HierarchyError>> {
    return Promise.resolve(this.treeResult);
  }

  public edges(): Promise<Result<readonly HierarchyEdge[], HierarchyError>> {
    return Promise.resolve(this.edgesResult);
  }

  public assignManager(
    input: AssignManagerInput,
  ): Promise<Result<HierarchyEdge, HierarchyError>> {
    this.lastAssign = input;
    return Promise.resolve(this.assignResult);
  }

  public removeOverride(key: EdgeKey): Promise<Result<void, HierarchyError>> {
    this.lastRemove = key;
    return Promise.resolve(this.removeResult);
  }
}
