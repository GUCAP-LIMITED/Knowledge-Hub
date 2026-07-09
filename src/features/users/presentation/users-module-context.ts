import { createContext } from 'react';
import type { UsersModule } from '../users-module';

/** Holds the DI-built users module. Populated by `UsersModuleProvider` at the composition root. */
export const UsersModuleContext = createContext<UsersModule | null>(null);
