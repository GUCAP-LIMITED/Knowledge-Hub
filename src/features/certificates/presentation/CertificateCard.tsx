import type { ReactElement } from 'react';
import { Award, Copy, Download } from 'lucide-react';
import { Button, CategoryBadge } from '@shared/ui';
import type { Certificate } from '../domain';
import styles from './CertificatesPage.module.css';

export interface CertificateCardProps {
  readonly certificate: Certificate;
}

/** Card for a single issued certificate, with a real text download and copy-credential action. */
export const CertificateCard = ({ certificate }: CertificateCardProps): ReactElement => {
  const handleDownload = (): void => {
    const content = [
      'UAPP Academy — Certificate of Completion',
      '',
      `Course: ${certificate.courseName}`,
      `Awarded to: ${certificate.userName} (${certificate.userRole})`,
      `Credential ID: ${certificate.credentialId}`,
      `Category: ${certificate.category}`,
      `Issued: ${certificate.issuedDate.toLocaleDateString()}`,
      '',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certificate.credentialId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(certificate.credentialId);
  };

  return (
    <article className={styles.card}>
      <div className={styles.ribbon}>
        <Award size={22} aria-hidden="true" />
      </div>
      <div className={styles.cardTop}>
        <CategoryBadge category={certificate.category} size="sm" />
        <span className={styles.credential}>{certificate.credentialId}</span>
      </div>
      <h2 className={styles.cardTitle}>{certificate.courseName}</h2>
      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.label}>Issued to</span>
          <span>
            {certificate.userName} · {certificate.userRole}
          </span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Issued</span>
          <span>{certificate.issuedDate.toLocaleDateString()}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <Button size="sm" onClick={handleDownload}>
          <Download size={14} aria-hidden="true" /> Download
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCopy}>
          <Copy size={14} aria-hidden="true" /> Copy ID
        </Button>
      </div>
    </article>
  );
};
