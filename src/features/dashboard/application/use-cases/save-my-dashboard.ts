import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  DashboardError,
  DashboardGateway,
  DashboardView,
  SaveWidget,
} from '../../domain';

export interface SaveMyDashboardUseCaseDeps {
  readonly dashboardGateway: DashboardGateway;
  readonly logger: Logger;
}

/** Save the caller's personal dashboard layout. */
export class SaveMyDashboardUseCase {
  private readonly dashboardGateway: DashboardGateway;
  private readonly logger: Logger;

  public constructor(deps: SaveMyDashboardUseCaseDeps) {
    this.dashboardGateway = deps.dashboardGateway;
    this.logger = deps.logger.child('save-my-dashboard');
  }

  public async execute(
    widgets: readonly SaveWidget[],
  ): Promise<Result<DashboardView, DashboardError>> {
    const result = await this.dashboardGateway.saveMine(widgets);
    if (!result.ok) {
      this.logger.warn('Saving my dashboard failed', { code: result.error.code });
    }
    return result;
  }
}
