import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { DashboardError, DashboardGateway, WidgetCatalogItem } from '../../domain';

export interface GetWidgetCatalogUseCaseDeps {
  readonly dashboardGateway: DashboardGateway;
  readonly logger: Logger;
}

/** List the widgets the caller may place. */
export class GetWidgetCatalogUseCase {
  private readonly dashboardGateway: DashboardGateway;
  private readonly logger: Logger;

  public constructor(deps: GetWidgetCatalogUseCaseDeps) {
    this.dashboardGateway = deps.dashboardGateway;
    this.logger = deps.logger.child('get-widget-catalog');
  }

  public async execute(): Promise<Result<readonly WidgetCatalogItem[], DashboardError>> {
    const result = await this.dashboardGateway.catalog();
    if (!result.ok) {
      this.logger.warn('Loading widget catalog failed', { code: result.error.code });
    }
    return result;
  }
}
