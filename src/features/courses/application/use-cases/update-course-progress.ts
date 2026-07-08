import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Course, CourseError, CourseGateway } from '../../domain';

export interface UpdateCourseProgressUseCaseDeps {
  readonly courseGateway: CourseGateway;
  readonly logger: Logger;
}

/**
 * Record the learner's progress in a course (also used to "start" a course by moving it above 0).
 * The gateway owns persistence; the returned `Course` re-derives completion/enrolment.
 */
export class UpdateCourseProgressUseCase {
  private readonly courseGateway: CourseGateway;
  private readonly logger: Logger;

  public constructor(deps: UpdateCourseProgressUseCaseDeps) {
    this.courseGateway = deps.courseGateway;
    this.logger = deps.logger.child('update-course-progress');
  }

  public async execute(
    id: string,
    progress: number,
  ): Promise<Result<Course, CourseError>> {
    const result = await this.courseGateway.setProgress(id, progress);
    if (isErr(result)) {
      this.logger.warn('Updating course progress failed', {
        code: result.error.code,
        id,
      });
      return result;
    }
    this.logger.info('Course progress updated', { id, progress: result.value.progress });
    return result;
  }
}
