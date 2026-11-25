import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  CertificateError,
  CertificateGateway,
  CertificateListQuery,
  CertificateListResult,
} from '../../domain';

export interface ListCertificatesUseCaseDeps {
  readonly certificateGateway: CertificateGateway;
  readonly logger: Logger;
}

/** Fetch a paginated certificate directory. Pure orchestration: delegate to the gateway, return its `Result`. */
export class ListCertificatesUseCase {
  private readonly certificateGateway: CertificateGateway;
  private readonly logger: Logger;

  public constructor(deps: ListCertificatesUseCaseDeps) {
    this.certificateGateway = deps.certificateGateway;
    this.logger = deps.logger.child('list-certificates');
  }

  public async execute(
    query?: CertificateListQuery,
  ): Promise<Result<CertificateListResult, CertificateError>> {
    const result = await this.certificateGateway.list(query);
    if (!result.ok) {
      this.logger.warn('Listing certificates failed', {
        code: result.error.code,
        query,
      });
    }
    return result;
  }
}
