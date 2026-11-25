import { DomainError } from '@core/errors';

/** Base type for every certificate-template-domain failure. */
export abstract class CertificateTemplateError extends DomainError {}

/** The backend rejected or could not persist the certificate template. */
export class CertificateTemplateSaveFailedError extends CertificateTemplateError {
  public readonly code = 'CERTIFICATE_TEMPLATE_SAVE_FAILED';

  public constructor(cause?: unknown) {
    super('Could not save the certificate template. Please try again.', { cause });
  }
}

/** The backend could not be reached to load the currently-saved certificate template. A missing
 * template (404 — none saved yet) is not this error; the gateway resolves that to `null`. */
export class CertificateTemplateLoadFailedError extends CertificateTemplateError {
  public readonly code = 'CERTIFICATE_TEMPLATE_LOAD_FAILED';

  public constructor(cause?: unknown) {
    super('Could not load the certificate template. Please try again.', { cause });
  }
}
