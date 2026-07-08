import { DomainError } from '@core/errors';

/** Base type for every certificates-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class CertificateError extends DomainError {}

/** The certificates source could not be reached or returned an unexpected response. */
export class CertificatesUnavailableError extends CertificateError {
  public readonly code = 'CERTIFICATES_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('Your certificates are currently unavailable. Please try again.', { cause });
  }
}

/** No certificate exists for the given id. */
export class CertificateNotFoundError extends CertificateError {
  public readonly code = 'CERTIFICATES_NOT_FOUND';

  public constructor(id: string) {
    super(`No certificate found for id "${id}".`, { context: { id } });
  }
}
