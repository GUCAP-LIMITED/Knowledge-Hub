import type { CertificateProps } from '../domain';

/**
 * Seed certificates ported from the original Knowledge Hub prototype. This is the in-memory data
 * source standing in for a backend. Swapping to a real API is a matter of binding an
 * `HttpCertificateGateway` (Zod DTO + mapper) in the feature module — no domain/application/
 * presentation change.
 */
export const CERTIFICATE_SEED: readonly CertificateProps[] = [
  {
    id: 'CERT-2026-001',
    courseId: 'course-1',
    courseName: 'Getting Started with UAPP Portal',
    userName: 'Simona',
    userRole: 'Consultant',
    issuedDate: new Date('2026-01-10'),
    credentialId: 'UAPP-GS-001-2026',
    category: 'Onboarding',
  },
  {
    id: 'CERT-2026-002',
    courseId: 'course-2',
    courseName: 'Compliance & Legal Requirements',
    userName: 'Simona',
    userRole: 'Consultant',
    issuedDate: new Date('2026-02-14'),
    credentialId: 'UAPP-CL-002-2026',
    category: 'Compliance',
  },
  {
    id: 'CERT-2026-003',
    courseId: 'course-3',
    courseName: 'Advanced Sales Techniques',
    userName: 'Marcus',
    userRole: 'Sales Lead',
    issuedDate: new Date('2026-03-02'),
    credentialId: 'UAPP-AS-003-2026',
    category: 'Sales',
  },
  {
    id: 'CERT-2026-004',
    courseId: 'course-6',
    courseName: 'Leadership Essentials',
    userName: 'Priya',
    userRole: 'Team Manager',
    issuedDate: new Date('2026-04-18'),
    credentialId: 'UAPP-LE-004-2026',
    category: 'Leadership',
  },
  {
    id: 'CERT-2026-005',
    courseId: 'course-5',
    courseName: 'Operations Playbook',
    userName: 'Daniel',
    userRole: 'Operations Analyst',
    issuedDate: new Date('2026-05-06'),
    credentialId: 'UAPP-OP-005-2026',
    category: 'Operations',
  },
];
