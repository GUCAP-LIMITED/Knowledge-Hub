import type { ReactElement, ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

/** Friendly placeholder shown when a list or area has no content. */
export const EmptyState = ({
  title,
  description,
  action,
}: EmptyStateProps): ReactElement => (
  <div className={styles.empty}>
    <h3 className={styles.title}>{title}</h3>
    {description !== undefined ? <p className={styles.desc}>{description}</p> : null}
    {action}
  </div>
);
