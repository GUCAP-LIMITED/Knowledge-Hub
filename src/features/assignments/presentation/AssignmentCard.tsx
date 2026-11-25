import type { ReactElement } from 'react';
import {
  BookOpen,
  FolderOpen,
  Lightbulb,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import {
  Badge,
  Button,
  DropdownMenu,
  IconButton,
  ProgressBar,
  StatusBadge,
  Tooltip,
  type StatusTone,
} from '@shared/ui';
import { cn, formatUserType } from '@shared/utils';
import { useMyCapabilities } from '@features/users';
import type { Assignment, AssignmentContentType, AssignmentStatus } from '../domain';
import styles from './AssignTrainingPage.module.css';

const STATUS: Record<
  AssignmentStatus,
  { readonly tone: StatusTone; readonly label: string }
> = {
  active: { tone: 'info', label: 'Active' },
  completed: { tone: 'success', label: 'Completed' },
  overdue: { tone: 'danger', label: 'Overdue' },
};

const TYPE_CONFIG: Record<
  AssignmentContentType,
  {
    readonly label: string;
    readonly icon: LucideIcon;
    readonly tone: 'primary' | 'warning' | 'success';
    readonly iconBgClass?: string | undefined;
  }
> = {
  course: {
    label: 'Course',
    icon: BookOpen,
    tone: 'primary',
    iconBgClass: styles.iconCourse,
  },
  tutorial: {
    label: 'Tutorial',
    icon: Lightbulb,
    tone: 'warning',
    iconBgClass: styles.iconTutorial,
  },
  resource: {
    label: 'Resource',
    icon: FolderOpen,
    tone: 'success',
    iconBgClass: styles.iconResource,
  },
};

export interface AssignmentCardProps {
  readonly assignment: Assignment;
  readonly deleting: boolean;
  readonly onView: (assignment: Assignment) => void;
  readonly onDelete: (id: string) => void;
}

const assigneeLabel = (item: Assignment['assignees'][number]): string => {
  const name =
    item.category === 'userType' ? formatUserType(item.displayName) : item.displayName;
  return item.email !== undefined && item.email.length > 0
    ? `${name} (${item.email})`
    : name;
};

const AssigneesValue = ({
  assignees,
}: {
  readonly assignees: Assignment['assignees'];
}): ReactElement => {
  if (assignees.length === 0) {
    return <span>None</span>;
  }

  const first = assignees[0];
  const firstName = first
    ? first.category === 'userType'
      ? formatUserType(first.displayName)
      : first.displayName
    : '';
  const firstTitle = first ? assigneeLabel(first) : firstName;

  if (assignees.length === 1) {
    return (
      <span className={styles.assigneeText} title={firstTitle}>
        {firstName}
      </span>
    );
  }

  const remaining = assignees.slice(1);
  const remainingText = remaining
    .map((item) =>
      item.category === 'userType' ? formatUserType(item.displayName) : item.displayName,
    )
    .join(', ');

  return (
    <div className={styles.assigneesWrapper}>
      <span className={styles.assigneeText} title={firstTitle}>
        {firstName}
      </span>
      <Tooltip
        side="top"
        className={styles.customTooltip}
        label={
          <div className={styles.customTooltipContent}>
            {remaining.map((item, idx) => (
              <div key={item.targetId || idx} className={styles.tooltipMethod}>
                <span>{assigneeLabel(item)}</span>
              </div>
            ))}
          </div>
        }
      >
        <button
          type="button"
          className={styles.moreAssigneesTrigger}
          aria-label={`Remaining assignees: ${remainingText}`}
        >
          <MoreHorizontal size={14} className={styles.moreIcon} aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
};

const CardMetaRows = ({
  assignees,
  dueDate,
  isOverdue,
}: {
  readonly assignees: Assignment['assignees'];
  readonly dueDate: Date;
  readonly isOverdue: boolean;
}): ReactElement => (
  <div className={styles.rows}>
    <div className={styles.row}>
      <span className={styles.rowLabel}>Assignees</span>
      <span className={styles.rowValue}>
        <AssigneesValue assignees={assignees} />
      </span>
    </div>
    <div className={styles.row}>
      <span className={styles.rowLabel}>Due</span>
      <span className={cn(styles.rowValue, isOverdue && styles.overdue)}>
        {dueDate.toLocaleDateString()}
      </span>
    </div>
  </div>
);

/** A single assignment tile: content title, type, status, assignee/due, progress, view + delete actions. */
export const AssignmentCard = ({
  assignment,
  deleting,
  onView,
  onDelete,
}: AssignmentCardProps): ReactElement => {
  const { can } = useMyCapabilities();
  const canDelete = can('assign', 'delete');
  const status = assignment.status;
  const meta = STATUS[status];
  const typeMeta = TYPE_CONFIG[assignment.contentType];
  const TypeIcon = typeMeta.icon;

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardTopLeft}>
          <span className={cn(styles.iconTile, typeMeta.iconBgClass)}>
            <TypeIcon size={20} aria-hidden="true" />
          </span>
          <Badge tone={typeMeta.tone} size="sm" icon={TypeIcon}>
            {typeMeta.label}
          </Badge>
        </div>
        <StatusBadge tone={meta.tone} label={meta.label} />
      </div>
      <h3 className={styles.cardTitle}>{assignment.contentTitle}</h3>
      <CardMetaRows
        assignees={assignment.assignees}
        dueDate={assignment.dueDate}
        isOverdue={status === 'overdue'}
      />
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
          variant="outline"
          fullWidth
          onClick={() => {
            onView(assignment);
          }}
        >
          View progress
        </Button>
        {canDelete ? (
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
        ) : null}
      </div>
    </article>
  );
};
