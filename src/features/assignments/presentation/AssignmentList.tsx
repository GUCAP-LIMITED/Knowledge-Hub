import type { ReactElement } from 'react';
import { ClipboardList } from 'lucide-react';
import { Alert, Button, EmptyState } from '@shared/ui';
import type { Assignment } from '../domain';
import { AssignmentCard } from './AssignmentCard';
import styles from './AssignTrainingPage.module.css';

export interface AssignmentListProps {
  readonly list: readonly Assignment[];
  readonly error: Error | null;
  readonly deleting: boolean;
  readonly onNew: () => void;
  readonly onView: (assignment: Assignment) => void;
  readonly onDelete: (id: string) => void;
}

/** The error / empty / card-grid body of the Assign Training page. */
export const AssignmentList = ({
  list,
  error,
  deleting,
  onNew,
  onView,
  onDelete,
}: AssignmentListProps): ReactElement => {
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load assignments">
        {error.message}
      </Alert>
    );
  }

  if (list.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No active assignments"
        description="Create one to keep your team's learning on track."
        action={<Button onClick={onNew}>New assignment</Button>}
      />
    );
  }

  return (
    <div className={styles.grid}>
      {list.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          deleting={deleting}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
