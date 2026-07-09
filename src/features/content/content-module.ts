import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import {
  CreateContentUseCase,
  DeleteContentUseCase,
  ListContentUseCase,
  PublishContentUseCase,
} from './application';
import { InMemoryContentGateway } from './infrastructure';

export interface ContentModuleDeps {
  readonly logger: Logger;
  readonly clock: Clock;
}

/** The use cases exposed by the content feature, consumed via a context provider. */
export interface ContentModule {
  readonly listContent: ListContentUseCase;
  readonly createContent: CreateContentUseCase;
  readonly publishContent: PublishContentUseCase;
  readonly deleteContent: DeleteContentUseCase;
}

/** Composition root for the content feature: wires the in-memory gateway to the use cases. */
export const createContentModule = (deps: ContentModuleDeps): ContentModule => {
  const contentGateway = new InMemoryContentGateway({
    clock: deps.clock,
    logger: deps.logger,
  });
  const shared = { contentGateway, logger: deps.logger };

  return {
    listContent: new ListContentUseCase(shared),
    createContent: new CreateContentUseCase(shared),
    publishContent: new PublishContentUseCase(shared),
    deleteContent: new DeleteContentUseCase(shared),
  };
};
