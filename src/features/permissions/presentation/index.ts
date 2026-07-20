export * from './PermissionsModuleProvider';
export * from './use-permissions';
export * from './use-permissions-module';
export { PermissionsManager } from './PermissionsManager';
export {
  UserPermissionsEditor,
  type UserPermissionsEditorProps,
} from './UserPermissionsEditor';
export { iconFor } from './module-icons';
// PermissionsPage is deliberately omitted: the router lazy-imports it directly so it is code-split.
