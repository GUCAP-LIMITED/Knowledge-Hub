export * from './PermissionsModuleProvider';
export * from './use-permissions';
export * from './use-permissions-module';
export { PermissionsManager } from './PermissionsManager';
export {
  UserPermissionsEditor,
  type UserPermissionsEditorProps,
} from './UserPermissionsEditor';
export { iconFor } from './module-icons';
export { buildRoutePermissionLookup } from './route-permission-lookup';
export { hasPermissionGrant } from './permission-grant';
export { useCanAccessRoute } from './use-can-access-route';
// PermissionsPage is deliberately omitted: the router lazy-imports it directly so it is code-split.
