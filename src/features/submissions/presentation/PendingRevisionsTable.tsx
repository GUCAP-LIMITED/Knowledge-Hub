import { useEffect, useRef, type ReactElement, type Ref } from 'react';
import {
  Alert,
  Button,
  EmptyState,
  RowListSkeleton,
  Spinner,
  Tabs,
  TabsPanel,
} from '@shared/ui';
import type { ContentRevision } from '@features/content';
import { ApprovalsToolbar } from './ApprovalsToolbar';
import { PendingRevisionRow } from './PendingRevisionRow';
import { REVISION_TABS, useRevisionQueue, type RevisionTab } from './use-revision-queue';
import styles from './ApprovalsPage.module.css';

const PendingRevisionList = ({
  isLoading,
  error,
  items,
  tab,
  hasNextPage,
  isFetchingNextPage,
  sentinelRef,
  filtered,
  onClearAll,
}: {
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly items: readonly ContentRevision[];
  readonly tab: (typeof REVISION_TABS)[number];
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly sentinelRef: Ref<HTMLDivElement>;
  readonly filtered: boolean;
  readonly onClearAll: () => void;
}): ReactElement => {
  if (isLoading) {
    return <RowListSkeleton count={6} leading trailing />;
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load the revisions">
        {error.message}
      </Alert>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="All caught up"
        description={`No ${tab.label.toLowerCase()} revisions to review.`}
        action={
          filtered ? (
            <Button variant="outline" onClick={onClearAll}>
              Clear all filters
            </Button>
          ) : undefined
        }
      />
    );
  }
  return (
    <>
      <div className={styles.list}>
        {items.map((revision) => (
          <PendingRevisionRow
            key={revision.id}
            revision={revision}
            statusType={tab.value}
          />
        ))}
      </div>
      {hasNextPage && (
        <div ref={sentinelRef} className={styles.sentinelWrap}>
          {isFetchingNextPage && <Spinner label="Loading more revisions..." />}
        </div>
      )}
    </>
  );
};

export const PendingRevisionsTable = (): ReactElement => {
  const queue = useRevisionQueue();
  const {
    activeTab,
    setActiveTab,
    query,
    setQuery,
    type,
    setType,
    filtered,
    clearFilters,
    items,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    tabs,
    currentTabConfig,
  } = queue;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={styles.panelBody}>
      <p className={styles.revisionsIntro}>
        Review and approve changes made by authors to existing content.
      </p>

      <ApprovalsToolbar
        query={query}
        type={type}
        types={['Course', 'Tutorial', 'Resource']}
        onQuery={setQuery}
        onType={setType}
        onClearAll={clearFilters}
      />

      <Tabs
        tabs={tabs}
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as RevisionTab);
        }}
      >
        {REVISION_TABS.map((tab) => (
          <TabsPanel key={tab.value} value={tab.value}>
            {tab.value === activeTab && (
              <PendingRevisionList
                isLoading={isLoading}
                error={error}
                items={items}
                tab={currentTabConfig}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                sentinelRef={sentinelRef}
                filtered={filtered}
                onClearAll={clearFilters}
              />
            )}
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  );
};
