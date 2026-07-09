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
export { UserAccount, type UserAccountProps } from './domain';
