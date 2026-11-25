import type { ReactElement } from 'react';
import { BellOff } from 'lucide-react';
import styles from './NotificationsBell.module.css';

export interface NotificationsEmptyStateProps {
  readonly isUnreadFilter: boolean;
}

export const NotificationsEmptyState = ({
  isUnreadFilter,
}: NotificationsEmptyStateProps): ReactElement => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIconWrap}>
      <BellOff size={24} aria-hidden="true" />
    </div>
    <p className={styles.emptyTitle}>
      {isUnreadFilter ? 'No unread notifications' : "You're all caught up."}
    </p>
    <p className={styles.emptyDesc}>
      {isUnreadFilter
        ? 'You have no unread notifications at the moment.'
        : 'When you receive new updates, they will appear here.'}
    </p>
  </div>
);
