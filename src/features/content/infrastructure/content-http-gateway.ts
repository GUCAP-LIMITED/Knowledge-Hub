/* eslint-disable max-lines */
import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { z } from 'zod';
import type {
  AddLessonInput,
  AddMediaInput,
  BranchOption,
  CategoryInput,
  ContentCategory,
  ContentDetail,
  ContentDraftStateInput,
  ContentGateway,
  ContentLesson,
  ContentListParams,
  ContentListPage,
  ContentRevision,
  ContentSection,
  CreateContentInput,
  MediaAsset,
  MediaUploadTicket,
  QuizDraftInput,
  ReviewQueueParams,
  RevisionStatusCounts,
  UpdateContentDetailsInput,
  UpdateCurriculumInput,
  UserScopeData,
} from '../domain';

const BASE = '/api/app/content';
const CATEGORY_BASE = '/api/app/content-category';

const CategoryDtoSchema = z.object({
  id: z.string(),
  type: z.number(),
  name: z.string(),
  slug: z.string(),
});

const MediaDtoSchema = z.object({
  id: z.string(),
  slot: z.number().optional().default(0),
  kind: z.number().optional().default(0),
  originalFileName: z.string().nullish().default('Resource Document'),
  title: z.string().nullish(),
  streamStatus: z.number().optional().default(0),
  url: z.string().nullish(),
  sizeBytes: z.number().optional().default(0),
  mimeType: z.string().nullish(),
  referencedLessonId: z.string().nullish(),
  displayOrder: z.number().optional().default(0),
  durationSeconds: z.number().optional().default(0),
  externalUrl: z.string().nullish(),
});

const LessonAttachmentDtoSchema = z.object({
  id: z.string(),
  lessonId: z.string().nullish(),
  mediaAssetId: z.string(),
  role: z.union([z.number(), z.string()]),
  displayOrder: z.number().optional().default(0),
  originalFileName: z.string().nullish(),
  title: z.string().nullish(),
  mimeType: z.string().nullish(),
  sizeBytes: z.number().nullish(),
  url: z.string().nullish(),
  streamStatus: z.number().nullish(),
});

const LessonDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.number(),
  displayOrder: z.number().nullish().default(0),
  mediaAssetId: z.string().nullish(),
  externalUrl: z.string().nullish(),
  quizId: z.string().nullish(),
  durationSeconds: z.number(),
  isPreview: z.boolean(),
  attachments: z.array(LessonAttachmentDtoSchema).nullish(),
});

const SectionDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  displayOrder: z.number().nullish().default(0),
  lessons: z.array(LessonDtoSchema),
});

const DetailDtoSchema = z.object({
  id: z.string(),
  type: z.number(),
  title: z.string(),
  status: z.number(),
  difficulty: z.number(),
  visibility: z.number(),
  durationSeconds: z.number().nullish().default(0),
  slug: z.string(),
  branchIds: z.array(z.string()).optional().default([]),
  teamIds: z.array(z.string()).nullish(),
  subtitle: z.string().nullish(),
  description: z.string().nullish(),
  categoryId: z.string().nullish(),
  topic: z.string().nullish(),
  language: z.string().nullish(),
  keywords: z.string().nullish(),
  thumbnailAlt: z.string().nullish(),
  thumbnailMediaAssetId: z.string().nullish(),
  thumbnailUrl: z.string().nullish(),
  quizId: z.string().nullish(),
  isQuizRequired: z.boolean().nullish().default(false),
  ownerId: z.string().nullish(),
  ownerName: z.string().nullish(),
  submittedById: z.string().nullish(),
  submittedByName: z.string().nullish(),
  submittedAt: z.string().nullish(),
  reviewedById: z.string().nullish(),
  reviewedByName: z.string().nullish(),
  reviewNote: z.string().nullish(),
  tags: z.array(z.string()).optional().default([]),
  media: z.array(MediaDtoSchema).optional().default([]),
  sections: z.array(SectionDtoSchema).optional().default([]),
  canModify: z.boolean().optional().default(false),
});

