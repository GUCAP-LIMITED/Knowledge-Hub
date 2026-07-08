import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Alert, Spinner } from '@shared/ui';
import { useAuth } from '@features/auth';
import type { Submission } from '../domain';
import { SubmitContentForm } from './SubmitContentForm';
import { SubmissionRow } from './SubmissionRow';
import { useMySubmissions, useSubmitContent } from './use-submissions';
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
    return <p className={styles.empty}>No submissions yet — create one above.</p>;
  }
  return (
    <div className={styles.list}>
      {data.map((submission) => (
        <SubmissionRow key={submission.id} submission={submission} />
      ))}
    </div>
  );
};

/** "My submissions": create content and track its review status. Manager/admin only. */
export const SubmissionsPage = (): ReactElement => {
  const { user } = useAuth();
  const name = user?.fullName ?? '';
  const isAdmin = user?.hasRole('admin') ?? false;
  const mine = useMySubmissions(name);
  const submit = useSubmitContent();

  const handleSubmit = (values: { title: string; type: string }): void => {
    submit.mutate({
      title: values.title,
      type: values.type,
      submittedBy: name,
      publishDirectly: isAdmin,
    });
  };

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Submissions</h1>
        <p className={styles.subtitle}>Upload content and track its review status.</p>
      </header>

      <SubmitContentForm
        isSubmitting={submit.isPending}
        submitLabel={isAdmin ? 'Publish now' : 'Submit for review'}
        onSubmit={handleSubmit}
      />

      {submit.isError ? (
        <Alert tone="error" title="Could not submit">
          {submit.error.message}
        </Alert>
      ) : null}

      <MySubmissionsList query={mine} />
    </section>
  );
};
