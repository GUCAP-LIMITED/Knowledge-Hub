import type { ReactElement } from 'react';
import { ClipboardList, MoreVertical, Trash2 } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  IconButton,
  ProgressBar,
  StatusBadge,
  type StatusTone,
} from '@shared/ui';
import { cn } from '@shared/utils';
import type { Assignment, AssignmentStatus } from '../domain';
import styles from './AssignTrainingPage.module.css';

const STATUS: Record<
  AssignmentStatus,
  { readonly tone: StatusTone; readonly label: string }
> = {
  active: { tone: 'info', label: 'Active' },
  completed: { tone: 'success', label: 'Completed' },
  overdue: { tone: 'danger', label: 'Overdue' },
};

export interface AssignmentCardProps {
  readonly assignment: Assignment;
  readonly deleting: boolean;
  readonly onView: (assignment: Assignment) => void;
  readonly onDelete: (id: string) => void;
}

/** A single assignment tile: course, status, assignee/due, progress, view + delete actions. */
export const AssignmentCard = ({
  assignment,
  deleting,
  onView,
  onDelete,
}: AssignmentCardProps): ReactElement => {
  const status = assignment.displayStatus(new Date());
  const meta = STATUS[status];
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.iconTile}>
          <ClipboardList size={20} aria-hidden="true" />
        </span>
        <StatusBadge tone={meta.tone} label={meta.label} />
      </div>
      <h3 className={styles.cardTitle}>{assignment.course}</h3>
      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Assignee</span>
          <span className={styles.rowValue}>{assignment.assignee}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Due</span>
          <span className={cn(styles.rowValue, status === 'overdue' && styles.overdue)}>
            {assignment.dueDate.toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className={styles.progressWrap}>
        <div className={styles.progressHead}>
          <span>Completion</span>
          <span className={styles.progressPct}>{assignment.progress}%</span>
        </div>
        <ProgressBar value={assignment.progress} tone="auto" />
      </div>
      <div className={styles.cardActions}>
        <Button
          size="sm"
          variant="secondary"
          fullWidth
          onClick={() => {
            onView(assignment);
          }}
        >
          View progress
        </Button>
        <DropdownMenu
          align="end"
          trigger={
            <IconButton label="More actions">
              <MoreVertical size={16} />
            </IconButton>
          }
          items={[
            {
              label: 'Delete assignment',
              danger: true,
              disabled: deleting,
              icon: <Trash2 size={15} />,
              onSelect: () => {
                onDelete(assignment.id);
              },
            },
          ]}
        />
      </div>
    </article>
  );
};
