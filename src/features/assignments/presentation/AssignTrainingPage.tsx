import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Plus } from 'lucide-react';
import { Button, CardGridSkeleton, PageHeader, useDeleteConfirm } from '@shared/ui';
import { useDebouncedValue } from '@shared/utils';
import { useMyCapabilities } from '@features/users';
import type { Assignment, AssignmentListResult } from '../domain';
import {
  useCreateAssignment,
  useDeleteAssignment,
  useInfiniteAssignments,
} from './use-assignments';
import { AssignmentList } from './AssignmentList';
import { CreateModal, ViewProgressModal } from './AssignmentModals';
import type { AssignmentFilter } from './assignment-filters';
import styles from './AssignTrainingPage.module.css';

const AssignTrainingHeader = ({
  children,
}: {
  readonly children?: ReactNode;
}): ReactElement => (
  <PageHeader
    title="Assign Training"
    subtitle="Assign courses, tutorials, or resources to teams or individuals"
  >
    {children}
  </PageHeader>
);

const extractAssignmentCounts = (
  firstPage: AssignmentListResult | undefined,
): Record<AssignmentFilter, number> => {
  if (!firstPage) {
    return { all: 0, active: 0, completed: 0, overdue: 0 };
  }
  return {
    all: firstPage.totalCount,
    active: firstPage.activeCount,
    completed: firstPage.completedCount,
    overdue: firstPage.overdueCount,
  };
};

/** Holds the tab + search and the queries they drive (one for badge counts, one for the grid). */
const useAssignmentTracker = (): {
  readonly tab: AssignmentFilter;
  readonly list: readonly Assignment[];
  readonly counts: Record<AssignmentFilter, number>;
  readonly loading: boolean;
  readonly initialLoading: boolean;
  readonly error: Error | null;
  readonly query: string;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly sentinelRef: RefObject<HTMLDivElement>;
  readonly totalCount: number;
  readonly onTab: (value: AssignmentFilter) => void;
  readonly onQuery: (value: string) => void;
} => {
  const [tab, setTab] = useState<AssignmentFilter>('all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);

  const {
    data,
    isLoading,
    isFetching,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteAssignments(tab, debouncedQuery);

  const list = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const counts = useMemo(() => extractAssignmentCounts(data?.pages[0]), [data?.pages]);

  return {
    tab,
    list,
    counts,
    loading: isFetching,
    initialLoading: isLoading,
    error,
    query,
    hasNextPage,
    isFetchingNextPage,
    sentinelRef,
    totalCount,
    onTab: setTab,
    onQuery: setQuery,
  };
};

const AssignTrainingContent = ({
  canCreate,
  tracker,
  onOpenCreate,
  onView,
  onDelete,
  deleteBusy,
}: {
  readonly canCreate: boolean;
  readonly tracker: ReturnType<typeof useAssignmentTracker>;
  readonly onOpenCreate: () => void;
  readonly onView: (assignment: Assignment) => void;
  readonly onDelete: (id: string) => void;
  readonly deleteBusy: boolean;
}): ReactElement => (
  <>
    <AssignTrainingHeader>
      {canCreate ? (
        <Button onClick={onOpenCreate}>
          <Plus size={16} aria-hidden="true" /> New assignment
        </Button>
      ) : null}
    </AssignTrainingHeader>

    <AssignmentList
      list={tracker.list}
      tab={tracker.tab}
      counts={tracker.counts}
      loading={tracker.loading}
      query={tracker.query}
      error={tracker.error}
      deleting={deleteBusy}
      hasNextPage={tracker.hasNextPage}
      isFetchingNextPage={tracker.isFetchingNextPage}
      sentinelRef={tracker.sentinelRef}
      totalCount={tracker.totalCount}
      onTab={tracker.onTab}
      onQuery={tracker.onQuery}
      onNew={onOpenCreate}
      onView={onView}
      onDelete={onDelete}
    />
  </>
);

const AssignTrainingModals = ({
  modalOpen,
  creating,
  createError,
  viewing,
  onCloseCreate,
  onCreate,
  onCloseViewing,
  deleteDialog,
}: {
  readonly modalOpen: boolean;
  readonly creating: boolean;
  readonly createError: string | undefined;
  readonly viewing: Assignment | null;
  readonly onCloseCreate: () => void;
  readonly onCreate: (
    input: Parameters<ReturnType<typeof useCreateAssignment>['mutate']>[0],
  ) => void;
  readonly onCloseViewing: () => void;
  readonly deleteDialog: ReactNode;
}): ReactElement => (
  <>
    <CreateModal
      open={modalOpen}
      creating={creating}
      error={createError}
      onClose={onCloseCreate}
      onCreate={onCreate}
    />
    <ViewProgressModal assignment={viewing} onClose={onCloseViewing} />
    {deleteDialog}
  </>
);

/** Assign Training: card grid + create modal. Admin only. */
export const AssignTrainingPage = (): ReactElement => {
  const tracker = useAssignmentTracker();
  const { can } = useMyCapabilities();
  const [modalOpen, setModalOpen] = useState(false);
  const create = useCreateAssignment();
  const deleteAssignment = useDeleteAssignment();
  const del = useDeleteConfirm(
    tracker.list.map((assignment) => ({
      id: assignment.id,
      title: assignment.contentTitle,
    })),
    'assignment',
    (id) => {
      deleteAssignment.mutate(id);
    },
    deleteAssignment.isPending,
  );
  const [viewing, setViewing] = useState<Assignment | null>(null);

  if (tracker.initialLoading) {
    return (
      <section className={styles.screen}>
        <AssignTrainingHeader />
        <CardGridSkeleton />
      </section>
    );
  }

  return (
    <section className={styles.screen}>
      <AssignTrainingContent
        canCreate={can('assign', 'create')}
        tracker={tracker}
        onOpenCreate={() => {
          setModalOpen(true);
        }}
        onView={setViewing}
        onDelete={del.request}
        deleteBusy={deleteAssignment.isPending}
      />

      <AssignTrainingModals
        modalOpen={modalOpen}
        creating={create.isPending}
        createError={create.isError ? create.error.message : undefined}
        viewing={viewing}
        onCloseCreate={() => {
          create.reset();
          setModalOpen(false);
        }}
        onCreate={(input) => {
          create.mutate(input, {
            onSuccess: () => {
              setModalOpen(false);
            },
          });
        }}
        onCloseViewing={() => {
          setViewing(null);
        }}
        deleteDialog={del.dialog}
      />
    </section>
  );
};
