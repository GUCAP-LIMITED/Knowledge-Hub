import { type Result, err } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type Course,
  type CourseError,
  type CourseGateway,
  type PagedResult,
  type MyLearningParams,
} from '../../domain';

export interface GetMyLearningDeps {
  readonly courseGateway: CourseGateway;
  readonly logger: Logger;
}

export class GetMyLearningUseCase {
  private readonly courseGateway: CourseGateway;
  private readonly logger: Logger;

  public constructor(deps: GetMyLearningDeps) {
    this.courseGateway = deps.courseGateway;
    this.logger = deps.logger.child('get-my-learning');
  }

  public async execute(
    params: MyLearningParams,
  ): Promise<Result<PagedResult<Course>, CourseError>> {
    try {
      return await this.courseGateway.myLearning(params);
    } catch (cause) {
      this.logger.error('Failed to fetch user learning', cause);
      return err(cause as CourseError);
    }
  }
}
