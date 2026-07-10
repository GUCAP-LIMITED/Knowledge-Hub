import type { CSSProperties, ReactElement } from 'react';
import { AlertTriangle, Award } from 'lucide-react';
import { Modal } from '@shared/ui';
import { cn } from '@shared/utils';
import { useAuth } from '@features/auth';
import { useCertificateTemplate } from '@features/certificate-templates';
import type { Certificate } from '../domain';
import { gradeTone, verifyUrl } from './certificate-view';
import { CertificateActions } from './CertificateActions';
import styles from './CertificatesPage.module.css';

export interface CertificateModalProps {
  readonly certificate: Certificate | null;
  readonly now: Date;
  readonly onClose: () => void;
}

const buildFacts = (certificate: Certificate): readonly (readonly [string, string])[] => [
  ['Credential ID', certificate.credentialId],
  ['Issued', certificate.issuedDate.toLocaleDateString('en-GB')],
  ['Expires', certificate.expiryDate.toLocaleDateString('en-GB')],
  ['Category', certificate.category],
  ['Recipient', `${certificate.userName} • ${certificate.userRole}`],
  ['Verify online', verifyUrl(certificate)],
];

/** Full certificate detail: expiry alert, branded certificate, metadata, and export actions. */
export const CertificateModal = ({
  certificate,
  now,
  onClose,
}: CertificateModalProps): ReactElement => {
  const { user } = useAuth();
  const template = useCertificateTemplate(user?.roleNames ?? [], 'course');
  const daysLeft = certificate?.daysUntilExpiry(now) ?? 0;
  const expiringSoon = certificate?.isExpiringSoon(now) ?? false;
  // A light background image (if the template has one) reads with the accent colour; otherwise the
  // hero uses the teal gradient from CSS, where text must stay white to remain legible.
  const heroStyle: CSSProperties =
    template.backgroundImage !== undefined
      ? {
          color: template.accentColor,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${template.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : { color: '#fff' };
  return (
    <Modal
      open={certificate !== null}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      title="Certificate of Achievement"
      size="lg"
      footer={
        certificate !== null ? <CertificateActions certificate={certificate} /> : null
      }
    >
      {certificate !== null ? (
        <div className={styles.modalBody}>
          {expiringSoon ? (
            <div className={styles.modalExpiry}>
              <AlertTriangle size={18} aria-hidden="true" />
              <span>
                This certificate expires in {daysLeft > 0 ? daysLeft : 0} days — consider
                re-certification.
              </span>
            </div>
          ) : null}
          <div className={styles.certHero} style={heroStyle}>
            <Award size={48} aria-hidden="true" />
            <div className={styles.certKicker}>This is to certify that</div>
            <div className={styles.certName}>{certificate.userName}</div>
            <div className={styles.certSub}>has successfully completed</div>
            <div className={styles.certCourse}>{certificate.courseName}</div>
            <span
              className={cn(
                styles.grade,
                styles[`grade_${gradeTone(certificate.grade)}`],
              )}
            >
              GRADE: {certificate.grade.toUpperCase()}
            </span>
          </div>
          <div className={styles.factGrid}>
            {buildFacts(certificate).map(([label, value]) => (
              <div key={label} className={styles.fact}>
                <div className={styles.factLabel}>{label}</div>
                <div className={styles.factValue}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
