import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  DeleteResourceUseCase,
  GetResourceStatsUseCase,
  GetResourceUseCase,
  ListResourcesUseCase,
  MarkResourceCompleteUseCase,
  MarkResourceHelpfulUseCase,
  UpdateResourceUseCase,
} from './application';
import { HttpResourceGateway } from './infrastructure';

export interface ResourcesModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the resources feature, consumed via a context provider. */
export interface ResourcesModule {
  readonly getResourceStats: GetResourceStatsUseCase;
  readonly listResources: ListResourcesUseCase;
  readonly getResource: GetResourceUseCase;
  readonly markResourceHelpful: MarkResourceHelpfulUseCase;
  readonly markResourceComplete: MarkResourceCompleteUseCase;
  readonly updateResource: UpdateResourceUseCase;
  readonly deleteResource: DeleteResourceUseCase;
}

/**
 * Composition root *for the resources feature*. Wires the HTTP gateway to the use cases.
 */
export const createResourcesModule = (deps: ResourcesModuleDeps): ResourcesModule => {
  const resourceGateway = new HttpResourceGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });

  return {
    getResourceStats: new GetResourceStatsUseCase({
      resourceGateway,
      logger: deps.logger,
    }),
    listResources: new ListResourcesUseCase({ resourceGateway, logger: deps.logger }),
    getResource: new GetResourceUseCase({ resourceGateway, logger: deps.logger }),
    markResourceHelpful: new MarkResourceHelpfulUseCase({
      resourceGateway,
      logger: deps.logger,
    }),
    markResourceComplete: new MarkResourceCompleteUseCase({
      resourceGateway,
      logger: deps.logger,
    }),
    updateResource: new UpdateResourceUseCase({ resourceGateway, logger: deps.logger }),
    deleteResource: new DeleteResourceUseCase({ resourceGateway, logger: deps.logger }),
  };
};
