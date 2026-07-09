import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { Review } from '../domain';
import type { SubmitReviewInput } from '../application';
import { useCourseReviewsModule } from './use-course-reviews-module';

/** Root key for every reviews query; mutations invalidate this prefix. */
export const reviewsQueryKey = ['course-reviews'] as const;

/** Every review across courses. */
export const useAllReviews = (): UseQueryResult<readonly Review[]> => {
  const { listAllReviews } = useCourseReviewsModule();
  return useQuery({
    queryKey: reviewsQueryKey,
    queryFn: async (): Promise<readonly Review[]> => {
      const result = await listAllReviews.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export const courseReviewsQueryKey = (courseId: string): readonly string[] => [
  'course-reviews',
  'course',
  courseId,
];

/** Reviews for a single course. */
export const useCourseReviews = (courseId: string): UseQueryResult<readonly Review[]> => {
  const { listCourseReviews } = useCourseReviewsModule();
  return useQuery({
    queryKey: courseReviewsQueryKey(courseId),
    queryFn: async (): Promise<readonly Review[]> => {
      const result = await listCourseReviews.execute(courseId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

const useInvalidateReviews = (): (() => void) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: reviewsQueryKey });
  };
};

export const useSubmitReview = (): UseMutationResult<
  Review,
  Error,
  SubmitReviewInput
> => {
  const { submitReview } = useCourseReviewsModule();
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: async (input: SubmitReviewInput): Promise<Review> => {
      const result = await submitReview.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

export const useMarkReviewHelpful = (): UseMutationResult<Review, Error, string> => {
  const { markReviewHelpful } = useCourseReviewsModule();
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: async (id: string): Promise<Review> => {
      const result = await markReviewHelpful.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

export const useDeleteReview = (): UseMutationResult<void, Error, string> => {
  const { deleteReview } = useCourseReviewsModule();
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteReview.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
    },
    onSuccess: invalidate,
  });
};
