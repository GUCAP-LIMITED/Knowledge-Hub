import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  GetCertificateTemplateUseCase,
  UpsertCertificateTemplateUseCase,
} from './application';
import { CertificateTemplateHttpGateway } from './infrastructure';

export interface CertificateTemplatesModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the certificate-templates feature, consumed via a context provider. */
export interface CertificateTemplatesModule {
  readonly getCertificateTemplate: GetCertificateTemplateUseCase;
  readonly upsertCertificateTemplate: UpsertCertificateTemplateUseCase;
}

/**
 * Composition root *for the certificate-templates feature*. Wires the HTTP gateway to the use
 * cases. The only place inside the feature where layers are joined.
 */
export const createCertificateTemplatesModule = (
  deps: CertificateTemplatesModuleDeps,
): CertificateTemplatesModule => {
  const certificateTemplateGateway = new CertificateTemplateHttpGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });

  return {
    getCertificateTemplate: new GetCertificateTemplateUseCase({
      certificateTemplateGateway,
      logger: deps.logger,
    }),
    upsertCertificateTemplate: new UpsertCertificateTemplateUseCase({
      certificateTemplateGateway,
      logger: deps.logger,
    }),
  };
};
