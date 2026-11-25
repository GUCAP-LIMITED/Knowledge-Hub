import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  useQuery,
  type UseQueryResult,
  type InfiniteData,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { PagedTeamMembersResult, TeamProgressOverview } from '../domain';
import { useTeamModule } from './use-team-module';

/** Stable query key for the team overview. */
export const teamOverviewQueryKey = ['team-overview'] as const;

/** Overview query. Unwraps the domain `Result`, throwing the `AppError` so Query surfaces it. */
export const useTeamProgressOverview = (): UseQueryResult<TeamProgressOverview> => {
  const { getTeamProgressOverview } = useTeamModule();

  return useQuery({
    queryKey: teamOverviewQueryKey,
    queryFn: async (): Promise<TeamProgressOverview> => {
      const result = await getTeamProgressOverview.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

/** Infinite query for team members. */
export const useInfiniteTeamMembers = (
  pageSize = 15,
  filter?: string,
  sorting?: string,
): UseInfiniteQueryResult<InfiniteData<PagedTeamMembersResult>> => {
  const { getTeamMembers } = useTeamModule();

  return useInfiniteQuery({
    queryKey: ['team-members', { pageSize, filter, sorting }] as const,
    queryFn: async ({ pageParam }): Promise<PagedTeamMembersResult> => {
      const result = await getTeamMembers.execute({
        skipCount: pageParam,
        maxResultCount: pageSize,
        filter,
        sorting,
      });
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, p) => acc + p.items.length, 0);
      return totalLoaded < lastPage.totalCount ? totalLoaded : undefined;
    },
  });
};

/** Infinite query for at-risk members. */
export const useInfiniteAtRiskMembers = (
  pageSize = 8,
  filter?: string,
): UseInfiniteQueryResult<InfiniteData<PagedTeamMembersResult>> => {
  const { getAtRiskMembers } = useTeamModule();

  return useInfiniteQuery({
    queryKey: ['at-risk-members', { pageSize, filter }] as const,
    queryFn: async ({ pageParam }): Promise<PagedTeamMembersResult> => {
      const result = await getAtRiskMembers.execute({
        skipCount: pageParam,
        maxResultCount: pageSize,
        filter,
      });
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, p) => acc + p.items.length, 0);
      return totalLoaded < lastPage.totalCount ? totalLoaded : undefined;
    },
  });
};
