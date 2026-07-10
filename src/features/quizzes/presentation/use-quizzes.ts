import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { Quiz, QuizAnswers, QuizResult } from '../domain';
import type { SaveQuizInput } from '../application';
import { useQuizzesModule } from './use-quizzes-module';

/** Query key for a content's quiz. Mutations invalidate this to refetch. */
export const quizQueryKey = (contentId: string): readonly string[] => [
  'quizzes',
  contentId,
];

/** Fetch the quiz attached to a piece of content (null when none exists). */
export const useQuiz = (contentId: string): UseQueryResult<Quiz | null> => {
  const { getQuiz } = useQuizzesModule();
  return useQuery({
    queryKey: quizQueryKey(contentId),
    queryFn: async (): Promise<Quiz | null> => {
      const result = await getQuiz.execute(contentId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export interface SubmitQuizInput {
  readonly contentId: string;
  readonly answers: QuizAnswers;
}

/** Grade a learner's answers and return the pass/fail result. */
export const useSubmitQuiz = (): UseMutationResult<
  QuizResult,
  Error,
  SubmitQuizInput
> => {
  const { submitQuiz } = useQuizzesModule();
  return useMutation({
    mutationFn: async ({ contentId, answers }: SubmitQuizInput): Promise<QuizResult> => {
      const result = await submitQuiz.execute(contentId, answers);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

/** Create or replace a quiz (admin authoring); refreshes the content's quiz on success. */
export const useSaveQuiz = (): UseMutationResult<Quiz, Error, SaveQuizInput> => {
  const { saveQuiz } = useQuizzesModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveQuizInput): Promise<Quiz> => {
      const result = await saveQuiz.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (quiz) => {
      void queryClient.invalidateQueries({ queryKey: quizQueryKey(quiz.contentId) });
    },
  });
};
