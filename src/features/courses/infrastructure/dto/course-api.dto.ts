import { z } from 'zod';

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  durationSeconds: z.number().optional().default(0),
  kind: z.number().optional().default(0),
  displayOrder: z.number().optional().default(0),
  mediaAssetId: z.string().nullable().optional(),
  quizId: z.string().nullable().optional(),
  externalUrl: z.string().nullable().optional(),
  isCompleted: z.boolean().optional().default(false),
  isPreview: z.boolean().optional().default(false),
});

export const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  displayOrder: z.number().optional().default(0),
  lessons: z.array(LessonSchema).optional().default([]),
});

export const EnrollmentLessonProgressSchema = z.object({
  curriculumLessonId: z.string(),
  lessonTitle: z.string().optional(),
  isCompleted: z.boolean().optional(),
  completedAt: z.string().nullable().optional(),
});

export const IntroMediaSchema = z.object({
  url: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  durationSeconds: z.number().optional().default(0),
});

export const EnrollmentSchema = z.object({
  id: z.string(),
  status: z.number().optional().default(0),
  statusName: z.string().optional().default(''),
  progress: z.array(EnrollmentLessonProgressSchema).optional().default([]),
});

export const CourseRowSchema = z.object({
  id: z.string(),
  slug: z.string().optional().default(''),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  durationSeconds: z.number().optional().default(0),
  isEnrolled: z.boolean().optional().default(false),
  isCompleted: z.boolean().optional().default(false),
  completedAt: z.string().nullable().optional(),
  certificateId: z.string().nullable().optional(),
  certificateUrl: z.string().nullable().optional(),
  enrollmentCount: z.number().optional().default(0),
  thumbnailUrl: z.string().nullable().optional(),
  introMedia: IntroMediaSchema.nullable().optional(),
  sections: z.array(SectionSchema).optional().default([]),
  enrollments: z.array(EnrollmentSchema).optional().default([]),
  media: z
    .array(z.lazy(() => MediaAssetDtoSchema))
    .optional()
    .default([]),
  creationTime: z.string().optional(),
  lastModificationTime: z.string().nullable().optional(),
  helpfulCount: z.number().optional().default(0),
  isHelpful: z.boolean().optional().default(false),
  averageRating: z.number().optional().default(0),
  rating: z.number().optional().default(0),
  totalReviews: z.number().optional().default(0),
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  difficulty: z.union([z.number(), z.string()]).nullable().optional(),
  difficultyName: z.string().nullable().optional(),
  mandatory: z.boolean().optional().default(false),
  isCourseCompleted: z.boolean().optional().default(false),
  progress: z.number().optional().default(0),
  totalLessons: z.number().optional().default(0),
  canModify: z.boolean().optional().default(false),
  // Additional fields returned by ContentListItemDto
});

export type CourseRow = z.infer<typeof CourseRowSchema>;
export type EnrollmentRow = z.infer<typeof EnrollmentSchema>;
export type IntroMediaRow = z.infer<typeof IntroMediaSchema>;

export const MediaTicketDtoSchema = z.object({
  blobName: z.string(),
  uploadUrl: z.string().nullish(),
  method: z.string(),
  headers: z.record(z.string()),
});
export type MediaTicketDto = z.infer<typeof MediaTicketDtoSchema>;

export const MediaAssetDtoSchema = z.object({
  id: z.string(),
  slot: z.number().optional().default(0),
  kind: z.number().optional().default(0),
  originalFileName: z.string().optional().default(''),
  mimeType: z.string().nullable().optional(),
  sizeBytes: z.number().optional().default(0),
  url: z.string().nullable().optional(),
  referencedLessonId: z.string().nullable().optional(),
});
export type MediaAssetDto = z.infer<typeof MediaAssetDtoSchema>;
