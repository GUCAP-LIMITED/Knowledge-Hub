import type {
  PermissionSetDetail,
  PermissionSetSummary,
  UserTypeDefault,
} from '@features/permissions/domain';

export interface PermissionSetOverrides {
  readonly id?: string;
  readonly name?: string;
  readonly isSystemDefault?: boolean;
}

/** Construct a {@link PermissionSetSummary} for tests. */
export const buildPermissionSetSummary = (
  overrides: PermissionSetOverrides = {},
): PermissionSetSummary => ({
  id: overrides.id ?? 'permission-set-1',
  name: overrides.name ?? 'FullAccess',
  description: 'Complete access',
  color: '#059669',
  bgColor: '#D1FAE5',
  isSystemDefault: overrides.isSystemDefault ?? true,
  enabledCount: 25,
  totalCount: 25,
});

/** Construct a {@link PermissionSetDetail} for tests. */
export const buildPermissionSetDetail = (
  overrides: PermissionSetOverrides = {},
): PermissionSetDetail => ({
  ...buildPermissionSetSummary(overrides),
  permissionModules: [],
});

/** Construct a {@link UserTypeDefault} for tests. */
export const buildUserTypeDefault = (
  overrides: Partial<UserTypeDefault> = {},
): UserTypeDefault => ({
  userTypeId: overrides.userTypeId ?? 'ut-1',
  userTypeName: overrides.userTypeName ?? 'BranchManager',
  permissionSetRoleId: overrides.permissionSetRoleId ?? 'permission-set-1',
  permissionSetName: overrides.permissionSetName ?? 'FullAccess',
  userCount: overrides.userCount ?? 3,
});
