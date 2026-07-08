import { useEffect, type ReactElement, type ReactNode } from 'react';
import type { AuthStore } from '../store';
import { AuthStoreContext } from './auth-store-context';

export interface AuthStoreProviderProps {
  readonly store: AuthStore;
  readonly children: ReactNode;
}

/**
 * Provides the injected auth store to the React tree and kicks off session restoration once.
 * The store itself is built by the composition root, so this component stays free of wiring.
 */
export const AuthStoreProvider = ({
  store,
  children,
}: AuthStoreProviderProps): ReactElement => {
  useEffect(() => {
    void store.getState().initialize();
  }, [store]);

  return <AuthStoreContext.Provider value={store}>{children}</AuthStoreContext.Provider>;
};
