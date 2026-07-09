import type { ReactElement } from 'react';
import { Alert, EmptyState, PageHeader, Spinner } from '@shared/ui';
import { useCertificates } from './use-certificates';
import { CertificateCard } from './CertificateCard';
import styles from './CertificatesPage.module.css';

/** Routed certificates page. */
export const CertificatesPage = (): ReactElement => {
  const certificates = useCertificates();
  const list = certificates.data ?? [];

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Certificates"
        subtitle="Your earned credentials of completion."
      />

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

      {!certificates.isLoading && !certificates.isError && list.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Complete a course to earn your first credential."
        />
      ) : null}

      {list.length > 0 ? (
        <div className={styles.grid}>
          {list.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      ) : null}
    </section>
  );
};
