import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import { useToast } from '@shared/ui';
import type {
  AssignableUser,
  Assignment,
  AssignmentListFilter,
  AssignmentListResult,
} from '../domain';
import type { CreateAssignmentInput } from '../application';
import { useAssignmentsModule } from './use-assignments-module';
import type { AssignmentFilter } from './assignment-filters';

/** Stable query-key prefix for the assignment lists. Mutations invalidate this to refetch. */
export const assignmentsQueryKey = ['assignments'] as const;

export const assignableUsersQueryKey = (
  filter = '',
): readonly ['assignments', 'assignable-users', string] =>
  ['assignments', 'assignable-users', filter] as const;

export const ASSIGNMENTS_PAGE_SIZE = 12;

/** Maps a tab to the API's status query string (`GET /api/app/training-assignment?status=...`). */
const API_STATUS: Record<Exclude<AssignmentFilter, 'all'>, string> = {
  active: 'Active',
  completed: 'Completed',
  overdue: 'Overdue',
};

/** Infinite list query for paginated assignments (matching useInfiniteCourses). */
export const useInfiniteAssignments = (
  filter: AssignmentFilter = 'all',
  search = '',
): UseInfiniteQueryResult<InfiniteData<AssignmentListResult>> => {
  const { listAssignments } = useAssignmentsModule();

  return useInfiniteQuery({
    queryKey: [...assignmentsQueryKey, 'infinite', filter, search] as const,
    queryFn: async ({ pageParam }): Promise<AssignmentListResult> => {
      const apiStatus = filter === 'all' ? undefined : API_STATUS[filter];
      const listFilter: AssignmentListFilter = {
        skipCount: pageParam,
        maxResultCount: ASSIGNMENTS_PAGE_SIZE,
        ...(apiStatus !== undefined ? { status: apiStatus } : {}),
        ...(search !== '' ? { search } : {}),
      };
      const result = await listAssignments.execute(listFilter);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: AssignmentListResult,
      allPages: readonly AssignmentListResult[],
    ): number | undefined => {
      const loadedCount = allPages.reduce(
        (total: number, page: AssignmentListResult): number => total + page.items.length,
        0,
      );
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
  });
};

/** List query scoped to one tab + search term. Unwraps the `Result`, throwing the `AppError` so Query surfaces it. */
export const useAssignments = (
  filter: AssignmentFilter = 'all',
  search = '',
): UseQueryResult<AssignmentListResult> => {
  const { listAssignments } = useAssignmentsModule();
  return useQuery({
    queryKey: [...assignmentsQueryKey, filter, search],
    queryFn: async (): Promise<AssignmentListResult> => {
      const apiStatus = filter === 'all' ? undefined : API_STATUS[filter];
      const listFilter: { status?: string; search?: string } = {};
      if (apiStatus !== undefined) {
        listFilter.status = apiStatus;
      }
      if (search !== '') {
        listFilter.search = search;
      }
      const result = await listAssignments.execute(
        listFilter.status === undefined && listFilter.search === undefined
          ? undefined
          : listFilter,
      );
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

const useInvalidateAssignments = (): (() => void) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: assignmentsQueryKey });
  };
};

/** Query to search or preload assignable users across the tenant. */
export const useAssignableUsers = (
  filter = '',
): UseQueryResult<readonly AssignableUser[]> => {
  const { searchAssignableUsers } = useAssignmentsModule();
  return useQuery({
    queryKey: assignableUsersQueryKey(filter),
    queryFn: async (): Promise<readonly AssignableUser[]> => {
      const result = await searchAssignableUsers.execute(filter);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    staleTime: 60_000,
  });
};

/** Mutation to create an assignment; refreshes the list on success. */
export const useCreateAssignment = (): UseMutationResult<
  Assignment,
  Error,
  CreateAssignmentInput
> => {
  const { createAssignment } = useAssignmentsModule();
  const invalidate = useInvalidateAssignments();
  const toast = useToast();
  return useMutation({
    mutationFn: async (input: CreateAssignmentInput): Promise<Assignment> => {
      const result = await createAssignment.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      toast.success('Training assignment created.');
      invalidate();
    },
  });
};

/** Mutation to delete an assignment by id; refreshes the list on success. */
export const useDeleteAssignment = (): UseMutationResult<void, Error, string> => {
  const { deleteAssignment } = useAssignmentsModule();
  const invalidate = useInvalidateAssignments();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteAssignment.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
    },
    onSuccess: invalidate,
  });
};
