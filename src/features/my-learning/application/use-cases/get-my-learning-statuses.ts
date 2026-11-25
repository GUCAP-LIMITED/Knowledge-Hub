import type { Logger } from '@core/logger';
import type { Result } from '@core/result';
import type { MyLearningGateway } from '../../domain/ports/my-learning-gateway';
import type { MyLearningStatusOption } from '../../domain/types';

export interface GetMyLearningStatusesDeps {
  readonly myLearningGateway: MyLearningGateway;
  readonly logger: Logger;
}

export class GetMyLearningStatusesUseCase {
  private readonly gateway: MyLearningGateway;
  private readonly logger: Logger;

  public constructor(deps: GetMyLearningStatusesDeps) {
    this.gateway = deps.myLearningGateway;
    this.logger = deps.logger.child('get-my-learning-statuses-use-case');
  }

  public async execute(): Promise<Result<readonly MyLearningStatusOption[]>> {
    this.logger.debug('Fetching my learning statuses');
    return this.gateway.getMyLearningStatuses();
  }
}
