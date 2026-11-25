import type { ReactElement, ReactNode } from 'react';
import type { MyLearningModule } from '../my-learning-module';
import { MyLearningContext } from './my-learning-context';

export interface MyLearningModuleProviderProps {
  readonly module: MyLearningModule;
  readonly children: ReactNode;
}

export const MyLearningModuleProvider = ({
  module,
  children,
}: MyLearningModuleProviderProps): ReactElement => (
  <MyLearningContext.Provider value={module}>{children}</MyLearningContext.Provider>
);
