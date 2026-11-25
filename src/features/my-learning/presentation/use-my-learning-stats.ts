import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { MyLearningStats } from '../domain/types';
import { useMyLearningModule } from './use-my-learning-module';

export const useMyLearningStats = (): UseQueryResult<MyLearningStats> => {
  const module = useMyLearningModule();

  return useQuery({
    queryKey: ['my-learning', 'stats'],
    queryFn: async (): Promise<MyLearningStats> => {
      const result = await module.getMyLearningStats.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    staleTime: 1000 * 60 * 2,
  });
};
