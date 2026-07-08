import type { ReactElement, ReactNode } from 'react';
import type { ResourcesModule } from '../resources-module';
import { ResourcesModuleContext } from './resources-module-context';

export interface ResourcesModuleProviderProps {
  readonly module: ResourcesModule;
  readonly children: ReactNode;
}

/** Provides the injected resources use cases to the React tree. Wiring lives in the composition root. */
export const ResourcesModuleProvider = ({
  module,
  children,
}: ResourcesModuleProviderProps): ReactElement => (
  <ResourcesModuleContext.Provider value={module}>
    {children}
  </ResourcesModuleContext.Provider>
);
