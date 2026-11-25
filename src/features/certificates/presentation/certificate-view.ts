import type { Certificate, CertificateGrade } from '../domain';

export type GradeTone = 'warning' | 'primary' | 'success';

/** Accent tone for a grade badge (brand-aligned: gold / teal / green — no bright blue). */
export const gradeTone = (grade: CertificateGrade): GradeTone => {
  if (grade === 'Distinction') {
    return 'warning';
  }
  return grade === 'Merit' ? 'primary' : 'success';
};

/** Route of the public, sign-in-free page that renders a certificate from its id. */
export const CERTIFICATE_VERIFY_PATH = '/certificates/verify';

/** Public verification URL for a certificate — opens the page that generates it from its id. */
export const verifyUrl = (certificate: Certificate): string =>
  `${window.location.origin}${CERTIFICATE_VERIFY_PATH}/${certificate.id}`;

/** Social-share message for a certificate, pairing the achievement with its share link. */
export const shareText = (certificate: Certificate): string =>
  `I just earned a certificate for "${certificate.courseName}" on UAPP Academy!`;

/** Page subtitle: "N certificates issued/earned", pluralised. */
export const certSubtitle = (isAdmin: boolean, count: number): string => {
  const noun = count === 1 ? 'certificate' : 'certificates';
  return `${String(count)} ${noun} ${isAdmin ? 'issued' : 'earned'}`;
};

/** Certificates a user may see: admins see all, learners see only their own. */
export const scopeCertificates = (
  all: readonly Certificate[],
  isAdmin: boolean,
  userName: string,
): readonly Certificate[] =>
  isAdmin ? all : all.filter((cert) => cert.belongsTo(userName));

/** Narrow a certificate list to a single category ("all" passes everything). */
export const byCategory = (
  certificates: readonly Certificate[],
  category: string,
): readonly Certificate[] =>
  category === 'all'
    ? certificates
    : certificates.filter((cert) => cert.category === category);

const DEFAULT_EXTENSION = 'png';

/** File extension the backend actually stored the blob under (its name is a GUID, not the
 * learner's name, so only the extension from it is worth keeping). */
const blobExtension = (blobName: string | undefined): string =>
  /\.([a-zA-Z0-9]+)$/.exec(blobName ?? '')?.[1] ?? DEFAULT_EXTENSION;

/** Human-readable download filename ("<Learner Name> Certificate.png") instead of the backend's
 * GUID-named blob. */
export const certificateFilename = (certificate: Certificate): string => {
  const sanitizedName = certificate.userName.trim().replace(/[\\/:*?"<>|]+/g, '');
  return `${sanitizedName} Certificate.${blobExtension(certificate.blobName)}`;
};
