import { useContext } from 'react';
import { useStore } from 'zustand';
import type { AuthenticatedUser } from '../domain';
import type { AuthState } from '../store';
import type { PortalConfig } from '../infrastructure';
import { AuthStoreContext } from './auth-store-context';

const useAuthState = <T>(selector: (state: AuthState) => T): T => {
  const store = useContext(AuthStoreContext);
  if (store === null) {
    throw new Error('Auth hooks must be used within <AuthStoreProvider>.');
  }
  return useStore(store, selector);
};

export interface UseAuthResult {
  readonly status: AuthState['status'];
  readonly user: AuthenticatedUser | null;
  readonly accessToken: string | null;
  readonly error: string | null;
  readonly isAuthenticated: boolean;
  readonly isInitializing: boolean;
  readonly isBusy: boolean;
  /** Redirect to the Uapp Portal to begin SSO sign-in. */
  readonly beginSso: () => void;
  readonly logout: () => Promise<void>;
  readonly clearError: () => void;
}

/**
 * The single entry point components use to read auth state and trigger auth actions. Selecting
 * primitives (not a fresh object) keeps re-renders minimal without extra equality helpers.
 */
export const useAuth = (): UseAuthResult => {
  const status = useAuthState((state) => state.status);
  const user = useAuthState((state) => state.session?.user ?? null);
  const accessToken = useAuthState((state) => state.session?.accessToken ?? null);
  const error = useAuthState((state) => state.error);
  const beginSso = useAuthState((state) => state.beginSso);
  const logout = useAuthState((state) => state.logout);
  const clearError = useAuthState((state) => state.clearError);

  return {
    status,
    user,
    accessToken,
    error,
    isAuthenticated: status === 'authenticated',
    isInitializing: status === 'initializing',
    isBusy: status === 'authenticating',
    beginSso,
    logout,
    clearError,
  };
};

/** Uapp Portal SSO config (login URL + this app's client secret) — for embedding Portal widgets. */
export const usePortalConfig = (): PortalConfig => useAuthState((state) => state.portal);

/** Raw Portal SSO secret (null if the session predates it) — for embedded Portal widgets. */
export const useSsoSecret = (): string | null => useAuthState((state) => state.ssoSecret);
