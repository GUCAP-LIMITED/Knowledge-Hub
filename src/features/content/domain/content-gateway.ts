import type {
  AddLessonInput,
  AddMediaInput,
  BranchOption,
  CategoryInput,
  ContentCategory,
  ContentDetail,
  ContentDraftStateInput,
  ContentListPage,
  ContentListParams,
  ContentRevision,
  CreateContentInput,
  MediaAsset,
  MediaUploadTicket,
  QuizDraftInput,
  ReviewQueueParams,
  RevisionStatusCounts,
  UpdateContentDetailsInput,
  UpdateCurriculumInput,
  UserScopeData,
} from './content';

/** The transport port. Implementations throw on transport error (hooks surface it via TanStack Query). */
export interface ContentGateway {
  list(params: ContentListParams): Promise<ContentListPage>;
  get(id: string): Promise<ContentDetail>;
  myBranches(): Promise<readonly BranchOption[]>;
  userScopeData(): Promise<UserScopeData>;
  categories(type: number): Promise<readonly ContentCategory[]>;
  createCategory(input: CategoryInput): Promise<ContentCategory>;
  updateCategory(id: string, input: CategoryInput): Promise<ContentCategory>;
  deleteCategory(id: string): Promise<void>;
  create(input: CreateContentInput): Promise<ContentDetail>;
  getRevision: (revisionId: string) => Promise<ContentRevision>;
  getActiveRevision: (id: string) => Promise<ContentRevision | null>;
  getReviewQueue: (params?: ReviewQueueParams) => Promise<{
    items: readonly ContentRevision[];
    totalCount: number;
  }>;
  getRevisionStatusCounts: (
    params: Pick<ReviewQueueParams, 'filter' | 'type'>,
  ) => Promise<RevisionStatusCounts>;
  saveRevision: (id: string, input: ContentDraftStateInput) => Promise<ContentRevision>;
  updateDetails(id: string, input: UpdateContentDetailsInput): Promise<ContentDetail>;
  requestUpload(
    id: string,
    fileName: string,
    mimeType: string | null,
  ): Promise<MediaUploadTicket>;
  getMediaReadSas(id: string, blobName: string): Promise<string | null>;
  /** `signal` aborts the in-flight transfer (used when the user cancels an upload job). */
  uploadToBlob(
    ticket: MediaUploadTicket,
    file: File,
    signal?: AbortSignal,
  ): Promise<void>;
  addMedia(id: string, input: AddMediaInput): Promise<MediaAsset>;
  addSection(
    id: string,
    title: string,
    displayOrder?: number | null,
  ): Promise<{ readonly id: string }>;
  addLesson(
    id: string,
    sectionId: string,
    input: AddLessonInput,
  ): Promise<{ readonly id: string }>;
  updateCurriculum(id: string, input: UpdateCurriculumInput): Promise<ContentDetail>;
  submit(id: string): Promise<ContentDetail>;
  remove(id: string): Promise<void>;
  createQuiz(input: unknown): Promise<{ readonly id: string }>;
  getQuiz(id: string, includeAnswers?: boolean): Promise<QuizDraftInput>;
  submitRevision(id: string): Promise<ContentRevision>;
  approveRevision(id: string, notes?: string): Promise<ContentRevision>;
  rejectRevision(id: string, reason: string): Promise<ContentRevision>;
}
