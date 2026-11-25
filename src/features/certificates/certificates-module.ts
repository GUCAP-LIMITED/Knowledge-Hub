import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import {
  GetCertificateStatisticsOverviewUseCase,
  GetCertificateUseCase,
  ListCertificatesUseCase,
} from './application';
import { CertificateHttpGateway } from './infrastructure';

export interface CertificatesModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
  readonly clock: Clock;
}

/** The use cases exposed by the certificates feature, consumed via a context provider. */
export interface CertificatesModule {
  readonly listCertificates: ListCertificatesUseCase;
  readonly getCertificate: GetCertificateUseCase;
  readonly getCertificateStatisticsOverview: GetCertificateStatisticsOverviewUseCase;
  /** Clock used by presentation to compute expiry (never `new Date()` directly). */
  readonly clock: Clock;
}

/**
 * Composition root *for the certificates feature*. Wires the HTTP gateway to the use cases. The
 * only place inside the feature where layers are joined.
 */
export const createCertificatesModule = (
  deps: CertificatesModuleDeps,
): CertificatesModule => {
  const certificateGateway = new CertificateHttpGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });

  return {
    listCertificates: new ListCertificatesUseCase({
      certificateGateway,
      logger: deps.logger,
    }),
    getCertificate: new GetCertificateUseCase({
      certificateGateway,
      logger: deps.logger,
    }),
    getCertificateStatisticsOverview: new GetCertificateStatisticsOverviewUseCase({
      certificateGateway,
      logger: deps.logger,
    }),
    clock: deps.clock,
  };
};
