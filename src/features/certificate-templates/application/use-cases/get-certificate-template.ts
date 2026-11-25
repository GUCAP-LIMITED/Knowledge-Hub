import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  CertificateKind,
  CertificateTemplateError,
  CertificateTemplateGateway,
  CertificateTemplateRecord,
} from '../../domain';

export interface GetCertificateTemplateUseCaseDeps {
  readonly certificateTemplateGateway: CertificateTemplateGateway;
  readonly logger: Logger;
}

/** Load the currently-saved certificate template for one content kind, if any. */
export class GetCertificateTemplateUseCase {
  private readonly certificateTemplateGateway: CertificateTemplateGateway;
  private readonly logger: Logger;

  public constructor(deps: GetCertificateTemplateUseCaseDeps) {
    this.certificateTemplateGateway = deps.certificateTemplateGateway;
    this.logger = deps.logger.child('get-certificate-template');
  }

  public async execute(
    kind: CertificateKind,
  ): Promise<Result<CertificateTemplateRecord | null, CertificateTemplateError>> {
    this.logger.debug('Loading certificate template...', { kind });
    return this.certificateTemplateGateway.get(kind);
  }
}
