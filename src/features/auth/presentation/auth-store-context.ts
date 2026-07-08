import { createContext } from 'react';
import type { AuthStore } from '../store';

/** Holds the DI-built auth store. Populated by `AuthStoreProvider` at the composition root. */
export const AuthStoreContext = createContext<AuthStore | null>(null);
