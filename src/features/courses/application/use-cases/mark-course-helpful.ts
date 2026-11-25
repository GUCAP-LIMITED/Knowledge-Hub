import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Course, CourseError, CourseGateway } from '../../domain';

export interface MarkCourseHelpfulUseCaseDeps {
  readonly courseGateway: CourseGateway;
  readonly logger: Logger;
}

/** Toggle or register a helpful vote for a course for the current learner. */
export class MarkCourseHelpfulUseCase {
  private readonly courseGateway: CourseGateway;
  private readonly logger: Logger;

  public constructor(deps: MarkCourseHelpfulUseCaseDeps) {
    this.courseGateway = deps.courseGateway;
    this.logger = deps.logger.child('mark-course-helpful');
  }

  public async execute(id: string): Promise<Result<Course, CourseError>> {
    const result = await this.courseGateway.markHelpful(id);
    if (!result.ok) {
      this.logger.warn('Marking course helpful failed', {
        code: result.error.code,
        id,
      });
    }
    return result;
  }
}
