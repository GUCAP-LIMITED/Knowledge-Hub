import type { ReactElement, ReactNode } from 'react';
import type { ContentModule } from '../content-module';
import { ContentModuleContext } from './content-module-context';

export interface ContentModuleProviderProps {
  readonly module: ContentModule;
  readonly children: ReactNode;
}

export const ContentModuleProvider = ({
  module,
  children,
}: ContentModuleProviderProps): ReactElement => (
  <ContentModuleContext.Provider value={module}>{children}</ContentModuleContext.Provider>
);
