import type { ReactElement } from 'react';
import {
  CertificateArtwork,
  useCertificateDesign,
} from '@features/certificate-templates';
import type { Certificate } from '../domain';
import styles from './CertificatesPage.module.css';

export interface CertificateDisplayProps {
  readonly certificate: Certificate;
}

/** The certificate itself: the backend-rendered image when available, else the branded artwork. */
export const CertificateDisplay = ({
  certificate,
}: CertificateDisplayProps): ReactElement => {
  const design = useCertificateDesign(certificate.contentKind);

  if (certificate.blobUrl) {
    return (
      <div className={styles.modalImageWrapper}>
        <img
          src={certificate.blobUrl}
          alt={certificate.courseName}
          className={styles.modalImage}
        />
      </div>
    );
  }
  return (
    <CertificateArtwork
      kind={certificate.contentKind}
      design={design}
      data={{
        userName: certificate.userName,
        courseName: certificate.courseName,
        issuedDate: certificate.issuedDate,
        expiryDate: certificate.expiryDate ?? certificate.issuedDate,
        credentialId: certificate.credentialId,
      }}
    />
  );
};
