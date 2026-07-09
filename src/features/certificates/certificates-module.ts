import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import { GetCertificateUseCase, ListCertificatesUseCase } from './application';
import { InMemoryCertificateGateway } from './infrastructure';

export interface CertificatesModuleDeps {
  readonly logger: Logger;
  readonly clock: Clock;
}

/** The use cases exposed by the certificates feature, consumed via a context provider. */
export interface CertificatesModule {
  readonly listCertificates: ListCertificatesUseCase;
  readonly getCertificate: GetCertificateUseCase;
  /** Clock used by presentation to compute expiry (never `new Date()` directly). */
  readonly clock: Clock;
}

/**
 * Composition root *for the certificates feature*. Wires the in-memory gateway to the use cases. The
 * only place inside the feature where layers are joined. Bind an HTTP gateway here to go live.
 */
export const createCertificatesModule = (
  deps: CertificatesModuleDeps,
): CertificatesModule => {
  const certificateGateway = new InMemoryCertificateGateway({ logger: deps.logger });

  return {
    listCertificates: new ListCertificatesUseCase({
      certificateGateway,
      logger: deps.logger,
    }),
    getCertificate: new GetCertificateUseCase({
      certificateGateway,
      logger: deps.logger,
    }),
    clock: deps.clock,
  };
};
