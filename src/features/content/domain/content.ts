/* eslint-disable max-lines */
/**
 * Domain types for the Content module (courses / tutorials / resources). Enum values mirror the
 * backend's step-of-5 integers so the wire contract stays in one place.
 */

export const CONTENT_TYPE = { course: 0, tutorial: 5, resource: 10 } as const;
export const CONTENT_DIFFICULTY = { Beginner: 0, Intermediate: 5, Advanced: 10 } as const;
export const CONTENT_VISIBILITY = { public: 0, team: 5, private: 10 } as const;
export const MEDIA_SLOT = {
  thumbnail: 0,
  intro: 5,
  lesson: 10,
  attachment: 15,
  primary: 20,
  resourceFile: 25,
  courseAssignmentBrief: 30,
} as const;
export const MEDIA_KIND = { image: 0, video: 5, document: 10, link: 15 } as const;
export const LESSON_KIND = {
  video: 0,
  pdf: 5,
  quiz: 10,
  assignment: 15,
  link: 20,
} as const;
export const CONTENT_STATUS = {
  draft: 0,
  pendingReview: 5,
  inReview: 10,
  approved: 15,
  published: 20,
  rejected: 25,
} as const;

export interface ContentCategory {
  readonly id: string;
  readonly type: number;
  readonly name: string;
  readonly slug: string;
}

export interface MediaAsset {
  readonly id: string;
  readonly slot: number;
  readonly kind: number;
  readonly originalFileName: string;
  readonly title?: string | null | undefined;
  readonly streamStatus: number;
  readonly url: string | null;
  readonly sizeBytes?: number | undefined;
  readonly mimeType?: string | null | undefined;
  readonly referencedLessonId?: string | null | undefined;
  readonly displayOrder?: number | undefined;
  readonly durationSeconds?: number | undefined;
  readonly externalUrl?: string | null | undefined;
}

export interface ContentSummary {
  readonly id: string;
  readonly type: number;
  readonly title: string;
  readonly status: number;
  readonly difficulty: number;
  readonly visibility: number;
  readonly thumbnailUrl: string | null;
  readonly durationSeconds: number;
}

export interface ContentLessonAttachment {
  readonly id: string;
  readonly mediaAssetId: string;
  readonly role: number;
  readonly displayOrder: number;
  readonly originalFileName?: string | undefined;
  readonly title?: string | null | undefined;
  readonly mimeType?: string | null | undefined;
  readonly sizeBytes?: number | undefined;
  readonly url?: string | null | undefined;
  readonly streamStatus?: number | null | undefined;
}

export interface ContentLesson {
  readonly id: string;
  readonly title: string;
  readonly kind: number;
  readonly displayOrder: number;
  readonly mediaAssetId: string | null;
  readonly externalUrl: string | null;
  readonly quizId: string | null;
  readonly durationSeconds: number;
  readonly isPreview: boolean;
  readonly attachments?: readonly ContentLessonAttachment[];
}

export interface ContentSection {
  readonly id: string;
  readonly title: string;
  readonly displayOrder: number;
  readonly lessons: readonly ContentLesson[];
}

export interface ContentDetail extends ContentSummary {
  readonly slug: string;
  readonly branchIds: readonly string[];
  readonly teamIds: readonly string[] | null;
  readonly subtitle: string | null;
  readonly description: string | null;
  readonly categoryId: string | null;
  readonly topic: string | null;
  readonly language: string | null;
  readonly keywords: string | null;
  readonly thumbnailAlt: string | null;
  readonly thumbnailMediaAssetId?: string | null | undefined;
  readonly tags: readonly string[];
  readonly quizId?: string | null;
  readonly isQuizRequired?: boolean;
  readonly ownerId?: string | null;
  readonly ownerName?: string | null;
  readonly submittedById?: string | null;
  readonly submittedByName?: string | null;
  readonly submittedAt?: string | null;
  readonly reviewedById?: string | null;
  readonly reviewedByName?: string | null;
  readonly reviewNote?: string | null;
  readonly media: readonly MediaAsset[];
  readonly sections: readonly ContentSection[];
  readonly canModify?: boolean;
}

/** A short-lived direct-to-Azure-Blob upload ticket returned by the API. */
export interface MediaUploadTicket {
  readonly blobName: string;
  readonly uploadUrl: string | null;
  readonly readUrl: string | null;
  readonly method: string;
  readonly headers: Readonly<Record<string, string>>;
}

// ── Inputs ────────────────────────────────────────────────────────────────

export interface CreateContentInput {
  readonly type: number;
  readonly title: string;
  /** The branches to associate with this content; null/empty = default to author's accessible branches. */
  readonly branchIds: readonly string[] | null;
}

/** A branch the signed-in user is assigned to (for target branches picker). */
export interface BranchOption {
  readonly id: string;
  readonly name: string;
  readonly code?: string | undefined;
  readonly isPrimary?: boolean | undefined;
}

/** A team the signed-in user belongs to (for team-scoped visibility). */
export interface TeamOption {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null | undefined;
  readonly isActive?: boolean | undefined;
}

/** Audience group definition for granular branch-unique access rules. */
export interface AudienceGroupState {
  readonly id: string;
  readonly isAllBranches: boolean;
  readonly branchIds: readonly string[];
  readonly accessType: 'public' | 'teams';
  readonly teamIds: readonly string[];
}

