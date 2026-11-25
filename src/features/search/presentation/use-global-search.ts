import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { GlobalSearchResult } from '../domain/types';
import { useSearchModule } from './use-search-module';

export const useGlobalSearch = (
  query: string,
  maxPerCategory = 10,
): UseQueryResult<GlobalSearchResult> => {
  const { searchContent } = useSearchModule();
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['search', 'global', trimmed.toLowerCase(), maxPerCategory] as const,
    queryFn: async (): Promise<GlobalSearchResult> => {
      if (trimmed === '') {
        return { courses: [], tutorials: [], resources: [] };
      }
      const result = await searchContent.execute({ query: trimmed, maxPerCategory });
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    enabled: trimmed.length > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};
