import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Certificate, CertificateError, CertificateGateway } from '../../domain';

export interface ListCertificatesUseCaseDeps {
  readonly certificateGateway: CertificateGateway;
  readonly logger: Logger;
}

/** Fetch every issued certificate. Pure orchestration: delegate to the gateway, return its `Result`. */
export class ListCertificatesUseCase {
  private readonly certificateGateway: CertificateGateway;
  private readonly logger: Logger;

  public constructor(deps: ListCertificatesUseCaseDeps) {
    this.certificateGateway = deps.certificateGateway;
    this.logger = deps.logger.child('list-certificates');
  }

  public async execute(): Promise<Result<readonly Certificate[], CertificateError>> {
    const result = await this.certificateGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing certificates failed', { code: result.error.code });
    }
    return result;
  }
}
