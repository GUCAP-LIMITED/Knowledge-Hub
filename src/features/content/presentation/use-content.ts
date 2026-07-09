import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { ContentItem } from '../domain';
import type { CreateContentInput } from '../application';
import { useContentModule } from './use-content-module';

/** Stable query key for the content library. Mutations invalidate this to refetch. */
export const contentQueryKey = ['content'] as const;

/** List query. Unwraps the domain `Result`, throwing the `AppError` so Query surfaces it. */
export const useContent = (): UseQueryResult<readonly ContentItem[]> => {
  const { listContent } = useContentModule();

  return useQuery({
    queryKey: contentQueryKey,
    queryFn: async (): Promise<readonly ContentItem[]> => {
      const result = await listContent.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

const useInvalidateContent = (): (() => void) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: contentQueryKey });
  };
};

/** Mutation to create a content item; refreshes the library on success. */
export const useCreateContent = (): UseMutationResult<
  ContentItem,
  Error,
  CreateContentInput
> => {
  const { createContent } = useContentModule();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (input: CreateContentInput): Promise<ContentItem> => {
      const result = await createContent.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

/** Mutation to publish a content item; refreshes the library on success. */
export const usePublishContent = (): UseMutationResult<ContentItem, Error, string> => {
  const { publishContent } = useContentModule();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (id: string): Promise<ContentItem> => {
      const result = await publishContent.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

/** Mutation to delete a content item; refreshes the library on success. */
export const useDeleteContent = (): UseMutationResult<void, Error, string> => {
  const { deleteContent } = useContentModule();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteContent.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
    },
    onSuccess: invalidate,
  });
};
