import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { Submission } from '../domain';
import type { SubmitContentInput } from '../application';
import { useSubmissionsModule } from './use-submissions-module';

/** Root key for every submissions query; mutations invalidate this prefix (covers "mine" too). */
export const submissionsQueryKey = ['submissions'] as const;
export const mySubmissionsQueryKey = (submittedBy: string): readonly string[] => [
  'submissions',
  'mine',
  submittedBy,
];

/** Full queue (reviewer view). */
export const useSubmissions = (): UseQueryResult<readonly Submission[]> => {
  const { listSubmissions } = useSubmissionsModule();
  return useQuery({
    queryKey: submissionsQueryKey,
    queryFn: async (): Promise<readonly Submission[]> => {
      const result = await listSubmissions.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

/** The current user's own submissions. */
export const useMySubmissions = (
  submittedBy: string,
): UseQueryResult<readonly Submission[]> => {
  const { listMySubmissions } = useSubmissionsModule();
  return useQuery({
    queryKey: mySubmissionsQueryKey(submittedBy),
    queryFn: async (): Promise<readonly Submission[]> => {
      const result = await listMySubmissions.execute(submittedBy);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export interface ApproveInput {
  readonly id: string;
  readonly note?: string;
}
export interface RejectInput {
  readonly id: string;
  readonly reason: string;
}

const useInvalidateSubmissions = (): (() => void) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: submissionsQueryKey });
  };
};

export const useSubmitContent = (): UseMutationResult<
  Submission,
  Error,
  SubmitContentInput
> => {
  const { submitContent } = useSubmissionsModule();
  const invalidate = useInvalidateSubmissions();
  return useMutation({
    mutationFn: async (input: SubmitContentInput): Promise<Submission> => {
      const result = await submitContent.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

export const useApproveSubmission = (): UseMutationResult<
  Submission,
  Error,
  ApproveInput
> => {
  const { approveSubmission } = useSubmissionsModule();
  const invalidate = useInvalidateSubmissions();
  return useMutation({
    mutationFn: async ({ id, note }: ApproveInput): Promise<Submission> => {
      const result = await approveSubmission.execute(id, note);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

export const useRejectSubmission = (): UseMutationResult<
  Submission,
  Error,
  RejectInput
> => {
  const { rejectSubmission } = useSubmissionsModule();
  const invalidate = useInvalidateSubmissions();
  return useMutation({
    mutationFn: async ({ id, reason }: RejectInput): Promise<Submission> => {
      const result = await rejectSubmission.execute(id, reason);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

export const useFlagSubmission = (): UseMutationResult<Submission, Error, string> => {
  const { flagSubmission } = useSubmissionsModule();
  const invalidate = useInvalidateSubmissions();
  return useMutation({
    mutationFn: async (id: string): Promise<Submission> => {
      const result = await flagSubmission.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

export const usePublishSubmission = (): UseMutationResult<Submission, Error, string> => {
  const { publishSubmission } = useSubmissionsModule();
  const invalidate = useInvalidateSubmissions();
  return useMutation({
    mutationFn: async (id: string): Promise<Submission> => {
      const result = await publishSubmission.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};
