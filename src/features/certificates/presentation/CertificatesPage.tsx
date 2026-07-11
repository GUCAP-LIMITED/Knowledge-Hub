import { useMemo, useState, type ReactElement } from 'react';
import { Alert, EmptyState, PageHeader, Spinner } from '@shared/ui';
import { useAuth } from '@features/auth';
import type { Certificate } from '../domain';
import { useCertificates } from './use-certificates';
import { useCertificatesModule } from './use-certificates-module';
import { CertificateCard } from './CertificateCard';
import { CertificateStats } from './CertificateStats';
import { CertificateInsights } from './CertificateInsights';
import { CertCategoryPills } from './CertCategoryPills';
import { CertificateModal } from './CertificateModal';
import { byCategory, certSubtitle, scopeCertificates } from './certificate-view';
import styles from './CertificatesPage.module.css';

/** Routed certificates page: role-aware directory with filters, stats and a detail modal. */
export const CertificatesPage = (): ReactElement => {
  const { clock } = useCertificatesModule();
  const { user } = useAuth();
  const certificates = useCertificates();
  const [category, setCategory] = useState('all');
  const [active, setActive] = useState<Certificate | null>(null);
  const now = useMemo(() => clock.now(), [clock]);
  const isAdmin = user?.hasAnyRole(['admin']) ?? false;

  if (certificates.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading certificates" />
      </div>
    );
  }
  if (certificates.isError) {
    return (
      <Alert tone="error" title="Could not load certificates">
        {certificates.error.message}
      </Alert>
    );
  }

  const mine = scopeCertificates(certificates.data ?? [], isAdmin, user?.fullName ?? '');
  const visible = byCategory(mine, category);

  return (
    <section className={styles.screen}>
      <PageHeader
        title={isAdmin ? 'All Certificates' : 'My Certificates'}
        subtitle={certSubtitle(isAdmin, mine.length)}
      />

      <CertificateStats certificates={mine} now={now} isAdmin={isAdmin} />

      {isAdmin ? <CertificateInsights certificates={mine} now={now} /> : null}

      <CertCategoryPills certificates={mine} active={category} onSelect={setCategory} />

      {visible.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Complete courses to earn certificates."
        />
      ) : (
        <div className={styles.grid}>
          {visible.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              now={now}
              onView={setActive}
            />
          ))}
        </div>
      )}

      <CertificateModal
        certificate={active}
        now={now}
        onClose={() => {
          setActive(null);
        }}
      />
    </section>
  );
};
