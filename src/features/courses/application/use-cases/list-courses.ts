import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Course, CourseError, CourseGateway } from '../../domain';

export interface ListCoursesUseCaseDeps {
  readonly courseGateway: CourseGateway;
  readonly logger: Logger;
}

/** Fetch the whole catalog. Pure orchestration: delegate to the gateway and return its `Result`. */
export class ListCoursesUseCase {
  private readonly courseGateway: CourseGateway;
  private readonly logger: Logger;

  public constructor(deps: ListCoursesUseCaseDeps) {
    this.courseGateway = deps.courseGateway;
    this.logger = deps.logger.child('list-courses');
  }

  public async execute(): Promise<Result<readonly Course[], CourseError>> {
    const result = await this.courseGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing courses failed', { code: result.error.code });
    }
    return result;
  }
}
