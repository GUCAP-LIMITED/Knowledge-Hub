import type { ReactElement, ReactNode } from 'react';
import type { UsersModule } from '../users-module';
import { UsersModuleContext } from './users-module-context';

export interface UsersModuleProviderProps {
  readonly module: UsersModule;
  readonly children: ReactNode;
}

/** Provides the injected users use cases to the React tree. Wiring lives in the composition root. */
export const UsersModuleProvider = ({
  module,
  children,
}: UsersModuleProviderProps): ReactElement => (
  <UsersModuleContext.Provider value={module}>{children}</UsersModuleContext.Provider>
);
