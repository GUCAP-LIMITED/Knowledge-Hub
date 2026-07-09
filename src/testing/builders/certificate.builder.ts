import { Certificate, type CertificateProps } from '@features/certificates/domain';

export type CertificateOverrides = Partial<CertificateProps>;

/** Construct a valid {@link Certificate} for tests, overriding only what matters per case. */
export const buildCertificate = (overrides: CertificateOverrides = {}): Certificate =>
  new Certificate({
    id: overrides.id ?? 'CERT-2026-001',
    courseId: overrides.courseId ?? 'course-1',
    courseName: overrides.courseName ?? 'Getting Started with UAPP Portal',
    userName: overrides.userName ?? 'Simona',
    userRole: overrides.userRole ?? 'Consultant',
    issuedDate: overrides.issuedDate ?? new Date('2026-01-10T00:00:00.000Z'),
    expiryDate: overrides.expiryDate ?? new Date('2028-01-10T00:00:00.000Z'),
    credentialId: overrides.credentialId ?? 'UAPP-GS-001-2026',
    category: overrides.category ?? 'Onboarding',
    grade: overrides.grade ?? 'Distinction',
  });
