import { createContext } from 'react';
import type { UserTypesModule } from '../user-types-module';

/** Holds the DI-built user-types module. Populated by UserTypesModuleProvider at the composition root. */
export const UserTypesModuleContext = createContext<UserTypesModule | null>(null);
