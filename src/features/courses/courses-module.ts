import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  DeleteCourseUseCase,
  GetCourseUseCase,
  ListCoursesUseCase,
  UpdateCourseProgressUseCase,
  UpdateCourseUseCase,
  EnrollCourseUseCase,
  MarkLessonCompleteUseCase,
  ManageCurriculumUseCase,
  GetMyLearningUseCase,
  GetEnrollmentStatusesUseCase,
  MarkCourseHelpfulUseCase,
} from './application';
import { HttpCourseGateway } from './infrastructure';
import type { CourseGateway } from './domain';

export interface CoursesModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the courses feature, consumed via a context provider. */
export interface CoursesModule {
  readonly courseGateway: CourseGateway;
  readonly listCourses: ListCoursesUseCase;
  readonly getCourse: GetCourseUseCase;
  readonly updateCourseProgress: UpdateCourseProgressUseCase;
  readonly updateCourse: UpdateCourseUseCase;
  readonly deleteCourse: DeleteCourseUseCase;
  readonly enrollCourse: EnrollCourseUseCase;
  readonly markLessonComplete: MarkLessonCompleteUseCase;
  readonly manageCurriculum: ManageCurriculumUseCase;
  readonly getMyLearning: GetMyLearningUseCase;
  readonly getEnrollmentStatuses: GetEnrollmentStatusesUseCase;
  readonly markCourseHelpful: MarkCourseHelpfulUseCase;
}

/**
 * Composition root *for the courses feature*. Wires the HTTP gateway to the use cases.
 */
export const createCoursesModule = (deps: CoursesModuleDeps): CoursesModule => {
  const courseGateway = new HttpCourseGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });

  return {
    courseGateway,
    listCourses: new ListCoursesUseCase({ courseGateway, logger: deps.logger }),
    getCourse: new GetCourseUseCase({ courseGateway, logger: deps.logger }),
    updateCourseProgress: new UpdateCourseProgressUseCase({
      courseGateway,
      logger: deps.logger,
    }),
    updateCourse: new UpdateCourseUseCase({ courseGateway, logger: deps.logger }),
    deleteCourse: new DeleteCourseUseCase({ courseGateway, logger: deps.logger }),
    enrollCourse: new EnrollCourseUseCase(courseGateway),
    markLessonComplete: new MarkLessonCompleteUseCase(courseGateway),
    manageCurriculum: new ManageCurriculumUseCase(courseGateway),
    getMyLearning: new GetMyLearningUseCase({ courseGateway, logger: deps.logger }),
    getEnrollmentStatuses: new GetEnrollmentStatusesUseCase({
      courseGateway,
      logger: deps.logger,
    }),
    markCourseHelpful: new MarkCourseHelpfulUseCase({
      courseGateway,
      logger: deps.logger,
    }),
  };
};
