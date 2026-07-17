/**
 * A node in a branch org-chart (from `GET /api/app/user-hierarchy/branch/{branchId}/tree`).
 * Recursive: `reports` holds the node's direct reports.
 */
export interface HierarchyNode {
  readonly userId: string;
  readonly userName: string | null;
  readonly email: string | null;
  readonly profileImageUrl: string | null;
  readonly userTypeId: string;
  readonly userTypeName: string;
  readonly hierarchyLevel: number;
  readonly reports: readonly HierarchyNode[];
}
