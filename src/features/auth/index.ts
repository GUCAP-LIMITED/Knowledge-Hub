/**
 * Public API of the `auth` feature. Other features and the app shell import ONLY from here —
 * never from deep internal paths. This barrel is the feature's contract; its internals stay free
 * to change.
 */
export { createAuthModule, type AuthModuleDeps } from './auth-module';
export type { KeyValueStorage } from './infrastructure';
export type { AuthStore, AuthState, AuthStatus } from './store';
export {
  AuthStoreProvider,
  useAuth,
  ProtectedRoute,
  LoginPage,
  SignupPage,
  VerifyPage,
  ForgotPasswordPage,
  type UseAuthResult,
} from './presentation';
export type { AuthenticatedUser, AuthSession } from './domain';
