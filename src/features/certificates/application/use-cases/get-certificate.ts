import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Certificate, CertificateError, CertificateGateway } from '../../domain';

export interface GetCertificateUseCaseDeps {
  readonly certificateGateway: CertificateGateway;
  readonly logger: Logger;
}

/** Fetch a single certificate by id. */
export class GetCertificateUseCase {
  private readonly certificateGateway: CertificateGateway;
  private readonly logger: Logger;

  public constructor(deps: GetCertificateUseCaseDeps) {
    this.certificateGateway = deps.certificateGateway;
    this.logger = deps.logger.child('get-certificate');
  }

  public async execute(id: string): Promise<Result<Certificate, CertificateError>> {
    const result = await this.certificateGateway.getById(id);
    if (!result.ok) {
      this.logger.warn('Getting certificate failed', { code: result.error.code, id });
    }
    return result;
  }
}
