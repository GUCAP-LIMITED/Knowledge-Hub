import type { Logger } from '@core/logger';
import {
  GetCourseUseCase,
  ListCoursesUseCase,
  UpdateCourseProgressUseCase,
} from './application';
import { InMemoryCourseGateway } from './infrastructure';

export interface CoursesModuleDeps {
  readonly logger: Logger;
}

/** The use cases exposed by the courses feature, consumed via a context provider. */
export interface CoursesModule {
  readonly listCourses: ListCoursesUseCase;
  readonly getCourse: GetCourseUseCase;
  readonly updateCourseProgress: UpdateCourseProgressUseCase;
}

/**
 * Composition root *for the courses feature*. Wires the in-memory gateway to the use cases. The
 * only place inside the feature where layers are joined. Bind an HTTP gateway here to go live.
 */
export const createCoursesModule = (deps: CoursesModuleDeps): CoursesModule => {
  const courseGateway = new InMemoryCourseGateway({ logger: deps.logger });

  return {
    listCourses: new ListCoursesUseCase({ courseGateway, logger: deps.logger }),
    getCourse: new GetCourseUseCase({ courseGateway, logger: deps.logger }),
    updateCourseProgress: new UpdateCourseProgressUseCase({
      courseGateway,
      logger: deps.logger,
    }),
  };
};
