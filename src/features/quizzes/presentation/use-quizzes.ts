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

/** Query key for a content's quizzes. Mutations invalidate this to refetch. */
export const quizzesQueryKey = (contentId: string): readonly string[] => [
  'quizzes',
  contentId,
];

/** Fetch every quiz attached to a piece of content. */
export const useQuizzes = (contentId: string): UseQueryResult<readonly Quiz[]> => {
  const { listQuizzes } = useQuizzesModule();
  return useQuery({
    queryKey: quizzesQueryKey(contentId),
    queryFn: async (): Promise<readonly Quiz[]> => {
      const result = await listQuizzes.execute(contentId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export interface SubmitQuizInput {
  readonly quizId: string;
  readonly answers: QuizAnswers;
}

/** Grade a learner's answers for one quiz and return the pass/fail result. */
export const useSubmitQuiz = (): UseMutationResult<
  QuizResult,
  Error,
  SubmitQuizInput
> => {
  const { submitQuiz } = useQuizzesModule();
  return useMutation({
    mutationFn: async ({ quizId, answers }: SubmitQuizInput): Promise<QuizResult> => {
      const result = await submitQuiz.execute(quizId, answers);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

/** Create or replace a quiz; refreshes the content's quizzes on success. */
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
      void queryClient.invalidateQueries({ queryKey: quizzesQueryKey(quiz.contentId) });
    },
  });
};

export interface DeleteQuizInput {
  readonly quizId: string;
  readonly contentId: string;
}

/** Delete a quiz; refreshes the content's quizzes on success. */
export const useDeleteQuiz = (): UseMutationResult<void, Error, DeleteQuizInput> => {
  const { deleteQuiz } = useQuizzesModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quizId }: DeleteQuizInput): Promise<void> => {
      const result = await deleteQuiz.execute(quizId);
      if (isErr(result)) {
        throw result.error;
      }
    },
    onSuccess: (_data, { contentId }) => {
      void queryClient.invalidateQueries({ queryKey: quizzesQueryKey(contentId) });
    },
  });
};
