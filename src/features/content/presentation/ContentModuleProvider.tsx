import type { ReactElement, ReactNode } from 'react';
import type { ContentModule } from '../content-module';
import { ContentModuleContext } from './content-module-context';

export interface ContentModuleProviderProps {
  readonly module: ContentModule;
  readonly children: ReactNode;
}

/** Provides the injected content use cases to the React tree. Wiring lives in the composition root. */
export const ContentModuleProvider = ({
  module,
  children,
}: ContentModuleProviderProps): ReactElement => (
  <ContentModuleContext.Provider value={module}>{children}</ContentModuleContext.Provider>
);
