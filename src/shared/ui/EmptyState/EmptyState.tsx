import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { Spot } from '@shared/ui/Spot/Spot';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  readonly icon?: LucideIcon;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

/** Friendly placeholder shown when a list or area has no content. */
export const EmptyState = ({
  icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps): ReactElement => (
  <div className={styles.empty}>
    <Spot icon={icon} />
    <h3 className={styles.title}>{title}</h3>
    {description !== undefined ? <p className={styles.desc}>{description}</p> : null}
    {action}
  </div>
);
