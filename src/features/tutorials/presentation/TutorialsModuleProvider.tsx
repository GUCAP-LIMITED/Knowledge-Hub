import type { ReactElement, ReactNode } from 'react';
import type { TutorialsModule } from '../tutorials-module';
import { TutorialsModuleContext } from './tutorials-module-context';

export interface TutorialsModuleProviderProps {
  readonly module: TutorialsModule;
  readonly children: ReactNode;
}

/** Provides the injected tutorials use cases to the React tree. Wiring lives in the composition root. */
export const TutorialsModuleProvider = ({
  module,
  children,
}: TutorialsModuleProviderProps): ReactElement => (
  <TutorialsModuleContext.Provider value={module}>
    {children}
  </TutorialsModuleContext.Provider>
);
