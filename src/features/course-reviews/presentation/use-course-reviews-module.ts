import { useContext } from 'react';
import type { CourseReviewsModule } from '../course-reviews-module';
import { CourseReviewsModuleContext } from './course-reviews-module-context';

/** Resolve the injected course-reviews use cases. Throws if used outside the provider. */
export const useCourseReviewsModule = (): CourseReviewsModule => {
  const module = useContext(CourseReviewsModuleContext);
  if (module === null) {
    throw new Error(
      'Course-reviews hooks must be used within <CourseReviewsModuleProvider>.',
    );
  }
  return module;
};
