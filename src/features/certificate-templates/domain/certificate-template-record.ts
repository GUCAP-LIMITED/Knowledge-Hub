import type { CertificateKind } from './certificate-kind';

/** The saved state of one content kind's certificate template, as confirmed by the backend. */
export interface CertificateTemplateRecord {
  readonly kind: CertificateKind;
  readonly content: string;
  readonly lastModificationTime: string | null;
}
