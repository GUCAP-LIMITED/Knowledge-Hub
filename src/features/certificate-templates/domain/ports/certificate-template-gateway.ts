import type { Result } from '@core/result';
import type { CertificateKind } from '../certificate-kind';
import type { CertificateTemplateError } from '../errors/certificate-template-errors';
import type { CertificateTemplateRecord } from '../certificate-template-record';

/**
 * Port to the certificate-template API. The domain states the contract in its own terms; HTTP
 * details live in the infrastructure implementation. Dependency Inversion seam.
 */
export interface CertificateTemplateGateway {
  /** Create or replace the HTML template for one content kind. */
  upsert(
    kind: CertificateKind,
    html: string,
  ): Promise<Result<CertificateTemplateRecord, CertificateTemplateError>>;
  /** Fetch the currently-saved template for one content kind — `null` means none has been saved
   * yet (not an error). */
  get(
    kind: CertificateKind,
  ): Promise<Result<CertificateTemplateRecord | null, CertificateTemplateError>>;
}
