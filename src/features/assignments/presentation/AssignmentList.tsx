import { useMemo, useState, type ReactElement } from 'react';
import { Alert, Button, EmptyState } from '@shared/ui';
import type { Assignment } from '../domain';
import { AssignmentCard } from './AssignmentCard';
import { AssignmentToolbar } from './AssignmentToolbar';
import {
  type AssignmentFilter,
  assignmentTabCounts,
  filterAssignments,
} from './assignment-filters';
import styles from './AssignTrainingPage.module.css';

export interface AssignmentListProps {
  readonly list: readonly Assignment[];
  readonly error: Error | null;
  readonly deleting: boolean;
  readonly onNew: () => void;
  readonly onView: (assignment: Assignment) => void;
  readonly onDelete: (id: string) => void;
}

/** The error / empty / toolbar + card-grid body of the Assign Training page. */
export const AssignmentList = ({
  list,
  error,
  deleting,
  onNew,
  onView,
  onDelete,
}: AssignmentListProps): ReactElement => {
  const [tab, setTab] = useState<AssignmentFilter>('all');
  const [query, setQuery] = useState('');
  const now = useMemo(() => new Date(), []);
  const counts = useMemo(() => assignmentTabCounts(list, now), [list, now]);
  const filtered = useMemo(
    () => filterAssignments(list, tab, query, now),
    [list, tab, query, now],
  );

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
        title="No assignments yet"
        description="Create one to keep your team's learning on track."
        action={<Button onClick={onNew}>New assignment</Button>}
      />
    );
  }

  return (
    <div className={styles.body}>
      <AssignmentToolbar
        query={query}
        tab={tab}
        counts={counts}
        onQuery={setQuery}
        onTab={setTab}
      />
      {filtered.length === 0 ? (
        <EmptyState
          title="No matching assignments"
          description="Try another search or switch status tab."
        />
      ) : (
        <div className={styles.grid}>
          {filtered.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              deleting={deleting}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
