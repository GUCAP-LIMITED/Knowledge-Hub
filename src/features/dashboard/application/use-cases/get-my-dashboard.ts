import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { DashboardError, DashboardGateway, DashboardView } from '../../domain';

export interface GetMyDashboardUseCaseDeps {
  readonly dashboardGateway: DashboardGateway;
  readonly logger: Logger;
}

/** Load the caller's resolved dashboard. */
export class GetMyDashboardUseCase {
  private readonly dashboardGateway: DashboardGateway;
  private readonly logger: Logger;

  public constructor(deps: GetMyDashboardUseCaseDeps) {
    this.dashboardGateway = deps.dashboardGateway;
    this.logger = deps.logger.child('get-my-dashboard');
  }

  public async execute(): Promise<Result<DashboardView | null, DashboardError>> {
    const result = await this.dashboardGateway.myDashboard();
    if (!result.ok) {
      this.logger.warn('Loading my dashboard failed', { code: result.error.code });
    }
    return result;
  }
}
