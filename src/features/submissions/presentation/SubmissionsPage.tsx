import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { Alert, PageHeader, Spinner } from '@shared/ui';
import { useAuth } from '@features/auth';
import type { Submission } from '../domain';
import { SubmissionRow } from './SubmissionRow';
import { useMySubmissions } from './use-submissions';
import styles from './SubmissionsPage.module.css';

const MySubmissionsList = ({
  query,
}: {
  readonly query: UseQueryResult<readonly Submission[]>;
}): ReactElement => {
  if (query.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading submissions" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <Alert tone="error" title="Could not load submissions">
        {query.error.message}
      </Alert>
    );
  }
  const data = query.data ?? [];
  if (data.length === 0) {
    return (
      <p className={styles.empty}>
        No submissions yet — upload a document to get started.
      </p>
    );
  }
  return (
    <div className={styles.list}>
      {data.map((submission) => (
        <SubmissionRow key={submission.id} submission={submission} />
      ))}
    </div>
  );
};

/** "My Submissions": track the review status of everything you've uploaded. */
export const SubmissionsPage = (): ReactElement => {
  const { user } = useAuth();
  const mine = useMySubmissions(user?.fullName ?? '');

  return (
    <section className={styles.screen}>
      <PageHeader
        title="My Submissions"
        subtitle="Track the review status of your uploads."
      >
        <Link to="/upload" className={styles.uploadCta}>
          <Upload size={15} aria-hidden="true" /> Upload document
        </Link>
      </PageHeader>
      <MySubmissionsList query={mine} />
    </section>
  );
};
