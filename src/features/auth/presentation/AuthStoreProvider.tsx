import { useEffect, type ReactElement, type ReactNode } from 'react';
import type { AuthStore } from '../store';
import { AuthStoreContext } from './auth-store-context';

const SSO_PARAMS = ['token', 'pathname', 'redirect', 'logout', 'key'] as const;

/** Only same-origin absolute paths are safe post-login redirect targets. */
function safePath(raw: string | null): string {
  if (raw === null || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/';
  }
  return raw;
}

/** Where to land after a successful exchange: the echoed `pathname`, minus the SSO params. */
function cleanDestination(params: URLSearchParams): string {
  const target = safePath(params.get('pathname'));
  const rest = new URLSearchParams(params);
  for (const key of SSO_PARAMS) {
    rest.delete(key);
  }
  const query = rest.toString();
  return query.length > 0 ? `${target}?${query}` : target;
}

/** Strip the SSO params from the current URL without navigating (used on a failed exchange). */
function stripSsoParamsInPlace(params: URLSearchParams): void {
  for (const key of SSO_PARAMS) {
    params.delete(key);
  }
  const query = params.toString();
  const next =
    window.location.pathname +
    (query.length > 0 ? `?${query}` : '') +
    window.location.hash;
  window.history.replaceState({}, '', next);
}

export interface AuthStoreProviderProps {
  readonly store: AuthStore;
  readonly children: ReactNode;
}

/**
 * Provides the injected auth store to the React tree and drives session bootstrap once. On an SSO
 * callback (`?token=<secret>`) it exchanges the secret then lands on the clean target path;
 * otherwise it restores a persisted session.
 */
export const AuthStoreProvider = ({
  store,
  children,
}: AuthStoreProviderProps): ReactElement => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token === null) {
      void store.getState().initialize();
      return;
    }

    void store
      .getState()
      .exchangeSso(token)
      .then((succeeded) => {
        if (succeeded) {
          // Reload at the clean target — the session is now persisted, so restore lands authenticated.
          window.location.replace(cleanDestination(params));
        } else {
          stripSsoParamsInPlace(params);
        }
      });
  }, [store]);

  return <AuthStoreContext.Provider value={store}>{children}</AuthStoreContext.Provider>;
};
