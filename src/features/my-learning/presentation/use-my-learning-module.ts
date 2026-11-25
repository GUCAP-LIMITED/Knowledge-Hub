import { useContext } from 'react';
import type { MyLearningModule } from '../my-learning-module';
import { MyLearningContext } from './my-learning-context';

export const useMyLearningModule = (): MyLearningModule => {
  const module = useContext(MyLearningContext);
  if (module === null) {
    throw new Error('MyLearning hooks must be used within <MyLearningModuleProvider>.');
  }
  return module;
};
