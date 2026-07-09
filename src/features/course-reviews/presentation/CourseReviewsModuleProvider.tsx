import type { ReactElement, ReactNode } from 'react';
import type { CourseReviewsModule } from '../course-reviews-module';
import { CourseReviewsModuleContext } from './course-reviews-module-context';

export interface CourseReviewsModuleProviderProps {
  readonly module: CourseReviewsModule;
  readonly children: ReactNode;
}

/** Provides the injected course-reviews use cases to the React tree. */
export const CourseReviewsModuleProvider = ({
  module,
  children,
}: CourseReviewsModuleProviderProps): ReactElement => (
  <CourseReviewsModuleContext.Provider value={module}>
    {children}
  </CourseReviewsModuleContext.Provider>
);
