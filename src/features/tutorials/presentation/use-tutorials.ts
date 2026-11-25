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
import { useToast } from '@shared/ui';
import { isErr } from '@core/result';
import { invalidateLearningCaches } from '@features/my-learning/presentation/learning-cache-sync';
import {
  DIFFICULTIES,
  type Tutorial,
  type TutorialCatalogParams,
  type PagedResult,
} from '../domain';
import type { UpdateTutorialInput } from '../application';
import { useTutorialsModule } from './use-tutorials-module';

/** Stable query key for the tutorials library. */
export const tutorialsQueryKey = ['tutorials'] as const;

/** List query. Unwraps the domain `Result`, returning items array for simple callers. */
export const useTutorials = (
  params?: TutorialCatalogParams,
): UseQueryResult<readonly Tutorial[]> => {
  const { listTutorials } = useTutorialsModule();

  return useQuery({
    queryKey: ['tutorials', params] as const,
    queryFn: async (): Promise<readonly Tutorial[]> => {
      const result = await listTutorials.execute(params);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value.items;
    },
  });
};

/** Infinite list query for the paginated tutorials library. */
export const useInfiniteTutorials = (
  params: Omit<TutorialCatalogParams, 'skipCount'>,
): UseInfiniteQueryResult<InfiniteData<PagedResult<Tutorial>>> => {
  const { listTutorials } = useTutorialsModule();

  return useInfiniteQuery({
    queryKey: ['tutorials', 'infinite', params] as const,
    queryFn: async ({ pageParam }): Promise<PagedResult<Tutorial>> => {
      const result = await listTutorials.execute({
        ...params,
        skipCount: pageParam,
      });
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: PagedResult<Tutorial>,
      allPages: readonly PagedResult<Tutorial>[],
    ): number | undefined => {
      const loadedCount = allPages.reduce(
        (total: number, page: PagedResult<Tutorial>): number => total + page.items.length,
        0,
      );
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const tutorialQueryKey = (id: string): readonly string[] => ['tutorials', id];

/** Single-tutorial query for the detail page. */
export const useTutorial = (id: string): UseQueryResult<Tutorial> => {
  const { getTutorial } = useTutorialsModule();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: tutorialQueryKey(id),
    queryFn: async (): Promise<Tutorial> => {
      const result = await getTutorial.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      if (result.value.slug && result.value.slug !== id) {
        queryClient.setQueryData(tutorialQueryKey(result.value.slug), result.value);
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
  const { success } = useToast();
  return useMutation({
    mutationFn: async (input: UpdateTutorialInput): Promise<Tutorial> => {
      const result = await updateTutorial.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      success('Tutorial updated.');
      void queryClient.invalidateQueries({ queryKey: tutorialsQueryKey });
    },
  });
};

/** Mutation to mark a tutorial complete; refreshes the library on success. */
export const useMarkTutorialComplete = (): UseMutationResult<Tutorial, Error, string> => {
  const { markTutorialComplete } = useTutorialsModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (id: string): Promise<Tutorial> => {
      const result = await markTutorialComplete.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (updated) => {
      success('Tutorial marked as complete!');
      queryClient.setQueryData(tutorialQueryKey(updated.id), updated);
      if (updated.slug && updated.slug !== updated.id) {
        queryClient.setQueryData(tutorialQueryKey(updated.slug), updated);
      }
      void queryClient.invalidateQueries({ queryKey: tutorialsQueryKey });
      void invalidateLearningCaches(queryClient, { includeCertificates: true });
    },
  });
};

export interface MarkVideoCompleteInput {
  readonly id: string;
  readonly mediaAssetId: string;
}

/** Mutation to mark an individual video complete; updates cached tutorial with new progress. */
export const useMarkVideoComplete = (): UseMutationResult<
  Tutorial,
  Error,
  MarkVideoCompleteInput
> => {
  const { markVideoComplete } = useTutorialsModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: async ({
      id,
      mediaAssetId,
    }: MarkVideoCompleteInput): Promise<Tutorial> => {
      const result = await markVideoComplete.execute(id, mediaAssetId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (updated) => {
      if (updated.isCompleted()) {
        success('Congratulations! Tutorial completed!');
      }
      queryClient.setQueryData(tutorialQueryKey(updated.id), updated);
      if (updated.slug && updated.slug !== updated.id) {
        queryClient.setQueryData(tutorialQueryKey(updated.slug), updated);
      }
      void queryClient.invalidateQueries({ queryKey: tutorialsQueryKey });
      void invalidateLearningCaches(queryClient, {
        includeCertificates: updated.isCompleted(),
      });
    },
  });
};

/** Mutation to delete a tutorial; refreshes the library on success. */
export const useDeleteTutorial = (): UseMutationResult<void, Error, string> => {
  const { deleteTutorial } = useTutorialsModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteTutorial.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
    },
    onSuccess: () => {
      success('Tutorial deleted.');
      void queryClient.invalidateQueries({ queryKey: tutorialsQueryKey });
    },
  });
};

export interface MarkTutorialHelpfulContext {
  readonly previousList?: readonly Tutorial[] | undefined;
  readonly previousTutorial?: Tutorial | undefined;
}

const withToggledHelpful = (tutorial: Tutorial): Tutorial => {
  const nextHelpful = !tutorial.isHelpful;
  const nextCount = nextHelpful
    ? tutorial.helpfulCount + 1
    : Math.max(0, tutorial.helpfulCount - 1);
  return tutorial.withHelpfulVote(nextCount, nextHelpful);
};

/** Mutation to toggle or register a helpful vote on a tutorial; refreshes the library on success. */
export const useMarkTutorialHelpful = (): UseMutationResult<
  Tutorial,
  Error,
  string,
  MarkTutorialHelpfulContext
> => {
  const { markTutorialHelpful } = useTutorialsModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Tutorial> => {
      const result = await markTutorialHelpful.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onMutate: async (id: string): Promise<MarkTutorialHelpfulContext> => {
      await queryClient.cancelQueries({ queryKey: tutorialsQueryKey });
      await queryClient.cancelQueries({ queryKey: tutorialQueryKey(id) });
      const previousList =
        queryClient.getQueryData<readonly Tutorial[]>(tutorialsQueryKey);
      const previousTutorial = queryClient.getQueryData<Tutorial>(tutorialQueryKey(id));

      if (previousList) {
        queryClient.setQueryData<readonly Tutorial[]>(tutorialsQueryKey, (old) => {
          if (!old) return old;
          return old.map((t) => (t.id === id ? withToggledHelpful(t) : t));
        });
      }
      if (previousTutorial) {
        queryClient.setQueryData(
          tutorialQueryKey(id),
          withToggledHelpful(previousTutorial),
        );
      }

      return { previousList, previousTutorial };
    },
    onError: (_err, id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(tutorialsQueryKey, context.previousList);
      }
      if (context?.previousTutorial) {
        queryClient.setQueryData(tutorialQueryKey(id), context.previousTutorial);
      }
    },
    onSuccess: (updated: Tutorial) => {
      queryClient.setQueryData<readonly Tutorial[]>(tutorialsQueryKey, (old) => {
        if (!old) return old;
        return old.map((t) => (t.id === updated.id ? updated : t));
      });
      queryClient.setQueryData(tutorialQueryKey(updated.id), updated);
    },
    onSettled: (_data, _error, id) => {
      void queryClient.invalidateQueries({ queryKey: tutorialsQueryKey });
      void queryClient.invalidateQueries({ queryKey: tutorialQueryKey(id) });
    },
  });
};

/** Fetches difficulty enum options dynamically from the backend introspection endpoint (uncached). */
export const useDifficultyOptions = (enabled = true): readonly string[] => {
  const { getEnum } = useTutorialsModule();
  const query = useQuery({
    queryKey: ['enums', 'ContentDifficulty'] as const,
    queryFn: async (): Promise<readonly string[]> => {
      const result = await getEnum('ContentDifficulty');
      if (isErr(result)) {
        throw result.error;
      }
      return result.value.map((item) => item.description || item.name);
    },
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
  return query.data && query.data.length > 0 ? query.data : DIFFICULTIES;
};
