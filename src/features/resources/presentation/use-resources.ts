import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@shared/ui';
import { isErr } from '@core/result';
import type { Resource } from '../domain';
import type { UpdateResourceInput } from '../application';
import { useResourcesModule } from './use-resources-module';

/** Stable query key for the knowledge base. Mutations invalidate this to refetch. */
export const resourcesQueryKey = ['resources'] as const;

/** List query. Unwraps the domain `Result`, throwing the `AppError` so Query surfaces it. */
export const useResources = (): UseQueryResult<readonly Resource[]> => {
  const { listResources } = useResourcesModule();

  return useQuery({
    queryKey: resourcesQueryKey,
    queryFn: async (): Promise<readonly Resource[]> => {
      const result = await listResources.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export interface MarkResourceHelpfulInput {
  readonly id: string;
}

/** Mutation to register a helpful vote; refreshes the knowledge base on success. */
export const useMarkResourceHelpful = (): UseMutationResult<
  Resource,
  Error,
  MarkResourceHelpfulInput
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resourcesQueryKey });
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
    onSuccess: () => {
      success('Resource updated.');
      void queryClient.invalidateQueries({ queryKey: resourcesQueryKey });
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
    },
  });
};
