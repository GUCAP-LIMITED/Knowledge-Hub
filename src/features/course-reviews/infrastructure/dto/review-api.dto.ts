import { z } from 'zod';

export const ratingBreakdownDtoSchema = z.object({
  fiveStars: z.number().default(0),
  fourStars: z.number().default(0),
  threeStars: z.number().default(0),
  twoStars: z.number().default(0),
  oneStar: z.number().default(0),
});

export type RatingBreakdownDto = z.infer<typeof ratingBreakdownDtoSchema>;

export const topRatedCourseDtoSchema = z.object({
  courseId: z.string(),
  title: z.string(),
  slug: z.string(),
  averageRating: z.number(),
  totalReviews: z.number(),
  totalHelpfulVotes: z.number().optional().default(0),
  helpfulVotes: z.number().optional().default(0),
  thumbnailUrl: z.string().nullable().optional().default(null),
});

export type TopRatedCourseDto = z.infer<typeof topRatedCourseDtoSchema>;

export const courseReviewStatisticsDtoSchema = z.object({
  totalReviews: z.number(),
  averageRating: z.number(),
  totalRatedCourses: z.number(),
  totalHelpfulVotes: z.number().optional().default(0),
  helpfulVotes: z.number().optional().default(0),
  ratingBreakdown: ratingBreakdownDtoSchema,
  topRatedCourses: z.array(topRatedCourseDtoSchema).default([]),
});

export type CourseReviewStatisticsDto = z.infer<typeof courseReviewStatisticsDtoSchema>;

export const recentReviewDtoSchema = z.object({
  id: z.string(),
  contentItemId: z.string(),
  courseTitle: z.string(),
  courseSlug: z.string(),
  courseThumbnailUrl: z.string().nullable().optional().default(null),
  userId: z.string(),
  reviewerName: z.string(),
  reviewerEmail: z.string().nullable().optional().default(null),
  rating: z.number(),
  feedback: z.string().nullable().optional().default(''),
  helpfulCount: z.number().default(0),
  isHelpful: z.boolean().optional().default(false),
  creationTime: z.string(),
});

export type RecentReviewDto = z.infer<typeof recentReviewDtoSchema>;

export const pagedRecentReviewsDtoSchema = z.object({
  totalCount: z.number(),
  items: z.array(recentReviewDtoSchema),
});

export type PagedRecentReviewsDto = z.infer<typeof pagedRecentReviewsDtoSchema>;

export const reviewDtoSchema = z.object({
  id: z.string(),
  contentItemId: z.string(),
  contentTitle: z.string().nullable().optional().default(null),
  contentType: z.number().nullable().optional().default(null),
  contentTypeName: z.string().nullable().optional().default(null),
  type: z.number().nullable().optional().default(null),
  userId: z.string(),
  userName: z.string().nullable().optional().default(null),
  rating: z.number(),
  feedback: z.string().nullable().optional().default(''),
  helpfulCount: z.number().default(0),
  isHelpful: z.boolean().optional().default(false),
  creationTime: z.string(),
});

export type ReviewDto = z.infer<typeof reviewDtoSchema>;

export const pagedReviewsDtoSchema = z.object({
  totalCount: z.number(),
  items: z.array(reviewDtoSchema),
});

export type PagedReviewsDto = z.infer<typeof pagedReviewsDtoSchema>;

export const selectableContentItemDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string().nullable().optional(),
  type: z.number(),
  typeName: z.string().optional().default('Content'),
});

export type SelectableContentItemDto = z.infer<typeof selectableContentItemDtoSchema>;

export const pagedSelectableContentDtoSchema = z.object({
  totalCount: z.number(),
  items: z.array(selectableContentItemDtoSchema),
});

export type PagedSelectableContentDto = z.infer<typeof pagedSelectableContentDtoSchema>;
