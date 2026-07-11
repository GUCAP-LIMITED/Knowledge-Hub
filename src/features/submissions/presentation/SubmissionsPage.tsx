import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, FileText, Upload } from 'lucide-react';
import { Alert, EmptyState, PageHeader, Spinner } from '@shared/ui';
import { useAuth } from '@features/auth';
import type { Submission } from '../domain';
import { SubmissionsTable } from './SubmissionsTable';
import { useMySubmissions, useSubmissions } from './use-submissions';
import styles from './SubmissionsPage.module.css';

const SubmissionsBody = ({
  isLoading,
  error,
  data,
  isAdmin,
}: {
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly data: readonly Submission[];
  readonly isAdmin: boolean;
}): ReactElement => {
  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading submissions" />
      </div>
    );
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load submissions">
        {error.message}
      </Alert>
    );
  }
  if (data.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={isAdmin ? 'No published documents' : 'No submissions yet'}
        description={
          isAdmin
            ? 'Published documents will appear here.'
            : 'Documents you upload will appear here while they are reviewed.'
        }
      />
    );
  }
  return <SubmissionsTable submissions={data} />;
};

/** "My Submissions": authors track their review status; admins see all published content. */
export const SubmissionsPage = (): ReactElement => {
  const { user } = useAuth();
  const isAdmin = user?.hasAnyRole(['admin']) ?? false;
  const all = useSubmissions();
  const mine = useMySubmissions(user?.fullName ?? '');
  const active = isAdmin ? all : mine;
  const data = isAdmin
    ? (all.data ?? []).filter((submission) => submission.status === 'published')
    : (mine.data ?? []);

  return (
    <section className={styles.screen}>
      <PageHeader
        title="My Submissions"
        subtitle={
          isAdmin
            ? 'Published content across the platform'
            : 'Track the status of your submissions'
        }
      >
        <Link to="/upload" className={styles.uploadCta}>
          <Upload size={15} aria-hidden="true" /> Upload document
        </Link>
      </PageHeader>

      {isAdmin ? (
        <div className={styles.adminNote}>
          <CheckCircle size={18} aria-hidden="true" />
          <span>As an admin, your uploads are published directly without review.</span>
        </div>
      ) : null}

      <SubmissionsBody
        isLoading={active.isLoading}
        error={active.isError ? active.error : null}
        data={data}
        isAdmin={isAdmin}
      />
    </section>
  );
};
