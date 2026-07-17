/**
 * Public API of the permissions feature. Other features and the app shell import ONLY from here.
 */
export {
  createPermissionsModule,
  type PermissionsModule,
  type PermissionsModuleDeps,
} from './permissions-module';
export {
  PermissionsModuleProvider,
  PermissionsManager,
  useMyPermissions,
  useMyPermissionModules,
  useHasPermission,
  usePermissionSets,
  usePermissionSet,
  useTypeDefaults,
  useCreatePermissionSet,
  useUpdatePermissionSet,
  useDeletePermissionSet,
  useSetTypeDefault,
  permissionKeys,
  iconFor,
} from './presentation';
export type {
  PermissionMap,
  PermissionSetSummary,
  PermissionSetDetail,
  PermissionModule,
  SidebarGroup,
  SidebarModule,
  UserTypeDefault,
} from './domain';

// NOTE: PermissionsPage is intentionally NOT re-exported — the router lazy-loads it from its module path
// so it can be code-split into its own chunk.
