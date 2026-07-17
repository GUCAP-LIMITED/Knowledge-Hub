import type { ReactElement, ReactNode } from 'react';
import type { PermissionsModule } from '../permissions-module';
import { PermissionsModuleContext } from './permissions-module-context';

export interface PermissionsModuleProviderProps {
  readonly module: PermissionsModule;
  readonly children: ReactNode;
}

/**
 * Provides the injected permissions use cases to the React tree. The module is built by the
 * composition root, so this component stays free of wiring.
 */
export const PermissionsModuleProvider = ({
  module,
  children,
}: PermissionsModuleProviderProps): ReactElement => (
  <PermissionsModuleContext.Provider value={module}>
    {children}
  </PermissionsModuleContext.Provider>
);
