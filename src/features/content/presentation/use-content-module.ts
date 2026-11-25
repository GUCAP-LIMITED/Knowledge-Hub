import { useContext } from 'react';
import type { ContentModule } from '../content-module';
import { ContentModuleContext } from './content-module-context';

export const useContentModule = (): ContentModule => {
  const module = useContext(ContentModuleContext);
  if (module === null) {
    throw new Error('useContentModule must be used within a ContentModuleProvider');
  }
  return module;
};
