import { type ReactElement, type RefObject } from 'react';
import type { Announcement } from '../domain';
import { NotificationItem } from './NotificationItem';
import { NotificationsPanelHeader } from './NotificationsPanelHeader';
import { NotificationsEmptyState } from './NotificationsEmptyState';
import styles from './NotificationsBell.module.css';

export type FilterTab = 'all' | 'unread';

interface ListFooterProps {
  readonly isFetchingNextPage: boolean;
  readonly hasNextPage: boolean;
  readonly sentinelRef: RefObject<HTMLDivElement>;
  readonly count: number;
  readonly total: number;
}

const NotificationsListFooter = ({
  isFetchingNextPage,
  hasNextPage,
  sentinelRef,
  count,
  total,
}: ListFooterProps): ReactElement | null => {
  if (isFetchingNextPage) {
    return (
      <div className={styles.loadingMore} role="status">
        <div className={styles.spinner} />
        <span>Loading more...</span>
      </div>
    );
  }
  if (hasNextPage) {
    return <div ref={sentinelRef} className={styles.sentinel} />;
  }
  if (count > 0) {
    return (
      <div className={styles.endBanner}>
        <span className={styles.endBannerSub}>
          Displaying {count} of {total} notifications
        </span>
      </div>
    );
  }
  return null;
};

export interface NotificationsDropdownPanelProps {
  readonly filter: FilterTab;
  readonly onTabChange: (tab: FilterTab) => void;
  readonly unreadCount: number;
  readonly totalCount: number;
  readonly displayedList: readonly Announcement[];
  readonly isLoading: boolean;
  readonly isFetchingNextPage: boolean;
  readonly hasNextPage: boolean;
  readonly listRef: RefObject<HTMLDivElement>;
  readonly sentinelRef: RefObject<HTMLDivElement>;
  readonly onMarkAllRead: () => void;
  readonly onRead: (id: string) => void;
  readonly onNavigate: (route: string) => void;
  readonly onClose: () => void;
}

export const NotificationsDropdownPanel = ({
  filter,
  onTabChange,
  unreadCount,
  totalCount,
  displayedList,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  listRef,
  sentinelRef,
  onMarkAllRead,
  onRead,
  onNavigate,
  onClose,
}: NotificationsDropdownPanelProps): ReactElement => {
  const activeCount = filter === 'unread' ? unreadCount : totalCount;

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close notifications"
        onClick={onClose}
      />
      <div className={styles.panel} role="dialog" aria-label="Notifications">
        <NotificationsPanelHeader
          unreadCount={unreadCount}
          totalCount={totalCount}
          activeTab={filter}
          onTabChange={onTabChange}
          onMarkAllRead={onMarkAllRead}
        />

        <div ref={listRef} className={styles.list}>
          {displayedList.length === 0 && !isLoading ? (
            <NotificationsEmptyState isUnreadFilter={filter === 'unread'} />
          ) : (
            displayedList.map((announcement) => (
              <NotificationItem
                key={announcement.id}
                announcement={announcement}
                onRead={onRead}
                onNavigate={onNavigate}
              />
            ))
          )}

          <NotificationsListFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            sentinelRef={sentinelRef}
            count={displayedList.length}
            total={activeCount}
          />
        </div>
      </div>
    </>
  );
};
