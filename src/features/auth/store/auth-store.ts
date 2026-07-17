import { createStore, type StoreApi } from 'zustand/vanilla';
import { isErr } from '@core/result';
import type { AuthSession } from '../domain';
import { buildPortalLoginUrl, type PortalConfig } from '../infrastructure';
import type {
  ExchangeSsoSecretUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
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
  /** Exchange a Portal SSO secret (the `?token=` value) for a session. Returns true on success. */
  exchangeSso: (secret: string) => Promise<boolean>;
  /** Redirect the browser to the Uapp Portal login screen. */
  beginSso: () => void;
  logout: () => Promise<void>;
  /** Silently refresh the active session. Returns true if a fresh token is now available. */
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
}

/**
 * Dependencies the store delegates to. The store holds NO business logic — it owns UI state and
 * forwards intent to use cases. This keeps it thin and trivial to test with fake use cases.
 */
export interface AuthStoreDeps {
  readonly exchangeSsoUseCase: ExchangeSsoSecretUseCase;
  readonly logoutUseCase: LogoutUseCase;
  readonly restoreSessionUseCase: RestoreSessionUseCase;
  readonly refreshSessionUseCase: RefreshSessionUseCase;
  /** Bridge to the HTTP layer so authorized requests carry the current bearer token. */
  readonly setAccessToken: (token: string | null) => void;
  /** Uapp Portal SSO configuration for `beginSso`. */
  readonly portal: PortalConfig;
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

    exchangeSso: async (secret: string): Promise<boolean> => {
      set({ status: 'authenticating', error: null });
      const result = await deps.exchangeSsoUseCase.execute(secret);
      if (isErr(result)) {
        set({ status: 'unauthenticated', session: null, error: result.error.message });
        return false;
      }
      deps.setAccessToken(result.value.accessToken);
      set({ status: 'authenticated', session: result.value, error: null });
      return true;
    },

    beginSso: (): void => {
      if (typeof window === 'undefined') {
        return;
      }
      const url = buildPortalLoginUrl(deps.portal, {
        origin: window.location.origin,
        pathname: window.location.pathname,
      });
      window.location.assign(url);
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
