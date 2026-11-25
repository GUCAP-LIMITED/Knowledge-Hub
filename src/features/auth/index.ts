/**
 * Public API of the `auth` feature. Other features and the app shell import ONLY from here —
 * never from deep internal paths. This barrel is the feature's contract; its internals stay free
 * to change.
 */
export { createAuthModule, type AuthModuleDeps } from './auth-module';
export { buildPortalParams } from './infrastructure';
export type { KeyValueStorage, PortalConfig } from './infrastructure';
export type { AuthStore, AuthState, AuthStatus } from './store';
export {
  AuthStoreProvider,
  useAuth,
  usePortalConfig,
  useSsoSecret,
  ProtectedRoute,
  LoginPage,
  type UseAuthResult,
} from './presentation';
export type { AuthenticatedUser, AuthSession } from './domain';
