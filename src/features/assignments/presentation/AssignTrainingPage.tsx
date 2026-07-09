import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Alert, EmptyState, PageHeader, Spinner } from '@shared/ui';
import type { Assignment } from '../domain';
import { AssignmentForm, type AssignmentFormValues } from './AssignmentForm';
import { AssignmentRow } from './AssignmentRow';
import {
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
} from './use-assignments';
import styles from './AssignTrainingPage.module.css';

const AssignmentsList = ({
  query,
  deletingId,
  onDelete,
}: {
  readonly query: UseQueryResult<readonly Assignment[]>;
  readonly deletingId: string | undefined;
  readonly onDelete: (id: string) => void;
}): ReactElement => {
  if (query.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading assignments" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <Alert tone="error" title="Could not load assignments">
        {query.error.message}
      </Alert>
    );
  }
  const data = query.data ?? [];
  if (data.length === 0) {
    return (
      <EmptyState
        title="No assignments yet"
        description="Assign a course to your team using the form above."
      />
    );
  }
  return (
    <div className={styles.list}>
      {data.map((assignment) => (
        <AssignmentRow
          key={assignment.id}
          assignment={assignment}
          isDeleting={deletingId === assignment.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

/** "Assign Training": assign courses to the team and track completion. */
export const AssignTrainingPage = (): ReactElement => {
  const assignments = useAssignments();
  const create = useCreateAssignment();
  const remove = useDeleteAssignment();

  const handleCreate = (values: AssignmentFormValues): void => {
    create.mutate({
      course: values.course,
      assignee: values.assignee,
      dueDate: values.dueDate,
    });
  };

  const handleDelete = (id: string): void => {
    remove.mutate(id);
  };

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Assign Training"
        subtitle="Assign courses to your team and track completion."
      />

      <AssignmentForm isSubmitting={create.isPending} onSubmit={handleCreate} />

      {create.isError ? (
        <Alert tone="error" title="Could not assign">
          {create.error.message}
        </Alert>
      ) : null}

      {remove.isError ? (
        <Alert tone="error" title="Could not delete">
          {remove.error.message}
        </Alert>
      ) : null}

      <AssignmentsList
        query={assignments}
        deletingId={remove.isPending ? remove.variables : undefined}
        onDelete={handleDelete}
      />
    </section>
  );
};
