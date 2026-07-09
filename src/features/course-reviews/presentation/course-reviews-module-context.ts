import { createContext } from 'react';
import type { CourseReviewsModule } from '../course-reviews-module';

/** Holds the DI-built course-reviews module. Populated by `CourseReviewsModuleProvider`. */
export const CourseReviewsModuleContext = createContext<CourseReviewsModule | null>(null);
