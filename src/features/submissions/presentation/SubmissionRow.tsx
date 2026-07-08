import type { ReactElement, ReactNode } from 'react';
import type { Submission } from '../domain';
import { StatusBadge } from './StatusBadge';
import styles from './SubmissionRow.module.css';

export interface SubmissionRowProps {
  readonly submission: Submission;
  /** Optional action controls rendered on the right (reviewer buttons). */
  readonly children?: ReactNode;
}

/** A single submission line: title + status + metadata, with an optional action slot. */
export const SubmissionRow = ({
  submission,
  children,
}: SubmissionRowProps): ReactElement => (
  <article className={styles.row}>
    <div className={styles.info}>
      <div className={styles.titleLine}>
        <h3 className={styles.title}>{submission.title}</h3>
        <StatusBadge status={submission.status} />
      </div>
      <p className={styles.meta}>
        {submission.type} · {submission.submittedBy} ·{' '}
        {submission.submittedAt.toLocaleDateString()}
      </p>
      {submission.note !== null ? (
        <p className={styles.note}>“{submission.note}”</p>
      ) : null}
    </div>
    {children !== undefined ? <div className={styles.actions}>{children}</div> : null}
  </article>
);
