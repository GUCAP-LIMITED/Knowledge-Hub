import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  DashboardError,
  DashboardGateway,
  DashboardView,
  SaveTemplateInput,
} from '../../domain';

export interface SaveDashboardTemplateUseCaseDeps {
  readonly dashboardGateway: DashboardGateway;
  readonly logger: Logger;
}

export interface SaveDashboardTemplateParams {
  readonly id?: string | null | undefined;
  readonly input: SaveTemplateInput;
}

/** Admin: create or update a user-type template dashboard. */
export class SaveDashboardTemplateUseCase {
  private readonly dashboardGateway: DashboardGateway;
  private readonly logger: Logger;

  public constructor(deps: SaveDashboardTemplateUseCaseDeps) {
    this.dashboardGateway = deps.dashboardGateway;
    this.logger = deps.logger.child('save-dashboard-template');
  }

  public async execute(
    params: SaveDashboardTemplateParams,
  ): Promise<Result<DashboardView, DashboardError>> {
    const result =
      params.id !== undefined && params.id !== null && params.id.length > 0
        ? await this.dashboardGateway.updateTemplate(params.id, params.input)
        : await this.dashboardGateway.saveTemplate(params.input);

    if (!result.ok) {
      this.logger.warn('Saving dashboard template failed', { code: result.error.code });
    }
    return result;
  }
}
