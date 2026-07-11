import type { CSSProperties, ReactElement } from 'react';
import { AlertTriangle, Award, QrCode } from 'lucide-react';
import { Celebration, Modal } from '@shared/ui';
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

const fmt = (date: Date): string => date.toLocaleDateString('en-GB');

const CertificateArt = ({
  certificate,
  accent,
}: {
  readonly certificate: Certificate;
  readonly accent: string;
}): ReactElement => (
  <div
    className={styles.certificate}
    style={{ '--cert-accent': accent } as CSSProperties}
  >
    <Award className={styles.certWatermark} aria-hidden="true" />
    <div className={styles.certSeal}>
      <Award size={30} aria-hidden="true" />
    </div>
    <div className={styles.certTitle}>Certificate of Achievement</div>
    <div className={styles.certRule} aria-hidden="true" />
    <div className={styles.certKick}>This is to certify that</div>
    <div className={styles.certName}>{certificate.userName}</div>
    <div className={styles.certSub}>has successfully completed</div>
    <div className={styles.certCourse}>{certificate.courseName}</div>
    <span className={cn(styles.grade, styles[`grade_${gradeTone(certificate.grade)}`])}>
      {certificate.grade.toUpperCase()}
    </span>
    <div className={styles.certFooter}>
      <div className={styles.certSignBlock}>
        <div className={styles.certSignature}>UAPP Academy</div>
        <div className={styles.certSignLine} />
        <div className={styles.certFootLabel}>
          Issued {fmt(certificate.issuedDate)} · Valid until {fmt(certificate.expiryDate)}
        </div>
      </div>
      <div className={styles.certVerify}>
        <QrCode size={38} className={styles.certQr} aria-hidden="true" />
        <div className={styles.certVerifyText}>
          <div className={styles.certFootLabel}>Verify online</div>
          <div className={styles.certVerifyUrl}>{verifyUrl(certificate)}</div>
          <div className={styles.certFootLabel}>ID {certificate.credentialId}</div>
        </div>
      </div>
    </div>
  </div>
);

/** Full certificate detail: expiry alert, the branded certificate, and export actions. */
export const CertificateModal = ({
  certificate,
  now,
  onClose,
}: CertificateModalProps): ReactElement => {
  const { user } = useAuth();
  const template = useCertificateTemplate(user?.roleNames ?? [], 'course');
  const daysLeft = certificate?.daysUntilExpiry(now) ?? 0;
  const expiringSoon = certificate?.isExpiringSoon(now) ?? false;
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
          <Celebration show={!expiringSoon} />
          {expiringSoon ? (
            <div className={styles.modalExpiry}>
              <AlertTriangle size={18} aria-hidden="true" />
              <span>
                This certificate expires in {daysLeft > 0 ? daysLeft : 0} days — consider
                re-certification.
              </span>
            </div>
          ) : null}
          <CertificateArt certificate={certificate} accent={template.accentColor} />
        </div>
      ) : null}
    </Modal>
  );
};
