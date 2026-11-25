import { Certificate, type CertificateProps } from '@features/certificates/domain';

export type CertificateOverrides = Partial<CertificateProps>;

const DEFAULT_CERTIFICATE_PROPS: CertificateProps = {
  id: 'CERT-2026-001',
  courseName: 'Getting Started with UAPP Portal',
  userName: 'Simona',
  userRole: 'Consultant',
  issuedDate: new Date('2026-01-10T00:00:00.000Z'),
  expiryDate: new Date('2028-01-10T00:00:00.000Z'),
  credentialId: 'UAPP-GS-001-2026',
  category: 'Onboarding',
  grade: 'Distinction',
  contentKind: 'course',
};

/** Construct a valid {@link Certificate} for tests, overriding only what matters per case. */
export const buildCertificate = (overrides: CertificateOverrides = {}): Certificate =>
  new Certificate({ ...DEFAULT_CERTIFICATE_PROPS, ...overrides });
