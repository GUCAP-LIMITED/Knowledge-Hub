import type { ReactElement } from 'react';
import { Alert, Spinner } from '@shared/ui';
import { useCertificates } from './use-certificates';
import { CertificateCard } from './CertificateCard';
import styles from './CertificatesPage.module.css';

/** Routed certificates page. Reads server state via TanStack Query; no business logic here. */
export const CertificatesPage = (): ReactElement => {
  const certificates = useCertificates();

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Certificates</h1>
          <p className={styles.subtitle}>Your earned credentials of completion.</p>
        </div>
      </header>

      {certificates.isLoading ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading certificates" />
        </div>
      ) : null}

      {certificates.isError ? (
        <Alert tone="error" title="Could not load certificates">
          {certificates.error.message}
        </Alert>
      ) : null}

      {certificates.data?.length === 0 ? (
        <p className={styles.empty}>No certificates yet.</p>
      ) : null}

      {certificates.data !== undefined && certificates.data.length > 0 ? (
        <div className={styles.grid}>
          {certificates.data.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      ) : null}
    </section>
  );
};
