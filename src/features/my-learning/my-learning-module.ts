import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  GetMyLearningUseCase,
  GetMyLearningStatsUseCase,
  GetMyLearningStatusesUseCase,
} from './application';
import { HttpMyLearningGateway } from './infrastructure/http-my-learning-gateway';

export interface MyLearningModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export interface MyLearningModule {
  readonly getMyLearning: GetMyLearningUseCase;
  readonly getMyLearningStats: GetMyLearningStatsUseCase;
  readonly getMyLearningStatuses: GetMyLearningStatusesUseCase;
}

export const createMyLearningModule = (deps: MyLearningModuleDeps): MyLearningModule => {
  const myLearningGateway = new HttpMyLearningGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });

  return {
    getMyLearning: new GetMyLearningUseCase({
      myLearningGateway,
      logger: deps.logger,
    }),
    getMyLearningStats: new GetMyLearningStatsUseCase({
      myLearningGateway,
      logger: deps.logger,
    }),
    getMyLearningStatuses: new GetMyLearningStatusesUseCase({
      myLearningGateway,
      logger: deps.logger,
    }),
  };
};
