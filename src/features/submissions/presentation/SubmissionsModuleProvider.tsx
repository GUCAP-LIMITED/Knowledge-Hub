import type { ReactElement, ReactNode } from 'react';
import type { SubmissionsModule } from '../submissions-module';
import { SubmissionsModuleContext } from './submissions-module-context';

export interface SubmissionsModuleProviderProps {
  readonly module: SubmissionsModule;
  readonly children: ReactNode;
}

/** Provides the injected submissions use cases to the React tree. */
export const SubmissionsModuleProvider = ({
  module,
  children,
}: SubmissionsModuleProviderProps): ReactElement => (
  <SubmissionsModuleContext.Provider value={module}>
    {children}
  </SubmissionsModuleContext.Provider>
);
