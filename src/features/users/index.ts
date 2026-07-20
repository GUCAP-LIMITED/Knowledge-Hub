/**
 * Public API of the `users` feature. The app shell and other features import ONLY from here.
 * The user directory is backed by the real API (`BranchAppService` + block/unblock endpoints).
 */
export {
  createUsersModule,
  type UsersModule,
  type UsersModuleDeps,
} from './users-module';
export {
  UsersModuleProvider,
  useBranchUsers,
  useBranches,
  useBlockUser,
  useUnblockUser,
} from './presentation';
export type { BranchUser, BranchListItem, UserRole } from './domain';
export {
  useMyCapabilities,
  type MyCapabilities,
} from './presentation/use-my-capabilities';
export type { CapId } from './presentation/permission-catalog';
export {
  SETTINGS_SECTIONS,
  type SettingsSectionKey,
} from './presentation/settings-sections';
