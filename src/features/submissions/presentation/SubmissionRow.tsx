import type { ReactElement, ReactNode } from 'react';
import { Clock, FileText } from 'lucide-react';
import { cn } from '@shared/utils';
import type { Submission } from '../domain';
import { StatusBadge } from './StatusBadge';
import styles from './SubmissionRow.module.css';

const waitingLabel = (submittedAt: Date): string => {
  const days = Math.floor((Date.now() - submittedAt.getTime()) / 86_400_000);
  return days <= 0 ? 'today' : `${String(days)}d waiting`;
};

export interface SubmissionRowProps {
  readonly submission: Submission;
  /** Show the status pill (default true). Hidden inside a status tab where it's redundant. */
  readonly showStatus?: boolean;
  readonly selected?: boolean;
  readonly onToggleSelect?: (id: string) => void;
  /** Optional action controls rendered on the right (reviewer buttons). */
  readonly children?: ReactNode;
}

/** A single submission line: optional select, file tile, title, metadata, and an action slot. */
export const SubmissionRow = ({
  submission,
  showStatus = true,
  selected = false,
  onToggleSelect,
  children,
}: SubmissionRowProps): ReactElement => (
  <article className={cn(styles.row, selected && styles.rowSelected)}>
    <div className={styles.lead}>
      {onToggleSelect !== undefined ? (
        <input
          type="checkbox"
          className={styles.check}
          checked={selected}
          aria-label={`Select ${submission.title}`}
          onChange={() => {
            onToggleSelect(submission.id);
          }}
        />
      ) : null}
      <span className={styles.iconTile}>
        <FileText size={20} aria-hidden="true" />
      </span>
      <div className={styles.info}>
        <div className={styles.titleLine}>
          <h3 className={styles.title}>{submission.title}</h3>
          {showStatus ? <StatusBadge status={submission.status} /> : null}
        </div>
        <div className={styles.metaChips}>
          <span className={styles.chip}>{submission.type}</span>
          {submission.awaitsDecision() ? (
            <span className={styles.waiting}>
              <Clock size={12} aria-hidden="true" />{' '}
              {waitingLabel(submission.submittedAt)}
            </span>
          ) : null}
          <span className={styles.metaDate}>
            {submission.submittedBy} · {submission.submittedAt.toLocaleDateString()}
          </span>
        </div>
        {submission.note !== null ? (
          <p className={styles.note}>“{submission.note}”</p>
        ) : null}
      </div>
    </div>
    {children !== undefined ? <div className={styles.actions}>{children}</div> : null}
  </article>
);
