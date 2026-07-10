import type { Certificate, CertificateGrade } from '../domain';

export type GradeTone = 'warning' | 'primary' | 'success';

/** Accent tone for a grade badge (brand-aligned: gold / teal / green — no bright blue). */
export const gradeTone = (grade: CertificateGrade): GradeTone => {
  if (grade === 'Distinction') {
    return 'warning';
  }
  return grade === 'Merit' ? 'primary' : 'success';
};

const formatDate = (date: Date): string => date.toLocaleDateString('en-GB');

/** Public verification URL for a credential. */
export const verifyUrl = (certificate: Certificate): string =>
  `uapp.academy/verify/${certificate.credentialId}`;

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

/** Download a printable, branded HTML certificate (matches the prototype's export). */
export const downloadCertificate = (certificate: Certificate): void => {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${certificate.credentialId}</title><style>body{font-family:Georgia,serif;padding:40px;background:linear-gradient(135deg,#045D5E,#FC7300);color:#fff;text-align:center;}h1{font-size:44px;margin:16px;}h2{font-size:30px;color:#FC7300;}p{font-size:18px;line-height:1.6;}.box{background:rgba(255,255,255,0.1);padding:40px;border-radius:20px;max-width:800px;margin:auto;border:3px solid rgba(255,255,255,0.3);}</style></head><body><div class="box"><h1>Certificate of Achievement</h1><p>This certifies that</p><h2>${certificate.userName}</h2><p>has successfully completed</p><h2>${certificate.courseName}</h2><p>Grade: <strong>${certificate.grade}</strong></p><p>Issued ${formatDate(certificate.issuedDate)} &bull; Valid until ${formatDate(certificate.expiryDate)}</p><p style="margin-top:24px;">Credential: <strong>${certificate.credentialId}</strong></p></div></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${certificate.credentialId}.html`;
  link.click();
  URL.revokeObjectURL(url);
};
