import { createStore, type StoreApi } from 'zustand/vanilla';
import { isErr } from '@core/result';
import type { AuthSession } from '../domain';
import type {
  LoginUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  RegisterUseCase,
  RestoreSessionUseCase,
} from '../application';

export type AuthStatus =
  | 'initializing'
  | 'authenticating'
  | 'authenticated'
  | 'unauthenticated';

export interface AuthState {
  readonly status: AuthStatus;
  readonly session: AuthSession | null;
  readonly error: string | null;
  /** Restore a persisted session on app start. Safe to call once. */
  initialize: () => Promise<void>;
  /** Returns true on success so callers can navigate without subscribing to state. */
  login: (email: string, password: string) => Promise<boolean>;
  /** Create a new account and sign in. Returns true on success. */
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  /** Silently refresh the active session. Returns true if a fresh token is now available. */
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
}

/**
 * Dependencies the store delegates to. The store holds NO business logic — it owns UI state and
 * forwards intent to use cases. This keeps it thin (no "fat store" smell) and makes it trivial to
 * test with fake use cases.
 */
export interface AuthStoreDeps {
  readonly loginUseCase: LoginUseCase;
  readonly registerUseCase: RegisterUseCase;
  readonly logoutUseCase: LogoutUseCase;
  readonly restoreSessionUseCase: RestoreSessionUseCase;
  readonly refreshSessionUseCase: RefreshSessionUseCase;
  /** Bridge to the HTTP layer so authorized requests carry the current bearer token. */
  readonly setAccessToken: (token: string | null) => void;
}

export type AuthStore = StoreApi<AuthState>;

export const createAuthStore = (deps: AuthStoreDeps): AuthStore =>
  createStore<AuthState>((set, get) => ({
    status: 'initializing',
    session: null,
    error: null,

    initialize: async (): Promise<void> => {
      set({ status: 'initializing', error: null });
      const result = await deps.restoreSessionUseCase.execute();
      const session = isErr(result) ? null : result.value;
      deps.setAccessToken(session?.accessToken ?? null);
      set({
        status: session ? 'authenticated' : 'unauthenticated',
        session,
      });
    },

    login: async (email: string, password: string): Promise<boolean> => {
      set({ status: 'authenticating', error: null });
      const result = await deps.loginUseCase.execute(email, password);
      if (isErr(result)) {
        set({ status: 'unauthenticated', session: null, error: result.error.message });
        return false;
      }
      deps.setAccessToken(result.value.accessToken);
      set({ status: 'authenticated', session: result.value, error: null });
      return true;
    },

    register: async (email: string, password: string): Promise<boolean> => {
      set({ status: 'authenticating', error: null });
      const result = await deps.registerUseCase.execute(email, password);
      if (isErr(result)) {
        set({ status: 'unauthenticated', session: null, error: result.error.message });
        return false;
      }
      deps.setAccessToken(result.value.accessToken);
      set({ status: 'authenticated', session: result.value, error: null });
      return true;
    },

    logout: async (): Promise<void> => {
      await deps.logoutUseCase.execute(get().session);
      deps.setAccessToken(null);
      set({ status: 'unauthenticated', session: null, error: null });
    },

    refreshSession: async (): Promise<boolean> => {
      const current = get().session;
      if (current === null) {
        return false;
      }
      const result = await deps.refreshSessionUseCase.execute(current);
      if (isErr(result)) {
        deps.setAccessToken(null);
        set({ status: 'unauthenticated', session: null });
        return false;
      }
      deps.setAccessToken(result.value.accessToken);
      set({ status: 'authenticated', session: result.value, error: null });
      return true;
    },

    clearError: (): void => {
      set({ error: null });
    },
  }));
