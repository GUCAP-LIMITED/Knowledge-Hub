import type { Logger } from '@core/logger';
import type { Result } from '@core/result';
import type { MyLearningGateway } from '../../domain/ports/my-learning-gateway';
import type { MyLearningStats } from '../../domain/types';

export interface GetMyLearningStatsDeps {
  readonly myLearningGateway: MyLearningGateway;
  readonly logger: Logger;
}

export class GetMyLearningStatsUseCase {
  private readonly gateway: MyLearningGateway;
  private readonly logger: Logger;

  public constructor(deps: GetMyLearningStatsDeps) {
    this.gateway = deps.myLearningGateway;
    this.logger = deps.logger.child('get-my-learning-stats-use-case');
  }

  public async execute(): Promise<Result<MyLearningStats>> {
    this.logger.debug('Fetching my learning stats');
    return this.gateway.getStats();
  }
}
