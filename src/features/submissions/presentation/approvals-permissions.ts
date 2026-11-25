/**
 * Mirrors backend `ApprovalsPermissions` in `UappAcademy.Domain.Shared.Authorization.ApprovalsPermissions`.
 */
export const ApprovalsPermissions = {
  GroupName: 'Approvals',
  View: 'Approvals.View',
  Approve: 'Approvals.Approve',
  Reject: 'Approvals.Reject',
  Publish: 'Approvals.Publish',
} as const;

export type ApprovalsPermissionKey =
  (typeof ApprovalsPermissions)[keyof typeof ApprovalsPermissions];
