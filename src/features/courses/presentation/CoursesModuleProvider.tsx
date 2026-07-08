import type { ReactElement, ReactNode } from 'react';
import type { CoursesModule } from '../courses-module';
import { CoursesModuleContext } from './courses-module-context';

export interface CoursesModuleProviderProps {
  readonly module: CoursesModule;
  readonly children: ReactNode;
}

/** Provides the injected courses use cases to the React tree. Wiring lives in the composition root. */
export const CoursesModuleProvider = ({
  module,
  children,
}: CoursesModuleProviderProps): ReactElement => (
  <CoursesModuleContext.Provider value={module}>{children}</CoursesModuleContext.Provider>
);
