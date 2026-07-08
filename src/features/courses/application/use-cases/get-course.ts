import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Course, CourseError, CourseGateway } from '../../domain';

export interface GetCourseUseCaseDeps {
  readonly courseGateway: CourseGateway;
  readonly logger: Logger;
}

/** Fetch a single course by id. */
export class GetCourseUseCase {
  private readonly courseGateway: CourseGateway;
  private readonly logger: Logger;

  public constructor(deps: GetCourseUseCaseDeps) {
    this.courseGateway = deps.courseGateway;
    this.logger = deps.logger.child('get-course');
  }

  public async execute(id: string): Promise<Result<Course, CourseError>> {
    const result = await this.courseGateway.getById(id);
    if (!result.ok) {
      this.logger.warn('Getting course failed', { code: result.error.code, id });
    }
    return result;
  }
}
