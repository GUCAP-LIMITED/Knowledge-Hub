import type { ReactElement } from 'react';
import { CheckCheck } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import styles from './NotificationsBell.module.css';

export interface NotificationsPanelHeaderProps {
  readonly unreadCount: number;
  readonly totalCount: number;
  readonly activeTab: 'all' | 'unread';
  readonly onTabChange: (tab: 'all' | 'unread') => void;
  readonly onMarkAllRead: () => void;
}

export const NotificationsPanelHeader = ({
  unreadCount,
  totalCount,
  activeTab,
  onTabChange,
  onMarkAllRead,
}: NotificationsPanelHeaderProps): ReactElement => (
  <div className={styles.head}>
    <div className={styles.headTitleRow}>
      <div className={styles.titleWithBadge}>
        <span className={styles.headTitle}>Notifications</span>
        {unreadCount > 0 ? (
          <span className={styles.unreadPill}>{unreadCount} unread</span>
        ) : null}
      </div>
      {unreadCount > 0 ? (
        <Button variant="link" size="xs" onClick={onMarkAllRead}>
          <CheckCheck aria-hidden="true" />
          <span>Mark all read</span>
        </Button>
      ) : null}
    </div>

    <div className={styles.tabsRow} role="tablist" aria-label="Filter notifications">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'all'}
        className={cn(styles.tabBtn, activeTab === 'all' && styles.tabBtnActive)}
        onClick={() => {
          onTabChange('all');
        }}
      >
        <span>All</span>
        <span className={styles.tabCount}>{totalCount}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'unread'}
        className={cn(styles.tabBtn, activeTab === 'unread' && styles.tabBtnActive)}
        onClick={() => {
          onTabChange('unread');
        }}
      >
        <span>Unread</span>
        {unreadCount > 0 ? <span className={styles.tabCount}>{unreadCount}</span> : null}
      </button>
    </div>
  </div>
);
