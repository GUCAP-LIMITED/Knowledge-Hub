import type { ReactElement, ReactNode } from 'react';
import type { HierarchyModule } from '../hierarchy-module';
import { HierarchyModuleContext } from './hierarchy-module-context';

export interface HierarchyModuleProviderProps {
  readonly module: HierarchyModule;
  readonly children: ReactNode;
}

/**
 * Provides the injected hierarchy use cases to the React tree. The module is built by the
 * composition root, so this component stays free of wiring.
 */
export const HierarchyModuleProvider = ({
  module,
  children,
}: HierarchyModuleProviderProps): ReactElement => (
  <HierarchyModuleContext.Provider value={module}>
    {children}
  </HierarchyModuleContext.Provider>
);
