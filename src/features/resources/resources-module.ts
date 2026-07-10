import type { Logger } from '@core/logger';
import {
  DeleteResourceUseCase,
  ListResourcesUseCase,
  MarkResourceHelpfulUseCase,
  UpdateResourceUseCase,
} from './application';
import { InMemoryResourceGateway } from './infrastructure';

export interface ResourcesModuleDeps {
  readonly logger: Logger;
}

/** The use cases exposed by the resources feature, consumed via a context provider. */
export interface ResourcesModule {
  readonly listResources: ListResourcesUseCase;
  readonly markResourceHelpful: MarkResourceHelpfulUseCase;
  readonly updateResource: UpdateResourceUseCase;
  readonly deleteResource: DeleteResourceUseCase;
}

/**
 * Composition root *for the resources feature*. Wires the in-memory gateway to the use cases. The
 * only place inside the feature where layers are joined. Bind an HTTP gateway here to go live.
 */
export const createResourcesModule = (deps: ResourcesModuleDeps): ResourcesModule => {
  const resourceGateway = new InMemoryResourceGateway({ logger: deps.logger });

  return {
    listResources: new ListResourcesUseCase({ resourceGateway, logger: deps.logger }),
    markResourceHelpful: new MarkResourceHelpfulUseCase({
      resourceGateway,
      logger: deps.logger,
    }),
    updateResource: new UpdateResourceUseCase({ resourceGateway, logger: deps.logger }),
    deleteResource: new DeleteResourceUseCase({ resourceGateway, logger: deps.logger }),
  };
};
