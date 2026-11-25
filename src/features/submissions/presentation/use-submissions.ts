import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@shared/ui';
import { isErr } from '@core/result';
import { contentKeys } from '@features/content';
import type { Submission, SubmissionQueryParams } from '../domain';
import type { SubmitContentInput } from '../application';
import { useSubmissionsModule } from './use-submissions-module';

/** The search/type/status/category/sorting filters the submissions filter box drives. */
export type SubmissionFilterParams = Omit<
  SubmissionQueryParams,
  'skipCount' | 'maxResultCount'
>;

/** Root key for every submissions query; mutations invalidate this prefix (covers "mine" too). */
export const submissionsQueryKey = ['submissions'] as const;
export const mySubmissionsQueryKey = (
  submittedBy: string,
  params?: SubmissionFilterParams,
): readonly unknown[] => ['submissions', 'mine', submittedBy, params ?? null];

/** Full queue (reviewer view). */
export const useSubmissions = (options?: {
  readonly enabled?: boolean;
}): UseQueryResult<readonly Submission[]> => {
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
    enabled: options?.enabled ?? true,
  });
};

/**
 * The current user's own submissions, filtered by the shared search/type/status/category/sorting
 * box. The Content API has no server-side "owner" filter, so the use case applies the filters
 * server-side and enforces the owner scope afterwards — never leaking another author's documents.
 */
export const useMySubmissions = (
  submittedBy: string,
  params?: SubmissionFilterParams,
  options?: { readonly enabled?: boolean },
): UseQueryResult<readonly Submission[]> => {
  const { listMySubmissions } = useSubmissionsModule();
  return useQuery({
    queryKey: mySubmissionsQueryKey(submittedBy, params),
    queryFn: async (): Promise<readonly Submission[]> => {
      const result = await listMySubmissions.execute(submittedBy, params);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    enabled: options?.enabled ?? true,
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
    void queryClient.invalidateQueries({ queryKey: contentKeys.all });
  };
};

export const useSubmitContent = (): UseMutationResult<
  Submission,
  Error,
  SubmitContentInput
> => {
  const { submitContent } = useSubmissionsModule();
  const invalidate = useInvalidateSubmissions();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (input: SubmitContentInput): Promise<Submission> => {
      const result = await submitContent.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      success('Document submitted.');
      invalidate();
    },
  });
};

export const useApproveSubmission = (): UseMutationResult<
  Submission,
  Error,
  ApproveInput
> => {
  const { approveSubmission } = useSubmissionsModule();
  const invalidate = useInvalidateSubmissions();
  const { success } = useToast();
  return useMutation({
    mutationFn: async ({ id, note }: ApproveInput): Promise<Submission> => {
      const result = await approveSubmission.execute(id, note);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      success('Submission approved.');
      invalidate();
    },
  });
};

export const useRejectSubmission = (): UseMutationResult<
  Submission,
  Error,
  RejectInput
> => {
  const { rejectSubmission } = useSubmissionsModule();
  const invalidate = useInvalidateSubmissions();
  const { success } = useToast();
  return useMutation({
    mutationFn: async ({ id, reason }: RejectInput): Promise<Submission> => {
      const result = await rejectSubmission.execute(id, reason);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      success('Submission rejected.');
      invalidate();
    },
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
  const { success } = useToast();
  return useMutation({
    mutationFn: async (id: string): Promise<Submission> => {
      const result = await publishSubmission.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      success('Submission published.');
      invalidate();
    },
  });
};