const TicketDtoSchema = z.object({
  blobName: z.string(),
  uploadUrl: z.string().nullish(),
  readUrl: z.string().nullish(),
  method: z.string(),
  headers: z.record(z.string()),
});

const RevisionDtoSchema = z.object({
  id: z.string(),
  contentItemId: z.string(),
  authorId: z.string(),
  authorName: z.string().nullish(),
  status: z.number(),
  payloadJson: z.string(),
  reviewerNotes: z.string().nullish(),
  creationTime: z.string(),
  lastModificationTime: z.string().nullish(),
});

const QuizOptionDtoSchema = z.object({
  id: z.string().nullish(),
  text: z.string(),
  isCorrect: z.boolean().nullish().default(false),
});

const QuizQuestionDtoSchema = z.object({
  id: z.string().nullish(),
  prompt: z.string(),
  displayOrder: z.number().nullish(),
  options: z.array(QuizOptionDtoSchema).optional().default([]),
});

const QuizDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  passingPercentage: z.number().optional().default(80),
  isMultipleAttemptAllowed: z.boolean().optional().default(true),
  version: z.number().optional(),
  questions: z.array(QuizQuestionDtoSchema).optional().default([]),
});

const toMedia = (d: z.infer<typeof MediaDtoSchema>): MediaAsset => ({
  id: d.id,
  slot: d.slot,
  kind: d.kind,
  originalFileName: d.originalFileName ?? 'Resource Document',
  title: d.title ?? undefined,
  streamStatus: d.streamStatus,
  url: d.url ?? null,
  sizeBytes: d.sizeBytes,
  mimeType: d.mimeType ?? null,
  referencedLessonId: d.referencedLessonId ?? null,
  displayOrder: d.displayOrder,
  durationSeconds: d.durationSeconds,
  externalUrl: d.externalUrl ?? null,
});

interface DetailMeta {
  readonly thumbnailUrl: string | null;
  readonly teamIds: readonly string[] | null;
  readonly subtitle: string | null;
  readonly description: string | null;
  readonly categoryId: string | null;
  readonly topic: string | null;
  readonly language: string | null;
  readonly keywords: string | null;
  readonly thumbnailAlt: string | null;
  readonly thumbnailMediaAssetId: string | null;
  readonly quizId: string | null;
  readonly isQuizRequired: boolean;
}

interface SubmissionMeta {
  readonly ownerId: string | null;
  readonly ownerName: string | null;
  readonly submittedById: string | null;
  readonly submittedByName: string | null;
  readonly submittedAt: string | null;
  readonly reviewedById: string | null;
  readonly reviewedByName: string | null;
  readonly reviewNote: string | null;
}

const toLesson = (l: z.infer<typeof LessonDtoSchema>): ContentLesson => ({
  id: l.id,
  title: l.title,
  kind: l.kind,
  displayOrder: l.displayOrder ?? 0,
  mediaAssetId: l.mediaAssetId ?? null,
  externalUrl: l.externalUrl ?? null,
  quizId: l.quizId ?? null,
  durationSeconds: l.durationSeconds,
  isPreview: l.isPreview,
  attachments: (l.attachments ?? []).map((a) => ({
    id: a.id,
    mediaAssetId: a.mediaAssetId,
    role:
      typeof a.role === 'string'
        ? a.role.toLowerCase().includes('assignment')
          ? 10
          : 0
        : a.role,
    displayOrder: a.displayOrder,
    originalFileName: a.originalFileName ?? undefined,
    title: a.title ?? undefined,
    mimeType: a.mimeType ?? null,
    sizeBytes: a.sizeBytes ?? undefined,
    url: a.url ?? null,
    streamStatus: a.streamStatus ?? null,
  })),
});

