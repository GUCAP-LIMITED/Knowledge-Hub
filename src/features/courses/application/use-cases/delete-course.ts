import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { CourseError, CourseGateway } from '../../domain';

export interface DeleteCourseUseCaseDeps {
  readonly courseGateway: CourseGateway;
  readonly logger: Logger;
}

/** Remove a course from the catalog (admin). */
export class DeleteCourseUseCase {
  private readonly courseGateway: CourseGateway;
  private readonly logger: Logger;

  public constructor(deps: DeleteCourseUseCaseDeps) {
    this.courseGateway = deps.courseGateway;
    this.logger = deps.logger.child('delete-course');
  }

  public execute(id: string): Promise<Result<void, CourseError>> {
    this.logger.info('Deleting course', { id });
    return this.courseGateway.remove(id);
  }
}
