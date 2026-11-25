import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  CertificateKind,
  CertificateTemplateError,
  CertificateTemplateGateway,
  CertificateTemplateRecord,
} from '../../domain';

export interface UpsertCertificateTemplateInput {
  readonly kind: CertificateKind;
  readonly html: string;
}

export interface UpsertCertificateTemplateUseCaseDeps {
  readonly certificateTemplateGateway: CertificateTemplateGateway;
  readonly logger: Logger;
}

/** Save the admin-authored certificate HTML for one content kind. */
export class UpsertCertificateTemplateUseCase {
  private readonly certificateTemplateGateway: CertificateTemplateGateway;
  private readonly logger: Logger;

  public constructor(deps: UpsertCertificateTemplateUseCaseDeps) {
    this.certificateTemplateGateway = deps.certificateTemplateGateway;
    this.logger = deps.logger.child('upsert-certificate-template');
  }

  public async execute(
    input: UpsertCertificateTemplateInput,
  ): Promise<Result<CertificateTemplateRecord, CertificateTemplateError>> {
    this.logger.debug('Saving certificate template...', { kind: input.kind });
    return this.certificateTemplateGateway.upsert(input.kind, input.html);
  }
}
