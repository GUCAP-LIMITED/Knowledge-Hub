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
import type {
  Resource,
  ResourceCatalogParams,
  PagedResult,
  ResourceStats,
} from '../domain';
import type { UpdateResourceInput } from '../application';
import { useResourcesModule } from './use-resources-module';

/** Stable query key for the knowledge base. Mutations invalidate this to refetch. */
export const resourcesQueryKey = ['resources'] as const;
export const resourceStatsQueryKey = ['resources', 'stats'] as const;
export const resourceQueryKey = (id: string) => ['resources', id] as const;

/** Aggregate statistics query (total count and per-category counts). */
export const useResourceStats = (): UseQueryResult<ResourceStats> => {
  const { getResourceStats } = useResourcesModule();

  return useQuery({
    queryKey: resourceStatsQueryKey,
    queryFn: async (): Promise<ResourceStats> => {
      const result = await getResourceStats.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    staleTime: 1000 * 60 * 5,
  });
};

/** List query. Unwraps the domain `Result`, returning items array for simple callers. */
export const useResources = (
  params?: ResourceCatalogParams,
): UseQueryResult<readonly Resource[]> => {
  const { listResources } = useResourcesModule();

  return useQuery({
    queryKey: ['resources', params] as const,
    queryFn: async (): Promise<readonly Resource[]> => {
      const result = await listResources.execute(params);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value.items;
    },
  });
};

/** Infinite list query for the paginated resources catalog. */
export const useInfiniteResources = (
  params: Omit<ResourceCatalogParams, 'skipCount'>,
): UseInfiniteQueryResult<InfiniteData<PagedResult<Resource>>> => {
  const { listResources } = useResourcesModule();

  return useInfiniteQuery({
    queryKey: ['resources', 'infinite', params] as const,
    queryFn: async ({ pageParam }): Promise<PagedResult<Resource>> => {
      const result = await listResources.execute({
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
      lastPage: PagedResult<Resource>,
      allPages: readonly PagedResult<Resource>[],
    ): number | undefined => {
      const loadedCount = allPages.reduce(
        (total: number, page: PagedResult<Resource>): number => total + page.items.length,
        0,
      );
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};

/** Single resource query by ID. Unwraps domain Result. */
export const useResource = (id: string): UseQueryResult<Resource> => {
  const { getResource } = useResourcesModule();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: resourceQueryKey(id),
    queryFn: async (): Promise<Resource> => {
      const result = await getResource.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      if (result.value.slug && result.value.slug !== id) {
        queryClient.setQueryData(resourceQueryKey(result.value.slug), result.value);
      }
      return result.value;
    },
    enabled: id.trim().length > 0,
  });
};

export interface MarkResourceHelpfulInput {
  readonly id: string;
}

export interface MarkResourceHelpfulContext {
  readonly previousResources?: readonly Resource[] | undefined;
  readonly previousResource?: Resource | undefined;
}

/** Mutation to register a helpful vote; refreshes the knowledge base on success. */
export const useMarkResourceHelpful = (): UseMutationResult<
  Resource,
  Error,
  MarkResourceHelpfulInput,
  MarkResourceHelpfulContext
> => {
  const { markResourceHelpful } = useResourcesModule();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: MarkResourceHelpfulInput): Promise<Resource> => {
      const result = await markResourceHelpful.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onMutate: async ({
      id,
    }: MarkResourceHelpfulInput): Promise<MarkResourceHelpfulContext> => {
      await queryClient.cancelQueries({ queryKey: resourcesQueryKey });
      await queryClient.cancelQueries({ queryKey: resourceQueryKey(id) });

      const previousResources =
        queryClient.getQueryData<readonly Resource[]>(resourcesQueryKey);
      const previousResource = queryClient.getQueryData<Resource>(resourceQueryKey(id));

      if (previousResource) {
        const nextHelpful = !previousResource.isHelpful;
        const nextCount = nextHelpful
          ? previousResource.helpful + 1
          : Math.max(0, previousResource.helpful - 1);
        queryClient.setQueryData(
          resourceQueryKey(id),
          previousResource.withHelpfulVote(nextCount, nextHelpful),
        );
      }

      if (previousResources) {
        queryClient.setQueryData<readonly Resource[]>(resourcesQueryKey, (old) => {
          if (!old) return old;
          return old.map((r) => {
            if (r.id !== id) return r;
            const nextHelpful = !r.isHelpful;
            const nextCount = nextHelpful ? r.helpful + 1 : Math.max(0, r.helpful - 1);
            return r.withHelpfulVote(nextCount, nextHelpful);
          });
        });
      }

      return { previousResources, previousResource };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousResources) {
        queryClient.setQueryData(resourcesQueryKey, context.previousResources);
      }
      if (context?.previousResource) {
        queryClient.setQueryData(resourceQueryKey(id), context.previousResource);
      }
    },
    onSuccess: (updated: Resource) => {
      queryClient.setQueryData(resourceQueryKey(updated.id), updated);
      queryClient.setQueryData<readonly Resource[]>(resourcesQueryKey, (old) => {
        if (!old) return old;
        return old.map((r) => (r.id === updated.id ? updated : r));
      });
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: resourcesQueryKey });
      void queryClient.invalidateQueries({ queryKey: resourceQueryKey(id) });
    },
  });
};

/** Mutation to mark a resource complete; refreshes the knowledge base on success. */
export const useMarkResourceComplete = (): UseMutationResult<Resource, Error, string> => {
  const { markResourceComplete } = useResourcesModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (id: string): Promise<Resource> => {
      const result = await markResourceComplete.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (updated) => {
      success('Resource marked as complete!');
      queryClient.setQueryData(resourceQueryKey(updated.id), updated);
      queryClient.setQueryData<readonly Resource[]>(resourcesQueryKey, (old) => {
        if (!old) return old;
        return old.map((r) => (r.id === updated.id ? updated : r));
      });
      void queryClient.invalidateQueries({ queryKey: resourcesQueryKey });
      void queryClient.invalidateQueries({ queryKey: resourceQueryKey(updated.id) });
      void invalidateLearningCaches(queryClient, { includeCertificates: true });
    },
  });
};

/** Mutation to edit a resource's title/category; refreshes the knowledge base on success. */
export const useUpdateResource = (): UseMutationResult<
  Resource,
  Error,
  UpdateResourceInput
> => {
  const { updateResource } = useResourcesModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (input: UpdateResourceInput): Promise<Resource> => {
      const result = await updateResource.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (updated) => {
      success('Resource updated.');
      queryClient.setQueryData(resourceQueryKey(updated.id), updated);
      queryClient.setQueryData<readonly Resource[]>(resourcesQueryKey, (old) => {
        if (!old) return old;
        return old.map((r) => (r.id === updated.id ? updated : r));
      });
      void queryClient.invalidateQueries({ queryKey: resourcesQueryKey });
      void queryClient.invalidateQueries({ queryKey: resourceStatsQueryKey });
      void queryClient.invalidateQueries({ queryKey: resourceQueryKey(updated.id) });
    },
  });
};

/** Mutation to delete a resource; refreshes the knowledge base on success. */
export const useDeleteResource = (): UseMutationResult<void, Error, string> => {
  const { deleteResource } = useResourcesModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteResource.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
    },
    onSuccess: () => {
      success('Resource deleted.');
      void queryClient.invalidateQueries({ queryKey: resourcesQueryKey });
      void queryClient.invalidateQueries({ queryKey: resourceStatsQueryKey });
    },
  });
};
