import type { ReactElement, ReactNode } from 'react';
import type { AssignmentsModule } from '../assignments-module';
import { AssignmentsModuleContext } from './assignments-module-context';

export interface AssignmentsModuleProviderProps {
  readonly module: AssignmentsModule;
  readonly children: ReactNode;
}

/** Provides the injected assignments use cases to the React tree. */
export const AssignmentsModuleProvider = ({
  module,
  children,
}: AssignmentsModuleProviderProps): ReactElement => (
  <AssignmentsModuleContext.Provider value={module}>
    {children}
  </AssignmentsModuleContext.Provider>
);
