import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  Certificate,
  type CertificateError,
  type CertificateGateway,
  CertificateNotFoundError,
} from '../domain';
import { CERTIFICATE_SEED } from './certificate-seed';

export interface InMemoryCertificateGatewayDeps {
  readonly logger: Logger;
}

/**
 * In-memory implementation of {@link CertificateGateway}, seeded from the prototype data. A
 * legitimate infrastructure adapter (storage, not network) — it keeps the app a working prototype
 * with no backend while honouring the port contract. Replace with an HTTP adapter to go live.
 */
export class InMemoryCertificateGateway implements CertificateGateway {
  private readonly logger: Logger;
  private readonly certificates: Map<string, Certificate>;

  public constructor(deps: InMemoryCertificateGatewayDeps) {
    this.logger = deps.logger.child('certificate-gateway');
    this.certificates = new Map(
      CERTIFICATE_SEED.map((props) => [props.id, new Certificate(props)]),
    );
  }

  public list(): Promise<Result<readonly Certificate[], CertificateError>> {
    return Promise.resolve(ok([...this.certificates.values()]));
  }

  public getById(id: string): Promise<Result<Certificate, CertificateError>> {
    const certificate = this.certificates.get(id);
    if (certificate === undefined) {
      this.logger.warn('Certificate not found', { id });
      return Promise.resolve(err(new CertificateNotFoundError(id)));
    }
    return Promise.resolve(ok(certificate));
  }
}
