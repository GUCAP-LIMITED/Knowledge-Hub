import type { ReactElement } from 'react';
import { Alert, CardGridSkeleton, EmptyState, PageHeader } from '@shared/ui';
import type { Certificate } from '../domain';
import { CertificateCard } from './CertificateCard';
import { CertificateStats } from './CertificateStats';
import { CertificateInsights } from './CertificateInsights';
import { CertificateModal } from './CertificateModal';
import { CertificatesToolbar } from './CertificatesToolbar';
import { CertificatesPagination } from './CertificatesPagination';
import { useCertificatesPage } from './use-certificates-page';
import { certSubtitle } from './certificate-view';
import styles from './CertificatesPage.module.css';

interface CertificatesGridProps {
  readonly items: readonly Certificate[];
  readonly now: Date;
  readonly onView: (certificate: Certificate) => void;
  readonly hasSearch: boolean;
}

const CertificatesGrid = ({
  items,
  now,
  onView,
  hasSearch,
}: CertificatesGridProps): ReactElement => {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No certificates yet"
        description={
          hasSearch
            ? 'No certificates match your search query.'
            : 'Complete courses to earn certificates.'
        }
      />
    );
  }
  return (
    <div className={styles.grid}>
      {items.map((certificate) => (
        <CertificateCard
          key={certificate.id}
          certificate={certificate}
          now={now}
          onView={onView}
        />
      ))}
    </div>
  );
};

interface CertificatesContentProps {
  readonly items: readonly Certificate[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly hasSearch: boolean;
  readonly page: number;
  readonly totalPages: number;
  readonly now: Date;
  readonly onPageChange: (page: number) => void;
  readonly onView: (certificate: Certificate) => void;
}

const CertificatesContent = ({
  items,
  isLoading,
  error,
  hasSearch,
  page,
  totalPages,
  now,
  onPageChange,
  onView,
}: CertificatesContentProps): ReactElement => {
  if (isLoading) {
    return <CardGridSkeleton />;
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load certificates">
        {error.message}
      </Alert>
    );
  }
  return (
    <>
      <CertificatesGrid items={items} now={now} onView={onView} hasSearch={hasSearch} />
      <CertificatesPagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};

/** Routed certificates page: role-aware paginated directory with overview stats and insights. */
export const CertificatesPage = (): ReactElement => {
  const {
    isAdmin,
    search,
    selection,
    page,
    active,
    now,
    filter,
    roles,
    allCount,
    myCount,
    showAll,
    totalCount,
    myTotal,
    items,
    totalPages,
    subtitleCount,
    isSelfView,
    statistics,
    certificates,
    handleSearch,
    handleSelect,
    setPage,
    setActive,
    handleCloseModal,
  } = useCertificatesPage();

  const isOverview = isAdmin && !isSelfView;

  return (
    <section className={styles.screen}>
      <PageHeader
        title={isOverview ? 'All Certificates' : 'My Certificates'}
        subtitle={certSubtitle(isOverview, subtitleCount)}
      />

      <CertificateStats
        statistics={statistics.data}
        totalCount={totalCount}
        myTotalCertificates={myTotal}
        certificates={items}
        now={now}
        isAdmin={isAdmin}
      />

      {isOverview ? <CertificateInsights statistics={statistics.data} /> : null}

      <CertificatesToolbar
        search={search}
        onSearchChange={handleSearch}
        selection={selection}
        onSelect={handleSelect}
        allCount={allCount}
        myCount={myCount}
        roles={roles}
        showAll={showAll}
        isAdmin={isAdmin}
      />

      <CertificatesContent
        items={items}
        isLoading={certificates.isLoading}
        error={certificates.error}
        hasSearch={Boolean(filter)}
        page={page}
        totalPages={totalPages}
        now={now}
        onPageChange={setPage}
        onView={setActive}
      />

      <CertificateModal certificate={active} now={now} onClose={handleCloseModal} />
    </section>
  );
};
