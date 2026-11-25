import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Spinner } from '@shared/ui';
import { CertificateDisplay } from './CertificateDisplay';
import { useCertificate } from './use-certificates';
import styles from './CertificateVerifyPage.module.css';

/** Public page (no sign-in): generates and shows a certificate from the id in the URL. */
export const CertificateVerifyPage = (): ReactElement => {
  const { certificateId } = useParams<{ readonly certificateId: string }>();
  const { data, isLoading, error } = useCertificate(certificateId ?? null);

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        {isLoading ? <Spinner size="lg" label="Loading certificate" /> : null}
        {error !== null ? (
          <Alert tone="error" title="Certificate not found">
            We could not verify a certificate for this link.
          </Alert>
        ) : null}
        {data ? <CertificateDisplay certificate={data} /> : null}
      </div>
    </main>
  );
};
