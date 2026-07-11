/**
 * Public API of the `users` feature. The app shell and other features import ONLY from here.
 * Backed by an in-memory gateway seeded from the prototype directory (swap for HTTP to go live).
 */
export {
  createUsersModule,
  type UsersModule,
  type UsersModuleDeps,
} from './users-module';
export { UsersModuleProvider, useUsers, usersQueryKey } from './presentation';
export {
  useMyCapabilities,
  type MyCapabilities,
} from './presentation/use-my-capabilities';
export { Can, type CanProps } from './presentation/Can';
export type { CapId } from './presentation/permission-catalog';
export { UserAccount, type UserAccountProps } from './domain';
export {
  SETTINGS_SECTIONS,
  type SettingsSectionKey,
} from './presentation/settings-sections';
