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
  readonly streamStatus: number;
  readonly url: string | null;
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

export interface ContentDetail extends ContentSummary {
  readonly slug: string;
  readonly description: string | null;
  readonly tags: readonly string[];
  readonly media: readonly MediaAsset[];
}

/** A short-lived direct-to-Azure-Blob upload ticket returned by the API. */
export interface MediaUploadTicket {
  readonly blobName: string;
  readonly uploadUrl: string | null;
  readonly method: string;
  readonly headers: Readonly<Record<string, string>>;
}

// ── Inputs ────────────────────────────────────────────────────────────────

export interface CreateContentInput {
  readonly type: number;
  readonly title: string;
  /** When true, restrict to a branch (branchId, or the author's single branch); false = all branches. */
  readonly restrictToBranch: boolean;
  /** The branch to restrict to (multi-branch authors); null = let the backend resolve/none. */
  readonly branchId: string | null;
}

/** A branch the signed-in user is assigned to (for the upload branch picker). */
export interface BranchOption {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly isPrimary: boolean;
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
  readonly keywords: string | null;
  readonly thumbnailMediaAssetId: string | null;
  readonly thumbnailAlt: string | null;
  readonly tags: readonly string[];
}

export interface AddMediaInput {
  readonly slot: number;
  readonly kind: number;
  readonly originalFileName: string;
  readonly mimeType: string | null;
  readonly sizeBytes: number;
  readonly azureBlobName: string | null;
  readonly externalUrl: string | null;
}

export interface AddLessonInput {
  readonly title: string;
  readonly kind: number;
  readonly mediaAssetId: string | null;
  readonly externalUrl: string | null;
  readonly durationSeconds: number;
  readonly isPreview: boolean;
}

/** Create/rename a category. `type` is fixed on create and ignored by the server on update. */
export interface CategoryInput {
  readonly type: number;
  readonly name: string;
}

/** The transport port. Implementations throw on transport error (hooks surface it via TanStack Query). */
export interface ContentGateway {
  list(params: { status?: number; type?: number }): Promise<readonly ContentSummary[]>;
  get(id: string): Promise<ContentDetail>;
  myBranches(): Promise<readonly BranchOption[]>;
  categories(type: number): Promise<readonly ContentCategory[]>;
  createCategory(input: CategoryInput): Promise<ContentCategory>;
  updateCategory(id: string, input: CategoryInput): Promise<ContentCategory>;
  deleteCategory(id: string): Promise<void>;
  create(input: CreateContentInput): Promise<ContentDetail>;
  updateDetails(id: string, input: UpdateContentDetailsInput): Promise<ContentDetail>;
  requestUpload(
    id: string,
    fileName: string,
    mimeType: string | null,
  ): Promise<MediaUploadTicket>;
  uploadToBlob(ticket: MediaUploadTicket, file: File): Promise<void>;
  addMedia(id: string, input: AddMediaInput): Promise<MediaAsset>;
  addSection(id: string, title: string): Promise<{ readonly id: string }>;
  addLesson(
    id: string,
    sectionId: string,
    input: AddLessonInput,
  ): Promise<{ readonly id: string }>;
  submit(id: string): Promise<ContentDetail>;
  remove(id: string): Promise<void>;
}
