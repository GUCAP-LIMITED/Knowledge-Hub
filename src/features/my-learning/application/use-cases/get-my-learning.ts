import type { Logger } from '@core/logger';
import type { Result } from '@core/result';
import type {
  MyLearningGateway,
  PagedMyLearningResult,
} from '../../domain/ports/my-learning-gateway';
import type { MyLearningQueryParams } from '../../domain/types';

export interface GetMyLearningDeps {
  readonly myLearningGateway: MyLearningGateway;
  readonly logger: Logger;
}

export class GetMyLearningUseCase {
  private readonly gateway: MyLearningGateway;
  private readonly logger: Logger;

  public constructor(deps: GetMyLearningDeps) {
    this.gateway = deps.myLearningGateway;
    this.logger = deps.logger.child('get-my-learning-use-case');
  }

  public async execute(
    params: MyLearningQueryParams,
  ): Promise<Result<PagedMyLearningResult>> {
    this.logger.debug('Fetching my learning items', { params });
    return this.gateway.getMyLearning(params);
  }
}