const toSection = (s: z.infer<typeof SectionDtoSchema>): ContentSection => ({
  id: s.id,
  title: s.title,
  displayOrder: s.displayOrder ?? 0,
  lessons: s.lessons.map(toLesson),
});

const toThumbnailMeta = (
  d: z.infer<typeof DetailDtoSchema>,
): {
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  thumbnailMediaAssetId: string | null;
} => ({
  thumbnailUrl: d.thumbnailUrl ?? null,
  thumbnailAlt: d.thumbnailAlt ?? null,
  thumbnailMediaAssetId: d.thumbnailMediaAssetId ?? null,
});

const toDetailMeta = (d: z.infer<typeof DetailDtoSchema>): DetailMeta => ({
  ...toThumbnailMeta(d),
  teamIds: d.teamIds ?? null,
  subtitle: d.subtitle ?? null,
  description: d.description ?? null,
  categoryId: d.categoryId ?? null,
  topic: d.topic ?? null,
  language: d.language ?? null,
  keywords: d.keywords ?? null,
  quizId: d.quizId ?? null,
  isQuizRequired: d.isQuizRequired ?? false,
});

const toSubmissionMeta = (d: z.infer<typeof DetailDtoSchema>): SubmissionMeta => ({
  ownerId: d.ownerId ?? null,
  ownerName: d.ownerName ?? null,
  submittedById: d.submittedById ?? null,
  submittedByName: d.submittedByName ?? null,
  submittedAt: d.submittedAt ?? null,
  reviewedById: d.reviewedById ?? null,
  reviewedByName: d.reviewedByName ?? null,
  reviewNote: d.reviewNote ?? null,
});

const toDetail = (d: z.infer<typeof DetailDtoSchema>): ContentDetail => ({
  id: d.id,
  type: d.type,
  title: d.title,
  status: d.status,
  difficulty: d.difficulty,
  visibility: d.visibility,
  durationSeconds: d.durationSeconds ?? 0,
  slug: d.slug,
  branchIds: d.branchIds,
  tags: d.tags,
  ...toDetailMeta(d),
  ...toSubmissionMeta(d),
  media: d.media.map(toMedia),
  sections: d.sections.map(toSection),
  canModify: d.canModify,
});

const toRevision = (d: z.infer<typeof RevisionDtoSchema>): ContentRevision => ({
  id: d.id,
  contentItemId: d.contentItemId,
  authorId: d.authorId,
  authorName: d.authorName ?? null,
  status: d.status,
  payloadJson: d.payloadJson,
  reviewerNotes: d.reviewerNotes ?? null,
  creationTime: d.creationTime,
  lastModificationTime: d.lastModificationTime ?? null,
});

const buildReviewQueueQuery = (
  params?: ReviewQueueParams,
): Record<string, string | number | boolean> => {
  if (!params) {
    return {};
  }
  const query: Record<string, string | number | boolean> = {};
  if (params.skipCount !== undefined) {
    query.SkipCount = params.skipCount;
  }
  if (params.maxResultCount !== undefined) {
    query.MaxResultCount = params.maxResultCount;
  }
  if (params.filter) {
    query.Filter = params.filter;
  }
  if (params.type !== undefined) {
    query.Type = params.type;
  }
  if (params.status !== undefined) {
    query.Status = params.status;
  }
  if (params.sorting) {
    query.Sorting = params.sorting;
  }
  return query;
};

