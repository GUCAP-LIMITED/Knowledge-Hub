import type { ReactElement } from 'react';
import { Button } from '@shared/ui';
import type { Certificate } from '../domain';
import styles from './CertificatesPage.module.css';

export interface CertificateCardProps {
  readonly certificate: Certificate;
}

/** Card for a single issued certificate. Presentational — download is a placeholder no-op. */
export const CertificateCard = ({ certificate }: CertificateCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.cardTop}>
      <span className={styles.category}>{certificate.category}</span>
      <span className={styles.credential}>{certificate.credentialId}</span>
    </div>
    <h2 className={styles.cardTitle}>{certificate.courseName}</h2>
    <dl className={styles.meta}>
      <div>
        <dt>Issued to</dt>
        <dd>{certificate.userName}</dd>
      </div>
      <div>
        <dt>Role</dt>
        <dd>{certificate.userRole}</dd>
      </div>
      <div>
        <dt>Issued</dt>
        <dd>{certificate.issuedDate.toLocaleDateString()}</dd>
      </div>
    </dl>
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        // Placeholder: certificate download is not wired up yet.
      }}
    >
      Download
    </Button>
  </article>
);
