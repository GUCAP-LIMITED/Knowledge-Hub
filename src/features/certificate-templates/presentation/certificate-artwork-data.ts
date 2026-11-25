import type { CertificateKind } from '../store/certificate-template-store';

/** The recipient/course facts an artwork renders — deliberately plain (no cross-feature types). */
export interface CertificateArtworkData {
  readonly userName: string;
  readonly courseName: string;
  readonly issuedDate: Date;
  readonly expiryDate: Date;
  readonly credentialId: string;
}

/** Realistic placeholder data so the editor's live preview never shows an empty certificate. */
export const SAMPLE_ARTWORK_DATA: Record<CertificateKind, CertificateArtworkData> = {
  course: {
    userName: 'Alex Morgan',
    courseName: 'Getting Started with UAPP Portal',
    issuedDate: new Date('2026-01-10'),
    expiryDate: new Date('2027-01-10'),
    credentialId: 'UAPP-GS-001-2026',
  },
  tutorial: {
    userName: 'Jordan Blake',
    courseName: 'Using the UAPP Portal Efficiently',
    issuedDate: new Date('2026-02-14'),
    expiryDate: new Date('2027-02-14'),
    credentialId: 'UAPP-TU-002-2026',
  },
  resource: {
    userName: 'Priya Anand',
    courseName: 'Digital Tools for Consultants',
    issuedDate: new Date('2026-03-02'),
    expiryDate: new Date('2027-03-02'),
    credentialId: 'UAPP-RS-003-2026',
  },
};

/** Fill the `{{courseName}}` token in an admin-authored static text with the recipient's real
 * course — used by the live preview/canvas; the exported HTML leaves the token for the backend. */
export const resolveBodyText = (template: string, data: CertificateArtworkData): string =>
  template.replaceAll('{{courseName}}', data.courseName);
