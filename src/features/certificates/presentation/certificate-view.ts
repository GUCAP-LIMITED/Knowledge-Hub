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

const CERT_CSS = `
  @page { size: A4 landscape; margin: 0; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; background:#eef2f1;
    font-family: Georgia,'Times New Roman',serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .cert { position:relative; box-sizing:border-box; width:900px; max-width:92vw; padding:56px 64px 40px;
    background:#fff; border:1px solid #e2e8f0; box-shadow:0 24px 60px rgba(15,23,42,.14); text-align:center; }
  .cert::before { content:''; position:absolute; inset:14px; border:2px solid #045D5E; opacity:.5; pointer-events:none; }
  .seal { width:72px; height:72px; margin:0 auto 16px; border-radius:50%; display:grid; place-items:center;
    background:linear-gradient(135deg,#045D5E,#034849); color:#fff; font-size:34px; box-shadow:0 0 0 5px rgba(4,93,94,.10); }
  .title { font-size:26px; font-weight:700; letter-spacing:1px; color:#0f172a; }
  .rule { width:54px; height:3px; margin:12px auto 22px; border-radius:99px; background:#045D5E; }
  .kick { font-family:Arial,Helvetica,sans-serif; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#64748b; }
  .name { font-size:42px; font-weight:700; margin:8px 0; color:#0f172a; }
  .sub { font-size:15px; color:#475569; }
  .course { font-size:22px; font-weight:700; margin:6px 0 18px; color:#0f172a; }
  .grade { display:inline-block; font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:700;
    letter-spacing:1px; padding:5px 14px; border-radius:99px; background:#fff7ed; color:#9a3412; border:1px solid #fdba74; }
  .footer { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; margin-top:38px;
    padding-top:18px; border-top:1px dashed #cbd5e1; font-family:Arial,Helvetica,sans-serif; text-align:left; }
  .sig { font-family:'Segoe Script','Brush Script MT',cursive; font-size:26px; color:#045D5E; line-height:1; }
  .sigline { width:190px; height:1px; margin:8px 0 5px; background:#cbd5e1; }
  .lbl { font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#64748b; }
  .verify { text-align:right; }
  .vurl { font-size:12px; font-weight:600; color:#475569; }`;

/** Download a printable, branded HTML certificate that matches the in-app design. */
export const downloadCertificate = (certificate: Certificate): void => {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>${certificate.credentialId}</title><style>${CERT_CSS}</style></head><body>
<div class="cert">
  <div class="seal">&#9733;</div>
  <div class="title">Certificate of Achievement</div>
  <div class="rule"></div>
  <div class="kick">This is to certify that</div>
  <div class="name">${certificate.userName}</div>
  <div class="sub">has successfully completed</div>
  <div class="course">${certificate.courseName}</div>
  <span class="grade">${certificate.grade.toUpperCase()}</span>
  <div class="footer">
    <div><div class="sig">UAPP Academy</div><div class="sigline"></div>
      <div class="lbl">Issued ${formatDate(certificate.issuedDate)} &middot; Valid until ${formatDate(certificate.expiryDate)}</div></div>
    <div class="verify"><div class="lbl">Verify online</div>
      <div class="vurl">${verifyUrl(certificate)}</div><div class="lbl">ID ${certificate.credentialId}</div></div>
  </div>
</div></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${certificate.credentialId}.html`;
  link.click();
  URL.revokeObjectURL(url);
};
