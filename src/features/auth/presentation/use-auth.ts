import { useContext } from 'react';
import { useStore } from 'zustand';
import type { AuthenticatedUser } from '../domain';
import type { AuthState } from '../store';
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
  readonly error: string | null;
  readonly isAuthenticated: boolean;
  readonly isInitializing: boolean;
  readonly isBusy: boolean;
  readonly login: (email: string, password: string) => Promise<boolean>;
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
  const error = useAuthState((state) => state.error);
  const login = useAuthState((state) => state.login);
  const logout = useAuthState((state) => state.logout);
  const clearError = useAuthState((state) => state.clearError);

  return {
    status,
    user,
    error,
    isAuthenticated: status === 'authenticated',
    isInitializing: status === 'initializing',
    isBusy: status === 'authenticating',
    login,
    logout,
    clearError,
  };
};
