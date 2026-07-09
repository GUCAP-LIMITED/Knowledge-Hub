import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  readonly icon?: LucideIcon;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

/** Friendly placeholder shown when a list or area has no content. */
export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps): ReactElement => (
  <div className={styles.empty}>
    <div className={styles.iconWrap}>
      <Icon size={26} aria-hidden="true" />
    </div>
    <h3 className={styles.title}>{title}</h3>
    {description !== undefined ? <p className={styles.desc}>{description}</p> : null}
    {action}
  </div>
);
