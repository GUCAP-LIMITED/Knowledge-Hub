import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { QuizLearnerStatus } from '../domain';
import { useQuizzesModule } from './use-quizzes-module';

export const quizLearnerStatusQueryKey = (
  quizId: string | null,
): readonly (string | null)[] => ['quiz-learner-status', quizId];

export const useQuizLearnerStatus = (
  quizId: string | null,
  options?: { readonly enabled?: boolean },
): UseQueryResult<QuizLearnerStatus> => {
  const { getMyQuizStatus } = useQuizzesModule();
  return useQuery({
    queryKey: quizLearnerStatusQueryKey(quizId),
    enabled: (options?.enabled ?? true) && quizId !== null && quizId !== '',
    queryFn: async (): Promise<QuizLearnerStatus> => {
      if (!quizId) {
        throw new Error('Quiz ID is required');
      }
      const result = await getMyQuizStatus.execute(quizId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};
