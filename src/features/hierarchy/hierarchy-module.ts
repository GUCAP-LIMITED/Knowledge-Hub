import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  AssignManagerUseCase,
  GetBranchTreeUseCase,
  ListEdgesUseCase,
  RemoveOverrideUseCase,
} from './application';
import { HierarchyEdgeHttpGateway } from './infrastructure';

export interface HierarchyModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the hierarchy feature, consumed via the provider. */
export interface HierarchyModule {
  readonly getBranchTree: GetBranchTreeUseCase;
  readonly listEdges: ListEdgesUseCase;
  readonly assignManager: AssignManagerUseCase;
  readonly removeOverride: RemoveOverrideUseCase;
}

/**
 * Composition root *for the hierarchy feature*. Wires the concrete HTTP gateway to the use cases.
 * This is the only place inside the feature where layers are joined.
 */
export const createHierarchyModule = (deps: HierarchyModuleDeps): HierarchyModule => {
  const hierarchyGateway = new HierarchyEdgeHttpGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });
  const shared = { hierarchyGateway, logger: deps.logger };

  return {
    getBranchTree: new GetBranchTreeUseCase(shared),
    listEdges: new ListEdgesUseCase(shared),
    assignManager: new AssignManagerUseCase(shared),
    removeOverride: new RemoveOverrideUseCase(shared),
  };
};
