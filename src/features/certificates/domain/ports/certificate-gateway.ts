import type { Result } from '@core/result';
import type { CertificateError } from '../errors/certificate-errors';
import type { Certificate } from '../entities/certificate';

/**
 * Port to the issued-certificates source. The domain states the contract in its own terms
 * (`Certificate`); storage or HTTP details live in an infrastructure implementation. Dependency
 * Inversion seam.
 */
export interface CertificateGateway {
  /** Fetch every certificate issued to the current learner. */
  list(): Promise<Result<readonly Certificate[], CertificateError>>;

  /** Fetch a single certificate by id. */
  getById(id: string): Promise<Result<Certificate, CertificateError>>;
}
