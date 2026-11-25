import { useQuery } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { MyLearningStatusOption } from '../domain/types';
import { FALLBACK_MY_LEARNING_STATUSES } from '../infrastructure/http-my-learning-gateway';
import { useMyLearningModule } from './use-my-learning-module';

export const myLearningStatusesQueryKey = ['enums', 'MyLearningStatus'] as const;

export interface UseMyLearningStatusesResult {
  readonly statuses: readonly MyLearningStatusOption[];
  readonly isLoading: boolean;
  readonly isError: boolean;
}

export const useMyLearningStatuses = (): UseMyLearningStatusesResult => {
  const { getMyLearningStatuses } = useMyLearningModule();

  const query = useQuery({
    queryKey: myLearningStatusesQueryKey,
    queryFn: async (): Promise<readonly MyLearningStatusOption[]> => {
      const result = await getMyLearningStatuses.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  return {
    statuses:
      query.data && query.data.length > 0 ? query.data : FALLBACK_MY_LEARNING_STATUSES,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
