import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  GetMyDashboardUseCase,
  GetWidgetCatalogUseCase,
  GetWidgetDataUseCase,
  ResetMyDashboardUseCase,
  SaveMyDashboardUseCase,
} from './application';
import { DashboardViewHttpGateway } from './infrastructure';

export interface DashboardModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the dashboard feature, consumed via the provider. */
export interface DashboardModule {
  readonly getMyDashboard: GetMyDashboardUseCase;
  readonly getWidgetData: GetWidgetDataUseCase;
  readonly getWidgetCatalog: GetWidgetCatalogUseCase;
  readonly saveMyDashboard: SaveMyDashboardUseCase;
  readonly resetMyDashboard: ResetMyDashboardUseCase;
}

/**
 * Composition root *for the dashboard feature*. Wires the concrete HTTP gateway to the use cases.
 * This is the only place inside the feature where layers are joined.
 */
export const createDashboardModule = (deps: DashboardModuleDeps): DashboardModule => {
  const dashboardGateway = new DashboardViewHttpGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });
  const shared = { dashboardGateway, logger: deps.logger };

  return {
    getMyDashboard: new GetMyDashboardUseCase(shared),
    getWidgetData: new GetWidgetDataUseCase(shared),
    getWidgetCatalog: new GetWidgetCatalogUseCase(shared),
    saveMyDashboard: new SaveMyDashboardUseCase(shared),
    resetMyDashboard: new ResetMyDashboardUseCase(shared),
  };
};
