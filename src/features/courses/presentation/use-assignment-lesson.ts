import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { CourseMediaAsset, LessonSubmissionDto } from '../domain';
import { useCoursesModule } from './use-courses-module';

export const assignmentBriefsQueryKey = (
  courseId: string,
  lessonId: string,
): readonly string[] => ['course', courseId, 'lessons', lessonId, 'briefs'];

export const lessonSubmissionQueryKey = (
  courseId: string,
  lessonId: string,
): readonly string[] => ['course', courseId, 'lessons', lessonId, 'submission'];

/** Fetch all brief files attached to an assignment lesson. */
export const useAssignmentBriefs = (
  courseId: string | undefined,
  lessonId: string | undefined,
  options?: { readonly enabled?: boolean },
): UseQueryResult<readonly CourseMediaAsset[]> => {
  const { courseGateway } = useCoursesModule();

  return useQuery({
    queryKey: assignmentBriefsQueryKey(courseId ?? '', lessonId ?? ''),
    enabled: Boolean(courseId && lessonId && (options?.enabled ?? true)),
    queryFn: async (): Promise<readonly CourseMediaAsset[]> => {
      if (!courseId || !lessonId) return [];
      const result = await courseGateway.getBriefFiles(courseId, lessonId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

/** Author: direct upload brief file handshake (ticket -> Azure Blob PUT -> confirm). */
export const useUploadBriefFile = (
  courseId: string,
  lessonId: string,
): UseMutationResult<void, Error, File> => {
  const queryClient = useQueryClient();
  const { courseGateway } = useCoursesModule();

  return useMutation({
    mutationFn: async (file: File): Promise<void> => {
      const ticketRes = await courseGateway.requestBriefUpload(courseId, lessonId, {
        fileName: file.name,
        mimeType: file.type || null,
      });
      if (isErr(ticketRes)) throw ticketRes.error;
      const ticket = ticketRes.value;

      const uploadRes = await courseGateway.uploadLessonMediaBlob(ticket, file);
      if (isErr(uploadRes)) throw uploadRes.error;

      const confirmRes = await courseGateway.confirmBriefFile(courseId, lessonId, {
        blobName: ticket.blobName,
        originalFileName: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
        lessonId,
      });
      if (isErr(confirmRes)) throw confirmRes.error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: assignmentBriefsQueryKey(courseId, lessonId),
      });
      void queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

/** Author: remove a brief file and delete its blob from storage. */
export const useRemoveBriefFile = (
  courseId: string,
  lessonId: string,
): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  const { courseGateway } = useCoursesModule();

  return useMutation({
    mutationFn: async (mediaAssetId: string): Promise<void> => {
      const res = await courseGateway.removeBriefFile(courseId, lessonId, mediaAssetId);
      if (isErr(res)) throw res.error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: assignmentBriefsQueryKey(courseId, lessonId),
      });
      void queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

/** Learner: fetch learner's submission for an assignment lesson (creates a Draft if none exists). */
export const useLessonSubmission = (
  courseId: string | undefined,
  lessonId: string | undefined,
  options?: { readonly enabled?: boolean },
): UseQueryResult<LessonSubmissionDto> => {
  const { courseGateway } = useCoursesModule();

  return useQuery({
    queryKey: lessonSubmissionQueryKey(courseId ?? '', lessonId ?? ''),
    enabled: Boolean(courseId && lessonId && (options?.enabled ?? true)),
    queryFn: async (): Promise<LessonSubmissionDto> => {
      if (!courseId || !lessonId) throw new Error('Course and lesson ID required');
      const result = await courseGateway.getOrCreateSubmission(courseId, lessonId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

/** Learner: upload a submission file handshake (ticket -> Azure Blob PUT -> confirm). */
export const useUploadSubmissionFile = (
  courseId: string,
  lessonId: string,
): UseMutationResult<LessonSubmissionDto, Error, File> => {
  const queryClient = useQueryClient();
  const { courseGateway } = useCoursesModule();

  return useMutation({
    mutationFn: async (file: File): Promise<LessonSubmissionDto> => {
      const ticketRes = await courseGateway.requestSubmissionFileUpload(
        courseId,
        lessonId,
        {
          fileName: file.name,
          mimeType: file.type || null,
        },
      );
      if (isErr(ticketRes)) throw ticketRes.error;
      const ticket = ticketRes.value;

      const uploadRes = await courseGateway.uploadLessonMediaBlob(ticket, file);
      if (isErr(uploadRes)) throw uploadRes.error;

      const confirmRes = await courseGateway.confirmSubmissionFile(courseId, lessonId, {
        blobName: ticket.blobName,
        originalFileName: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
      });
      if (isErr(confirmRes)) throw confirmRes.error;
      return confirmRes.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: lessonSubmissionQueryKey(courseId, lessonId),
      });
    },
  });
};

/** Learner: remove a submission file (only permitted while Draft). */
export const useRemoveSubmissionFile = (
  courseId: string,
  lessonId: string,
): UseMutationResult<LessonSubmissionDto, Error, string> => {
  const queryClient = useQueryClient();
  const { courseGateway } = useCoursesModule();

  return useMutation({
    mutationFn: async (submissionFileId: string): Promise<LessonSubmissionDto> => {
      const res = await courseGateway.removeSubmissionFile(
        courseId,
        lessonId,
        submissionFileId,
      );
      if (isErr(res)) throw res.error;
      return res.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: lessonSubmissionQueryKey(courseId, lessonId),
      });
    },
  });
};

/** Learner: finalize submission and mark lesson complete in enrollment. */
export const useSubmitAndCompleteAssignment = (
  courseId: string,
  lessonId: string,
): UseMutationResult<LessonSubmissionDto, Error, void> => {
  const queryClient = useQueryClient();
  const { courseGateway } = useCoursesModule();

  return useMutation({
    mutationFn: async (): Promise<LessonSubmissionDto> => {
      const res = await courseGateway.submitAndComplete(courseId, lessonId);
      if (isErr(res)) throw res.error;
      return res.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: lessonSubmissionQueryKey(courseId, lessonId),
      });
      void queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
