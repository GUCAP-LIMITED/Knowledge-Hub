/**
 * Public API of the `certificates` feature. The app shell and other features import ONLY from here.
 * Backed by an in-memory gateway seeded from the prototype data (swap for HTTP to go live).
 */
export {
  createCertificatesModule,
  type CertificatesModule,
  type CertificatesModuleDeps,
} from './certificates-module';
export {
  CertificatesModuleProvider,
  useCertificates,
  useCertificate,
  useCertificatesModule,
  certificatesQueryKey,
  certificateKeys,
  CertificateModal,
  type CertificateModalProps,
} from './presentation';
export { Certificate, type CertificateProps } from './domain';
