import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { Assignment } from '../domain';
import type { CreateAssignmentInput } from '../application';
import { useAssignmentsModule } from './use-assignments-module';

/** Stable query key for the assignment list. Mutations invalidate this to refetch. */
export const assignmentsQueryKey = ['assignments'] as const;

/** List query. Unwraps the domain `Result`, throwing the `AppError` so Query surfaces it. */
export const useAssignments = (): UseQueryResult<readonly Assignment[]> => {
  const { listAssignments } = useAssignmentsModule();
  return useQuery({
    queryKey: assignmentsQueryKey,
    queryFn: async (): Promise<readonly Assignment[]> => {
      const result = await listAssignments.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

const useInvalidateAssignments = (): (() => void) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: assignmentsQueryKey });
  };
};

/** Mutation to create an assignment; refreshes the list on success. */
export const useCreateAssignment = (): UseMutationResult<
  Assignment,
  Error,
  CreateAssignmentInput
> => {
  const { createAssignment } = useAssignmentsModule();
  const invalidate = useInvalidateAssignments();
  return useMutation({
    mutationFn: async (input: CreateAssignmentInput): Promise<Assignment> => {
      const result = await createAssignment.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

/** Mutation to delete an assignment by id; refreshes the list on success. */
export const useDeleteAssignment = (): UseMutationResult<void, Error, string> => {
  const { deleteAssignment } = useAssignmentsModule();
  const invalidate = useInvalidateAssignments();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteAssignment.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
    },
    onSuccess: invalidate,
  });
};