export interface ContentHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** HTTP implementation of {@link ContentGateway}. Methods throw a readable Error on failure. */
export class ContentHttpGateway implements ContentGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: ContentHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('content-gateway');
  }

  public async list(params: ContentListParams): Promise<ContentListPage> {
    return this.call(async () => {
      const queryParams: Record<string, string | number | undefined> = {};
      if (params.status !== undefined) queryParams.Status = params.status;
      if (params.type !== undefined) queryParams.Type = params.type;
      if (params.filter !== undefined && params.filter.trim() !== '') {
        queryParams.Filter = params.filter.trim();
      }
      if (params.skipCount !== undefined) queryParams.SkipCount = params.skipCount;
      if (params.maxResultCount !== undefined)
        queryParams.MaxResultCount = params.maxResultCount;

      const raw = await this.httpClient.get<
        { items?: unknown[]; totalCount?: number } | unknown[]
      >(BASE, {
        query: queryParams,
      });
      const itemsRaw = Array.isArray(raw) ? raw : (raw.items ?? []);
      const totalCount = Array.isArray(raw)
        ? itemsRaw.length
        : (raw.totalCount ?? itemsRaw.length);
      const items = z
        .array(
          DetailDtoSchema.partial().required({
            id: true,
            type: true,
            title: true,
            status: true,
          }),
        )
        .parse(itemsRaw)
        .map((d) => ({
          id: d.id,
          type: d.type,
          title: d.title,
          status: d.status,
          difficulty: d.difficulty ?? 0,
          visibility: d.visibility ?? 0,
          durationSeconds: d.durationSeconds ?? 0,
          thumbnailUrl: d.thumbnailUrl ?? null,
        }));
      return { items, totalCount };
    });
  }

  public async get(id: string): Promise<ContentDetail> {
    return this.call(async () =>
      toDetail(DetailDtoSchema.parse(await this.httpClient.get(`${BASE}/${id}`))),
    );
  }

  public async myBranches(): Promise<readonly BranchOption[]> {
    return this.call(async () => {
      const raw = await this.httpClient.get<{ items?: unknown[] }>('/api/app/branch/my');
      return z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            code: z.string().optional(),
            isPrimary: z.boolean().optional(),
          }),
        )
        .parse(raw.items ?? []);
    });
  }

  public async userScopeData(): Promise<UserScopeData> {
    return this.call(async () => {
      const raw = await this.httpClient.get<unknown>('/api/app/user/scope-data');
      const schema = z.object({
        branches: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            code: z.string().optional(),
            isPrimary: z.boolean().optional(),
          }),
        ),
        teams: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullish(),
            isActive: z.boolean().optional(),
          }),
        ),
      });
      const parsed = schema.parse(raw);
      return {
        branches: parsed.branches.map((b) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          isPrimary: b.isPrimary,
        })),
        teams: parsed.teams.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description ?? null,
          isActive: t.isActive,
        })),
      };
    });
  }

  public async categories(type: number): Promise<readonly ContentCategory[]> {
    return this.call(async () => {
      const raw = await this.httpClient.get<unknown[]>(`${CATEGORY_BASE}/selectable`, {
        query: { type },
      });
      return z.array(CategoryDtoSchema).parse(raw);
    });
  }

  public async createCategory(input: CategoryInput): Promise<ContentCategory> {
    return this.call(async () =>
      CategoryDtoSchema.parse(await this.httpClient.post(CATEGORY_BASE, input)),
    );
  }

  public async updateCategory(
    id: string,
    input: CategoryInput,
  ): Promise<ContentCategory> {
    return this.call(async () =>
      CategoryDtoSchema.parse(await this.httpClient.put(`${CATEGORY_BASE}/${id}`, input)),
    );
  }

  public async deleteCategory(id: string): Promise<void> {
    await this.call(async () => {
      await this.httpClient.delete(`${CATEGORY_BASE}/${id}`);
    });
  }

  public async create(input: CreateContentInput): Promise<ContentDetail> {
    return this.call(async () =>
      toDetail(DetailDtoSchema.parse(await this.httpClient.post(BASE, input))),
    );
  }

  public async updateDetails(
    id: string,
    input: UpdateContentDetailsInput,
  ): Promise<ContentDetail> {
    return this.call(async () =>
      toDetail(
        DetailDtoSchema.parse(await this.httpClient.put(`${BASE}/${id}/details`, input)),
      ),
    );
  }

  public async requestUpload(
    id: string,
    fileName: string,
    mimeType: string | null,
  ): Promise<MediaUploadTicket> {
    return this.call(async () => {
      const dto = TicketDtoSchema.parse(
        await this.httpClient.post(`${BASE}/${id}/request-media-upload`, {
          fileName,
          mimeType,
        }),
      );
      return {
        blobName: dto.blobName,
        uploadUrl: dto.uploadUrl ?? null,
        readUrl: dto.readUrl ?? null,
        method: dto.method,
        headers: dto.headers,
      };
    });
  }

  public async getMediaReadSas(id: string, blobName: string): Promise<string | null> {
    return this.call(async () => {
      const res = await this.httpClient.get<{ readUrl?: string | null }>(
        `${BASE}/${id}/media-read-sas-url`,
        {
          query: { blobName },
        },
      );
      return res.readUrl ?? null;
    });
  }

  public async uploadToBlob(
    ticket: MediaUploadTicket,
    file: File,
    signal?: AbortSignal,
  ): Promise<void> {
    if (ticket.uploadUrl === null) {
      // Blob storage not configured (dev) — skip the direct upload; the record still carries the blob name.
      this.logger.warn('Skipping blob upload — no upload URL (storage not configured)');
      return;
    }
    const response = await fetch(ticket.uploadUrl, {
      method: ticket.method,
      headers: {
        ...ticket.headers,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
      ...(signal !== undefined ? { signal } : {}),
    });
    if (!response.ok) {
      throw new Error(`Upload failed (${String(response.status)}).`);
    }
  }

  public async addMedia(id: string, input: AddMediaInput): Promise<MediaAsset> {
    return this.call(async () =>
      toMedia(
        MediaDtoSchema.parse(
          await this.httpClient.post(`${BASE}/${id}/media`, {
            ...input,
            durationSeconds: input.durationSeconds ?? 0,
          }),
        ),
      ),
    );
  }

  public async addSection(
    id: string,
    title: string,
    displayOrder?: number | null,
  ): Promise<{ readonly id: string }> {
    return this.call(async () => {
      const dto = z.object({ id: z.string() }).parse(
        await this.httpClient.post(`${BASE}/${id}/section`, {
          title,
          displayOrder,
        }),
      );
      return { id: dto.id };
    });
  }

  public async addLesson(
    id: string,
    sectionId: string,
    input: AddLessonInput,
  ): Promise<{ readonly id: string }> {
    return this.call(async () => {
      const dto = z
        .object({ id: z.string() })
        .parse(await this.httpClient.post(`${BASE}/${id}/lesson/${sectionId}`, input));
      return { id: dto.id };
    });
  }

  public async updateCurriculum(
    id: string,
    input: UpdateCurriculumInput,
  ): Promise<ContentDetail> {
    return this.call(async () =>
      toDetail(
        DetailDtoSchema.parse(
          await this.httpClient.put(`${BASE}/${id}/curriculum`, input),
        ),
      ),
    );
  }

  public async submit(id: string): Promise<ContentDetail> {
    return this.call(async () =>
      toDetail(DetailDtoSchema.parse(await this.httpClient.post(`${BASE}/${id}/submit`))),
    );
  }

  public async remove(id: string): Promise<void> {
    await this.call(async () => {
      await this.httpClient.delete(`${BASE}/${id}`);
    });
  }

  public async createQuiz(input: unknown): Promise<{ readonly id: string }> {
    return this.call(async () => {
      const dto = z
        .object({ id: z.string() })
        .parse(await this.httpClient.post(`/api/app/quizzes`, input));
      return { id: dto.id };
    });
  }

  public async getQuiz(id: string, includeAnswers = true): Promise<QuizDraftInput> {
    return this.call(async () => {
      const raw = await this.httpClient.get<unknown>(`/api/app/quizzes/${id}`, {
        query: { includeAnswers },
      });
      const parsed = QuizDtoSchema.parse(raw);
      return {
        id: parsed.id,
        title: parsed.title,
        passingPercentage: parsed.passingPercentage,
        isMultipleAttemptAllowed: parsed.isMultipleAttemptAllowed,
        version: parsed.version,
        questions: parsed.questions.map((q) => ({
          id: q.id ?? null,
          prompt: q.prompt,
          displayOrder: q.displayOrder ?? undefined,
          options: q.options.map((o) => ({
            id: o.id ?? null,
            text: o.text,
            isCorrect: Boolean(o.isCorrect),
          })),
        })),
      };
    });
  }

  public async getRevision(revisionId: string): Promise<ContentRevision> {
    return this.call(async () => {
      const raw = await this.httpClient.get(`/api/app/content/revision/${revisionId}`);
      return toRevision(RevisionDtoSchema.parse(raw));
    });
  }

  public async getActiveRevision(id: string): Promise<ContentRevision | null> {
    return this.call(async () => {
      try {
        // According to ABP routing conventions, GetActiveRevisionAsync -> GET /api/app/content/{id}/active-revision
        const raw = await this.httpClient.get(`${BASE}/${id}/active-revision`);
        if (!raw) return null;
        return toRevision(RevisionDtoSchema.parse(raw));
      } catch (e) {
        if (e instanceof HttpError && e.status === 404) return null;
        throw e;
      }
    });
  }

  public async getReviewQueue(params?: ReviewQueueParams): Promise<{
    items: readonly ContentRevision[];
    totalCount: number;
  }> {
    return this.call(async () => {
      const query = buildReviewQueueQuery(params);
      return await this.httpClient.get<{
        items: readonly ContentRevision[];
        totalCount: number;
      }>(`/api/app/content/review-queue`, { query });
    });
  }

  public async getRevisionStatusCounts(
    params: Pick<ReviewQueueParams, 'filter' | 'type'>,
  ): Promise<RevisionStatusCounts> {
    return this.call(async () => {
      const query: Record<string, string | number | boolean> = {};
      if (params.filter) {
        query.Filter = params.filter;
      }
      if (params.type !== undefined) {
        query.Type = params.type;
      }

      return await this.httpClient.get<RevisionStatusCounts>(
        `/api/app/content/revision-status-counts`,
        { query },
      );
    });
  }

  public async saveRevision(
    id: string,
    input: ContentDraftStateInput,
  ): Promise<ContentRevision> {
    return this.call(async () =>
      toRevision(
        RevisionDtoSchema.parse(
          await this.httpClient.post(`${BASE}/${id}/save-revision`, input),
        ),
      ),
    );
  }

  public async submitRevision(id: string): Promise<ContentRevision> {
    return this.call(async () =>
      toRevision(
        RevisionDtoSchema.parse(
          await this.httpClient.post(`${BASE}/${id}/submit-revision`),
        ),
      ),
    );
  }

  public async approveRevision(id: string, notes?: string): Promise<ContentRevision> {
    return this.call(async () =>
      toRevision(
        RevisionDtoSchema.parse(
          await this.httpClient.post(`${BASE}/${id}/approve-revision`, { notes }),
        ),
      ),
    );
  }

  public async rejectRevision(id: string, reason: string): Promise<ContentRevision> {
    return this.call(async () =>
      toRevision(
        RevisionDtoSchema.parse(
          await this.httpClient.post(`${BASE}/${id}/reject-revision`, { notes: reason }),
        ),
      ),
    );
  }

  private async call<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (cause) {
      throw new Error(this.messageFor(cause));
    }
  }

  private messageFor(cause: unknown): string {
    if (cause instanceof HttpError) {
      const body = cause.body as { error?: { message?: string } } | undefined;
      const message = body?.error?.message;
      this.logger.error('Content request failed', cause, { status: cause.status });
      return message !== undefined && message.length > 0
        ? message
        : `Request failed (${String(cause.status)}).`;
    }
    this.logger.error('Content request failed', cause);
    return cause instanceof Error ? cause.message : 'Something went wrong.';
  }
}