/** User scope data containing accessible branches and teams. */
export interface UserScopeData {
  readonly branches: readonly BranchOption[];
  readonly teams: readonly TeamOption[];
}

export interface UpdateContentDetailsInput {
  readonly title: string;
  readonly subtitle: string | null;
  readonly description: string | null;
  readonly categoryId: string | null;
  readonly topic: string | null;
  readonly difficulty: number;
  readonly language: string | null;
  readonly durationSeconds: number;
  readonly visibility: number;
  readonly branchIds?: readonly string[] | null;
  readonly teamIds: readonly string[] | null;
  readonly keywords: string | null;
  readonly thumbnailMediaAssetId: string | null;
  readonly thumbnailAlt: string | null;
  readonly quizId?: string | null;
  readonly isQuizRequired?: boolean;
  readonly tags: readonly string[];
}

export interface AddMediaInput {
  readonly slot: number;
  readonly kind: number;
  readonly originalFileName: string;
  readonly title?: string | null | undefined;
  readonly mimeType: string | null;
  readonly sizeBytes: number;
  readonly azureBlobName: string | null;
  readonly externalUrl: string | null;
  readonly referencedLessonId?: string | null | undefined;
  readonly displayOrder?: number | null | undefined;
  readonly durationSeconds?: number | undefined;
}

export interface AddLessonInput {
  readonly title: string;
  readonly kind: number;
  readonly displayOrder?: number | null | undefined;
  readonly mediaAssetId: string | null;
  readonly externalUrl: string | null;
  readonly quizId?: string | null;
  readonly durationSeconds: number;
  readonly isPreview: boolean;
}

export interface MediaDraftInput {
  readonly id?: string | null;
  readonly azureBlobName: string;
  readonly originalFileName: string;
  readonly title?: string | null | undefined;
  readonly mimeType: string | null;
  readonly sizeBytes: number;
  readonly kind: number;
  readonly slot: number;
  readonly displayOrder?: number | undefined;
  readonly externalUrl?: string | null;
  readonly previewUrl?: string | null | undefined;
  readonly referencedLessonId?: string | null | undefined;
  readonly durationSeconds?: number | undefined;
}

export interface QuizOptionDraftInput {
  readonly id?: string | null | undefined;
  readonly text: string;
  readonly isCorrect: boolean;
}

export interface QuizQuestionDraftInput {
  readonly id?: string | null | undefined;
  readonly prompt: string;
  readonly displayOrder?: number | undefined;
  readonly options: readonly QuizOptionDraftInput[];
}

export interface QuizDraftInput {
  readonly id?: string | null | undefined;
  readonly title: string;
  readonly questions: readonly QuizQuestionDraftInput[];
  readonly isRequired?: boolean | undefined;
  readonly passingPercentage?: number | undefined;
  readonly isMultipleAttemptAllowed?: boolean | undefined;
  readonly upgradeQuiz?: boolean | undefined;
  readonly version?: number | undefined;
}

export interface UpdateCurriculumLessonInput {
  readonly id: string;
  readonly title: string;
  readonly kind: number;
  readonly displayOrder?: number | null | undefined;
  readonly mediaAssetId: string | null;
  readonly externalUrl: string | null;
  readonly quizId?: string | null;
  readonly durationSeconds: number;
  readonly isPreview: boolean;
  readonly media?: MediaDraftInput | null;
  readonly quiz?: QuizDraftInput | null;
  readonly assignmentFiles?: readonly MediaDraftInput[] | null;
}

export interface UpdateCurriculumSectionInput {
  readonly id: string;
  readonly title: string;
  readonly displayOrder?: number | null | undefined;
  readonly lessons: readonly UpdateCurriculumLessonInput[];
}

export interface UpdateCurriculumInput {
  readonly sections: readonly UpdateCurriculumSectionInput[];
}

/** Create/rename a category. `type` is fixed on create and ignored by the server on update. */
export interface CategoryInput {
  readonly type: number;
  readonly name: string;
}

export interface ContentDraftStateInput {
  readonly details: UpdateContentDetailsInput;
  readonly curriculum?: UpdateCurriculumInput | undefined;
  readonly media?: readonly MediaDraftInput[] | undefined;
  readonly quiz?: QuizDraftInput | null | undefined;
  readonly tags: readonly string[];
}

export const getContentTypeKey = (type: number): 'course' | 'tutorial' | 'resource' => {
  if (type === CONTENT_TYPE.tutorial) return 'tutorial';
  if (type === CONTENT_TYPE.resource) return 'resource';
  return 'course';
};

export interface ContentRevision {
  readonly id: string;
  readonly contentItemId: string;
  readonly authorId: string;
  readonly authorName?: string | null;
  readonly status: number;
  readonly payloadJson: string;
  readonly reviewerNotes: string | null;
  readonly creationTime: string;
  readonly lastModificationTime: string | null;
}

export interface ContentListParams {
  readonly status?: number | undefined;
  readonly type?: number | undefined;
  readonly filter?: string | undefined;
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
}

export interface ContentListPage {
  readonly items: readonly ContentSummary[];
  readonly totalCount: number;
}

export interface ReviewQueueParams {
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
  readonly filter?: string | undefined;
  readonly type?: number | undefined;
  readonly status?: number | undefined;
  readonly sorting?: string | undefined;
}

export interface RevisionStatusCounts {
  readonly pending: number;
  readonly inReview: number;
  readonly approved: number;
  readonly rejected: number;
}

export type { ContentGateway } from './content-gateway';
