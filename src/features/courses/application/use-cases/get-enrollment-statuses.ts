import { type Result, err } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type CourseError,
  type CourseGateway,
  type EnrollmentStatusDto,
} from '../../domain';

export interface GetEnrollmentStatusesDeps {
  readonly courseGateway: CourseGateway;
  readonly logger: Logger;
}

export class GetEnrollmentStatusesUseCase {
  private readonly courseGateway: CourseGateway;
  private readonly logger: Logger;

  public constructor(deps: GetEnrollmentStatusesDeps) {
    this.courseGateway = deps.courseGateway;
    this.logger = deps.logger.child('get-enrollment-statuses');
  }

  public async execute(): Promise<Result<readonly EnrollmentStatusDto[], CourseError>> {
    try {
      return await this.courseGateway.getEnrollmentStatuses();
    } catch (cause) {
      this.logger.error('Failed to fetch enrollment statuses', cause);
      return err(cause as CourseError);
    }
  }
}
