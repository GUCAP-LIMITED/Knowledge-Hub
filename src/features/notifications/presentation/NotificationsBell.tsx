import {
  useState,
  useEffect,
  useRef,
  type ReactElement,
  type RefObject,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { IconButton } from '@shared/ui';
import type { Announcement, NotificationStats } from '../domain';
import {
  useInfiniteNotifications,
  useMarkAllRead,
  useMarkAnnouncementRead,
  useNotificationStats,
} from './use-notifications';
import { useNotificationSse } from './use-notification-sse';
import { NotificationsDropdownPanel, type FilterTab } from './NotificationsDropdownPanel';
import styles from './NotificationsBell.module.css';

const useEscapeToClose = (isOpen: boolean, onClose: () => void): void => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
};

interface ObserverParams {
  readonly enabled: boolean;
  readonly containerRef: RefObject<HTMLDivElement>;
  readonly sentinelRef: RefObject<HTMLDivElement>;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly fetchNextPage: () => void;
}

const useInfiniteScrollObserver = ({
  enabled,
  containerRef,
  sentinelRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: ObserverParams): void => {
  useEffect(() => {
    if (!enabled) return;
    const target = sentinelRef.current;
    const container = containerRef.current;
    if (!target || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: container, rootMargin: '120px' },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [
    enabled,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    containerRef,
    sentinelRef,
  ]);
};

interface NotificationsBellState {
  readonly open: boolean;
  readonly setOpen: Dispatch<SetStateAction<boolean>>;
  readonly filter: FilterTab;
  readonly setFilter: Dispatch<SetStateAction<FilterTab>>;
  readonly stats: NotificationStats;
  readonly displayedList: readonly Announcement[];
  readonly isLoading: boolean;
  readonly isFetchingNextPage: boolean;
  readonly hasNextPage: boolean;
  readonly listRef: RefObject<HTMLDivElement>;
  readonly sentinelRef: RefObject<HTMLDivElement>;
  readonly handleMarkAllRead: () => void;
  readonly handleRead: (id: string) => void;
  readonly handleNavigate: (route: string) => void;
  readonly handleClose: () => void;
}

const useNotificationsBellState = (): NotificationsBellState => {
  const navigate = useNavigate();
  useNotificationSse();

  const statsQuery = useNotificationStats();
  const stats = statsQuery.data ?? { totalCount: 0, readCount: 0, unreadCount: 0 };
  const markRead = useMarkAnnouncementRead();
  const markAll = useMarkAllRead();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('all');

  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteNotifications(filter, { pageSize: 15 });

  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEscapeToClose(open, () => {
    setOpen(false);
  });

  useInfiniteScrollObserver({
    enabled: open,
    containerRef: listRef,
    sentinelRef,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: () => {
      void fetchNextPage();
    },
  });

  const displayedList = infiniteData?.pages.flatMap((page) => page.items) ?? [];

  return {
    open,
    setOpen,
    filter,
    setFilter,
    stats,
    displayedList,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    listRef,
    sentinelRef,
    handleMarkAllRead: () => {
      markAll.mutate();
    },
    handleRead: (id: string) => {
      markRead.mutate(id);
    },
    handleNavigate: (route: string) => {
      setOpen(false);
      navigate(route);
    },
    handleClose: () => {
      setOpen(false);
    },
  };
};

/** Header notifications bell: unread count badge + paginated infinite-scroll dropdown. */
export const NotificationsBell = (): ReactElement => {
  const bell = useNotificationsBellState();
  const label =
    bell.stats.unreadCount > 0
      ? `Notifications, ${String(bell.stats.unreadCount)} unread`
      : 'Notifications';

  return (
    <div className={styles.wrap}>
      <IconButton
        label={label}
        onClick={() => {
          bell.setOpen((prev) => !prev);
        }}
      >
        <Bell size={16} />
        {bell.stats.unreadCount > 0 ? (
          <span className={styles.count} aria-hidden="true">
            {bell.stats.unreadCount}
          </span>
        ) : null}
      </IconButton>

      {bell.open ? (
        <NotificationsDropdownPanel
          filter={bell.filter}
          onTabChange={bell.setFilter}
          unreadCount={bell.stats.unreadCount}
          totalCount={bell.stats.totalCount}
          displayedList={bell.displayedList}
          isLoading={bell.isLoading}
          isFetchingNextPage={bell.isFetchingNextPage}
          hasNextPage={bell.hasNextPage}
          listRef={bell.listRef}
          sentinelRef={bell.sentinelRef}
          onMarkAllRead={bell.handleMarkAllRead}
          onRead={bell.handleRead}
          onNavigate={bell.handleNavigate}
          onClose={bell.handleClose}
        />
      ) : null}
    </div>
  );
};
