/** The three content kinds a certificate can be issued for — one design each, no more. */
export type CertificateKind = 'course' | 'tutorial' | 'resource';

/** The shipped (public-folder) background artwork for a kind — the design every kind starts from,
 * and what "remove background" falls back to. Admins can still upload a custom one over it. */
export const defaultCertificateBackground = (kind: CertificateKind): string =>
  `/certificates/${kind}/background.png`;
