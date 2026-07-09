import { Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { Badge, Button, type BadgeTone } from '@shared/ui';
import type { Assignment, AssignmentStatus } from '../domain';
import styles from './AssignTrainingPage.module.css';

const STATUS_TONE: Record<AssignmentStatus, BadgeTone> = {
  active: 'info',
  completed: 'success',
  overdue: 'warning',
};

export interface AssignmentRowProps {
  readonly assignment: Assignment;
  readonly isDeleting: boolean;
  readonly onDelete: (id: string) => void;
}

/** A single assignment row: course, assignee, due date, status badge and a delete action. */
export const AssignmentRow = ({
  assignment,
  isDeleting,
  onDelete,
}: AssignmentRowProps): ReactElement => (
  <div className={styles.row}>
    <div className={styles.rowMain}>
      <span className={styles.course}>{assignment.course}</span>
      <span className={styles.assignee}>{assignment.assignee}</span>
    </div>
    <span className={styles.dueDate}>{assignment.dueDate.toLocaleDateString()}</span>
    <Badge tone={STATUS_TONE[assignment.status]}>{assignment.status}</Badge>
    <Button
      variant="ghost"
      size="sm"
      isLoading={isDeleting}
      onClick={() => {
        onDelete(assignment.id);
      }}
    >
      <Trash2 size={16} aria-hidden="true" />
      Delete
    </Button>
  </div>
);
