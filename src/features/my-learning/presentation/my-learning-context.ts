import { createContext } from 'react';
import type { MyLearningModule } from '../my-learning-module';

export const MyLearningContext = createContext<MyLearningModule | null>(null);
