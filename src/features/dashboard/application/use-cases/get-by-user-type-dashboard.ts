import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { DashboardError, DashboardGateway, DashboardView } from '../../domain';

export interface GetByUserTypeDashboardUseCaseDeps {
  readonly dashboardGateway: DashboardGateway;
  readonly logger: Logger;
}

/** Admin: load the template dashboard assigned to a specific user type. */
export class GetByUserTypeDashboardUseCase {
  private readonly dashboardGateway: DashboardGateway;
  private readonly logger: Logger;

  public constructor(deps: GetByUserTypeDashboardUseCaseDeps) {
    this.dashboardGateway = deps.dashboardGateway;
    this.logger = deps.logger.child('get-by-user-type-dashboard');
  }

  public async execute(
    userTypeId: string,
  ): Promise<Result<DashboardView | null, DashboardError>> {
    const result = await this.dashboardGateway.byUserType(userTypeId);
    if (!result.ok) {
      this.logger.warn('Loading user type dashboard failed', {
        userTypeId,
        code: result.error.code,
      });
    }
    return result;
  }
}
