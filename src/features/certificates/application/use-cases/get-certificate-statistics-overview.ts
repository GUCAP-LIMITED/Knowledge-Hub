import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  CertificateError,
  CertificateGateway,
  CertificateStatisticsOverview,
} from '../../domain';

export interface GetCertificateStatisticsOverviewUseCaseDeps {
  readonly certificateGateway: CertificateGateway;
  readonly logger: Logger;
}

/**
 * Fetch high-level certificate issuance KPI metrics alongside team and role breakdowns.
 * Orchestration service: delegates to {@link CertificateGateway.getStatisticsOverview}.
 */
export class GetCertificateStatisticsOverviewUseCase {
  private readonly certificateGateway: CertificateGateway;
  private readonly logger: Logger;

  public constructor(deps: GetCertificateStatisticsOverviewUseCaseDeps) {
    this.certificateGateway = deps.certificateGateway;
    this.logger = deps.logger.child('get-certificate-statistics-overview');
  }

  public async execute(
    branchId?: string,
  ): Promise<Result<CertificateStatisticsOverview, CertificateError>> {
    const result = await this.certificateGateway.getStatisticsOverview(branchId);
    if (!result.ok) {
      this.logger.warn('Fetching certificate statistics overview failed', {
        code: result.error.code,
        branchId,
      });
    }
    return result;
  }
}
