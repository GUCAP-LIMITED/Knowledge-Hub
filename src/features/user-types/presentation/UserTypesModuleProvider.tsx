import type { ReactElement, ReactNode } from 'react';
import type { UserTypesModule } from '../user-types-module';
import { UserTypesModuleContext } from './user-types-module-context';

export interface UserTypesModuleProviderProps {
  readonly module: UserTypesModule;
  readonly children: ReactNode;
}

/**
 * Provides the injected user-types use cases to the React tree. The module is built by the
 * composition root, so this component stays free of wiring.
 */
export const UserTypesModuleProvider = ({
  module,
  children,
}: UserTypesModuleProviderProps): ReactElement => (
  <UserTypesModuleContext.Provider value={module}>
    {children}
  </UserTypesModuleContext.Provider>
);
