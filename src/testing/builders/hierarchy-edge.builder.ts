import type { HierarchyEdge, HierarchyNode } from '@features/hierarchy/domain';

export interface HierarchyEdgeOverrides {
  readonly subordinateId?: string;
  readonly subordinateUserTypeId?: string;
  readonly managerId?: string;
  readonly managerUserTypeId?: string;
  readonly branchId?: string;
  readonly source?: 0 | 5;
}

/** Construct a valid {@link HierarchyEdge} for tests, overriding only what matters per case. */
export const buildHierarchyEdge = (
  overrides: HierarchyEdgeOverrides = {},
): HierarchyEdge => ({
  subordinateId: overrides.subordinateId ?? 'sub-1',
  subordinateUserTypeId: overrides.subordinateUserTypeId ?? 'type-1',
  managerId: overrides.managerId ?? 'mgr-1',
  managerUserTypeId: overrides.managerUserTypeId ?? 'type-2',
  branchId: overrides.branchId ?? 'branch-1',
  source: overrides.source ?? 5,
});

export interface HierarchyNodeOverrides {
  readonly userId?: string;
  readonly userTypeId?: string;
  readonly userTypeName?: string;
  readonly hierarchyLevel?: number;
  readonly reports?: readonly HierarchyNode[];
}

/** Construct a valid {@link HierarchyNode} for tests. */
export const buildHierarchyNode = (
  overrides: HierarchyNodeOverrides = {},
): HierarchyNode => ({
  userId: overrides.userId ?? 'user-1',
  userName: 'Sample User',
  email: 'user@example.com',
  profileImageUrl: null,
  userTypeId: overrides.userTypeId ?? 'type-1',
  userTypeName: overrides.userTypeName ?? 'Consultant',
  hierarchyLevel: overrides.hierarchyLevel ?? 1,
  reports: overrides.reports ?? [],
});
