/** Assignment source of a hierarchy edge. Mirrors the backend `AssignmentSource`. */
export type AssignmentSource = 0 | 5; // 0 Portal (sync-managed) · 5 Local (admin override)

/**
 * One org-chart edge (from `GET /api/app/user-hierarchy`): in a branch, a subordinate acting under a
 * user type reports to a manager acting under a user type.
 */
export interface HierarchyEdge {
  readonly subordinateId: string;
  readonly subordinateUserTypeId: string;
  readonly managerId: string;
  readonly managerUserTypeId: string;
  readonly branchId: string;
  readonly source: AssignmentSource;
}
