import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  DashboardError,
  DashboardGateway,
  WidgetData,
  WidgetDataRequest,
} from '../../domain';

export interface GetWidgetDataUseCaseDeps {
  readonly dashboardGateway: DashboardGateway;
  readonly logger: Logger;
}

/** Fetch a single widget's data. */
export class GetWidgetDataUseCase {
  private readonly dashboardGateway: DashboardGateway;
  private readonly logger: Logger;

  public constructor(deps: GetWidgetDataUseCaseDeps) {
    this.dashboardGateway = deps.dashboardGateway;
    this.logger = deps.logger.child('get-widget-data');
  }

  public async execute(
    request: WidgetDataRequest,
  ): Promise<Result<WidgetData, DashboardError>> {
    const result = await this.dashboardGateway.widgetData(request);
    if (!result.ok) {
      this.logger.warn('Loading widget data failed', { code: result.error.code });
    }
    return result;
  }
}
