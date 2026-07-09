import type { ReactElement } from 'react';
import { ClipboardList, Trash2 } from 'lucide-react';
import { Badge, Button, IconButton, type BadgeTone } from '@shared/ui';
import type { Assignment, AssignmentStatus } from '../domain';
import styles from './AssignTrainingPage.module.css';

const statusTone = (status: AssignmentStatus): BadgeTone => {
  if (status === 'completed') {
    return 'success';
  }
  return status === 'overdue' ? 'warning' : 'info';
};

export interface AssignmentCardProps {
  readonly assignment: Assignment;
  readonly deleting: boolean;
  readonly onView: (assignment: Assignment) => void;
  readonly onDelete: (id: string) => void;
}

/** A single assignment tile: course, status, assignee/due, view + delete actions. */
export const AssignmentCard = ({
  assignment,
  deleting,
  onView,
  onDelete,
}: AssignmentCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.cardTop}>
      <span className={styles.iconTile}>
        <ClipboardList size={20} aria-hidden="true" />
      </span>
      <Badge tone={statusTone(assignment.status)}>{assignment.status}</Badge>
    </div>
    <h3 className={styles.cardTitle}>{assignment.course}</h3>
    <div className={styles.rows}>
      <div className={styles.row}>
        <span className={styles.rowLabel}>Assignee</span>
        <span className={styles.rowValue}>{assignment.assignee}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.rowLabel}>Due</span>
        <span className={styles.rowValue}>{assignment.dueDate.toLocaleDateString()}</span>
      </div>
    </div>
    <div className={styles.cardActions}>
      <Button
        size="sm"
        variant="ghost"
        fullWidth
        onClick={() => {
          onView(assignment);
        }}
      >
        View progress
      </Button>
      <IconButton
        label="Delete assignment"
        variant="danger"
        disabled={deleting}
        onClick={() => {
          onDelete(assignment.id);
        }}
      >
        <Trash2 size={16} />
      </IconButton>
    </div>
  </article>
);
