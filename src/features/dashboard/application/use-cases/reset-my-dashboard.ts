import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { DashboardError, DashboardGateway } from '../../domain';

export interface ResetMyDashboardUseCaseDeps {
  readonly dashboardGateway: DashboardGateway;
  readonly logger: Logger;
}

/** Reset the caller's personal dashboard back to the user-type template. */
export class ResetMyDashboardUseCase {
  private readonly dashboardGateway: DashboardGateway;
  private readonly logger: Logger;

  public constructor(deps: ResetMyDashboardUseCaseDeps) {
    this.dashboardGateway = deps.dashboardGateway;
    this.logger = deps.logger.child('reset-my-dashboard');
  }

  public async execute(): Promise<Result<void, DashboardError>> {
    const result = await this.dashboardGateway.resetMine();
    if (!result.ok) {
      this.logger.warn('Resetting my dashboard failed', { code: result.error.code });
    }
    return result;
  }
}
