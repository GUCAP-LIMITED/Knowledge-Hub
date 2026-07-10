import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { Tutorial } from '../domain';
import type { UpdateTutorialInput } from '../application';
import { useTutorialsModule } from './use-tutorials-module';

/** Stable query key for the tutorials library. */
export const tutorialsQueryKey = ['tutorials'] as const;

/** List query. Unwraps the domain `Result`, throwing the `AppError` so Query surfaces it. */
export const useTutorials = (): UseQueryResult<readonly Tutorial[]> => {
  const { listTutorials } = useTutorialsModule();

  return useQuery({
    queryKey: tutorialsQueryKey,
    queryFn: async (): Promise<readonly Tutorial[]> => {
      const result = await listTutorials.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

/** Mutation to edit a tutorial's title/category; refreshes the library on success. */
export const useUpdateTutorial = (): UseMutationResult<
  Tutorial,
  Error,
  UpdateTutorialInput
> => {
  const { updateTutorial } = useTutorialsModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateTutorialInput): Promise<Tutorial> => {
      const result = await updateTutorial.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tutorialsQueryKey });
    },
  });
};

/** Mutation to delete a tutorial; refreshes the library on success. */
export const useDeleteTutorial = (): UseMutationResult<void, Error, string> => {
  const { deleteTutorial } = useTutorialsModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteTutorial.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tutorialsQueryKey });
    },
  });
};
