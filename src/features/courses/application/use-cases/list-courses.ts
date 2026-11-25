import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  Course,
  CourseCatalogParams,
  CourseError,
  CourseGateway,
  PagedResult,
} from '../../domain';

export interface ListCoursesUseCaseDeps {
  readonly courseGateway: CourseGateway;
  readonly logger: Logger;
}

/** Fetch courses catalog with filtering and pagination. Pure orchestration: delegate to the gateway. */
export class ListCoursesUseCase {
  private readonly courseGateway: CourseGateway;
  private readonly logger: Logger;

  public constructor(deps: ListCoursesUseCaseDeps) {
    this.courseGateway = deps.courseGateway;
    this.logger = deps.logger.child('list-courses');
  }

  public async execute(
    params?: CourseCatalogParams,
  ): Promise<Result<PagedResult<Course>, CourseError>> {
    const result = await this.courseGateway.list(params);
    if (!result.ok) {
      this.logger.warn('Listing courses failed', { code: result.error.code });
    }
    return result;
  }
}
