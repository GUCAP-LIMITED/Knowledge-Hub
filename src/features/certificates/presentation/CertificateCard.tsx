import type { ReactElement } from 'react';
import { AlertTriangle, Award } from 'lucide-react';
import { Avatar, Button } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Certificate } from '../domain';
import { gradeTone } from './certificate-view';
import styles from './CertificatesPage.module.css';

export interface CertificateCardProps {
  readonly certificate: Certificate;
  readonly now: Date;
  readonly onView: (certificate: Certificate) => void;
}

/** Card for a single issued certificate: branded header, recipient, expiry warning, view action. */
export const CertificateCard = ({
  certificate,
  now,
  onView,
}: CertificateCardProps): ReactElement => {
  const daysLeft = certificate.daysUntilExpiry(now);
  const expiringSoon = certificate.isExpiringSoon(now);
  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.cardHead}
        onClick={() => {
          onView(certificate);
        }}
      >
        <div className={styles.cardHeadTop}>
          <Award size={28} aria-hidden="true" />
          <span
            className={cn(styles.grade, styles[`grade_${gradeTone(certificate.grade)}`])}
          >
            {certificate.grade.toUpperCase()}
          </span>
        </div>
        <span className={styles.certKicker}>Certificate of Achievement</span>
        <h3 className={styles.cardTitle}>{certificate.courseName}</h3>
      </button>
      <div className={styles.cardBody}>
        <div className={styles.recipient}>
          <Avatar name={certificate.userName} size={32} />
          <div>
            <div className={styles.recipientName}>{certificate.userName}</div>
            <div className={styles.recipientRole}>{certificate.userRole}</div>
          </div>
        </div>
        <div className={styles.issued}>
          Issued {certificate.issuedDate.toLocaleDateString('en-GB')} • ID{' '}
          {certificate.credentialId}
        </div>
        {expiringSoon ? (
          <div className={styles.expiryWarn}>
            <AlertTriangle size={12} aria-hidden="true" /> Expires in{' '}
            {daysLeft > 0 ? `${String(daysLeft)} days` : 'soon'}
          </div>
        ) : null}
        <Button
          size="sm"
          variant="secondary"
          fullWidth
          onClick={() => {
            onView(certificate);
          }}
        >
          View Details
        </Button>
      </div>
    </article>
  );
};
