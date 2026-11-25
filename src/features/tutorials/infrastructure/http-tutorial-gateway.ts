/* eslint-disable max-lines, complexity */
import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import { z } from 'zod';
import {
  Tutorial,
  type Difficulty,
  type TutorialError,
  type TutorialGateway,
  type TutorialCatalogParams,
  type PagedResult,
  type EnumValue,
  type TutorialVideo,
  TutorialNotFoundError,
  formatVideoTitle,
  sortMediaBySavedOrder,
} from '../domain';
import { formatDurationDisplay } from '@features/content';

const BASE = '/api/app/tutorial';

const TutorialRowSchema = z.object({
  id: z.string(),
  slug: z.string().optional().default(''),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  durationSeconds: z.number().optional().default(0),
  difficulty: z.union([z.number(), z.string()]).nullable().optional(),
  difficultyName: z.string().nullable().optional(),
  visibility: z.union([z.number(), z.string()]).nullish(),
  thumbnailUrl: z.string().nullable().optional(),
  quizId: z.string().nullable().optional(),
  isQuizRequired: z.boolean().nullable().optional(),
  isCompleted: z.boolean().optional().default(false),
  completedAt: z.string().nullable().optional(),
  certificateId: z.string().nullable().optional(),
  certificateUrl: z.string().nullable().optional(),
  helpfulCount: z.number().optional().default(0),
  isHelpful: z.boolean().optional().default(false),
  averageRating: z.number().optional().default(0),
  rating: z.number().optional().default(0),
  totalReviews: z.number().optional().default(0),
  canModify: z.boolean().optional().default(false),
  primaryMedia: z
    .object({
      id: z.string(),
      url: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  videos: z
    .array(
      z.object({
        id: z.string(),
        originalFileName: z.string().optional().default(''),
        title: z.string().nullable().optional(),
        slot: z.number().optional().default(20),
        kind: z.number().optional().default(5),
        streamStatus: z.number().optional().default(0),
        durationSeconds: z.number().optional().default(0),
        displayOrder: z.number().optional().default(0),
        url: z.string().nullable().optional(),
        externalUrl: z.string().nullable().optional(),
        mimeType: z.string().nullable().optional(),
        sizeBytes: z.number().optional().default(0),
        isMediaCompleted: z.boolean().optional().default(false),
      }),
    )
    .optional()
    .default([]),

  completedVideosCount: z.number().optional().default(0),
  totalVideosCount: z.number().optional().default(0),
  progressPercent: z.number().optional().default(0),
  lastModificationTime: z.string().nullable().optional(),
  creationTime: z.string().nullable().optional(),
});

type TutorialRow = z.infer<typeof TutorialRowSchema>;

const mapVisibility = (visibility?: number | string | null): string => {
  if (
    visibility === 5 ||
    visibility === 1 ||
    visibility === 'Team' ||
    visibility === 'team'
  ) {
    return 'Team';
  }
  if (
    visibility === 10 ||
    visibility === 2 ||
    visibility === 'Private' ||
    visibility === 'private'
  ) {
    return 'Private';
  }
  return 'Public';
};

const formatDuration = (seconds?: number): string => formatDurationDisplay(seconds ?? 0);

const mapDifficulty = (
  difficulty?: number | string | null,
  difficultyName?: string | null,
): Difficulty => {
  if (difficultyName === 'Advanced' || difficulty === 10 || difficulty === 'Advanced') {
    return 'Advanced';
  }
  if (
    difficultyName === 'Intermediate' ||
    difficulty === 5 ||
    difficulty === 'Intermediate'
  ) {
    return 'Intermediate';
  }
  return 'Beginner';
};

const difficultyToNumber = (diff: string): number => {
  if (diff === 'Advanced') return 10;
  if (diff === 'Intermediate') return 5;
  return 0;
};

const resolveTutorialDate = (row: TutorialRow): Date => {
  const updatedRaw = row.lastModificationTime ?? row.creationTime;
  return updatedRaw ? new Date(updatedRaw) : new Date();
};

const resolveCategory = (row: TutorialRow): string =>
  row.categoryName ?? row.category ?? 'Uncategorized';

const resolveCertificate = (
  row: TutorialRow,
): { certificateId: string | null; certificateUrl: string | null } => ({
  certificateId: row.certificateId ?? null,
  certificateUrl: row.certificateUrl ?? null,
});

const toTutorial = (row: TutorialRow): Tutorial => {
  const cert = resolveCertificate(row);
  const videos: TutorialVideo[] = row.videos.map((v) => ({
    id: v.id,
    originalFileName: v.originalFileName,
    title: v.title && v.title.trim().length > 0 ? v.title.trim() : v.originalFileName,
    durationSeconds: v.durationSeconds,
    displayOrder: v.displayOrder,
    streamStatus: v.streamStatus,
    url: v.url ?? null,
    externalUrl: v.externalUrl ?? null,
    mimeType: v.mimeType ?? null,
    sizeBytes: v.sizeBytes,
    isMediaCompleted: v.isMediaCompleted,
  }));

  if (videos.length === 0 && row.primaryMedia) {
    videos.push({
      id: row.primaryMedia.id,
      originalFileName: row.title,
      title: formatVideoTitle(row.title),
      durationSeconds: row.durationSeconds,
      displayOrder: 0,
      streamStatus: 0,
      url: row.primaryMedia.url ?? null,
      isMediaCompleted: row.isCompleted,
    });
  }

  const completedVideosCount =
    row.completedVideosCount || videos.filter((v) => v.isMediaCompleted).length;
  const totalVideosCount = row.totalVideosCount || videos.length;
  const progressPercent =
    row.progressPercent ||
    (totalVideosCount > 0
      ? Math.round((completedVideosCount / totalVideosCount) * 100)
      : 0);

  return new Tutorial({
    id: row.id,
    slug: row.slug || row.id,
    title: row.title,
    subtitle: row.subtitle ?? null,
    description: row.description ?? '',
    categoryId: row.categoryId ?? null,
    category: resolveCategory(row),
    difficulty: mapDifficulty(row.difficulty, row.difficultyName),
    duration: formatDuration(row.durationSeconds),
    durationSeconds: row.durationSeconds,
    visibility: mapVisibility(row.visibility),
    views: 0,
    updatedAt: resolveTutorialDate(row),
    mediaAssetId: row.primaryMedia?.id ?? null,
    thumbnailUrl: row.thumbnailUrl ?? null,
    quizId: row.quizId ?? null,
    isQuizRequired: row.isQuizRequired ?? false,
    completed: row.isCompleted,
    completedAt: row.completedAt ?? null,
    certificateId: cert.certificateId,
    certificateUrl: cert.certificateUrl,
    helpfulCount: row.helpfulCount,
    isHelpful: row.isHelpful,
    rating: row.averageRating,
    totalReviews: row.totalReviews,
    canModify: row.canModify,
    videos,

    completedVideosCount,
    totalVideosCount,
    progressPercent,
  });
};

const buildTutorialCatalogQuery = (params?: TutorialCatalogParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.filter) searchParams.set('Filter', params.filter);
  if (params.categoryId) {
    searchParams.set('CategoryId', params.categoryId);
  } else if (params.category && params.category !== 'all') {
    searchParams.set('Category', params.category);
  }
  if (params.sorting) searchParams.set('Sorting', params.sorting);
  if (params.skipCount !== undefined)
    searchParams.set('SkipCount', String(params.skipCount));
  if (params.maxResultCount !== undefined) {
    searchParams.set('MaxResultCount', String(params.maxResultCount));
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};

const parseTutorialsResponse = (
  raw: { items?: unknown[]; totalCount?: number } | unknown[],
): PagedResult<Tutorial> => {
  if (Array.isArray(raw)) {
    const items = z.array(TutorialRowSchema).parse(raw).map(toTutorial);
    return { items, totalCount: items.length };
  }

  const items = z
    .array(TutorialRowSchema)
    .parse(raw.items ?? [])
    .map(toTutorial);
  const totalCount = typeof raw.totalCount === 'number' ? raw.totalCount : items.length;
  return { items, totalCount };
};

const resolveTutorialSaveSlug = (tutorial: Tutorial): string =>
  tutorial.slug && tutorial.slug !== tutorial.id
    ? tutorial.slug
    : tutorial.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export interface HttpTutorialGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

interface RawContentMediaDto {
  readonly id: string;
  readonly originalFileName?: string | undefined;
  readonly slot?: number | undefined;
  readonly kind?: number | undefined;
  readonly streamStatus?: number | undefined;
  readonly durationSeconds?: number | undefined;
  readonly displayOrder?: number | undefined;
  readonly url?: string | null | undefined;
  readonly externalUrl?: string | null | undefined;
  readonly mimeType?: string | null | undefined;
  readonly sizeBytes?: number | undefined;
  readonly isMediaCompleted?: boolean | undefined;
}

type RowVideo = z.infer<typeof TutorialRowSchema>['videos'][number];

const mapContentMediaToRowVideo = (m: RawContentMediaDto, index: number): RowVideo => ({
  id: m.id,
  originalFileName: m.originalFileName ?? `Video Part ${String(index + 1)}`,
  slot: m.slot ?? 20,
  kind: m.kind ?? 5,
  streamStatus: m.streamStatus ?? 0,
  durationSeconds: m.durationSeconds ?? 0,
  displayOrder: m.displayOrder ?? index,
  url: m.url ?? null,
  externalUrl: m.externalUrl ?? null,
  mimeType: m.mimeType ?? null,
  sizeBytes: m.sizeBytes ?? 0,
  isMediaCompleted: m.isMediaCompleted ?? false,
});

const resolveFallbackVideos = async (
  httpClient: HttpClient,
  contentId: string,
  existingVideos: readonly RowVideo[],
): Promise<readonly RowVideo[]> => {
  if (existingVideos.length > 1) {
    return sortMediaBySavedOrder(existingVideos, contentId);
  }

  try {
    const contentRaw = await httpClient.get<{
      readonly media?: readonly RawContentMediaDto[];
    }>(`/api/app/content/${contentId}`);

    const media = contentRaw.media ?? [];
    const videoAssets = media.filter(
      (m) => m.slot !== 0 && (m.kind === 5 || m.slot === 20 || m.slot === 5),
    );
    const sortedAssets = sortMediaBySavedOrder(videoAssets, contentId);

    if (sortedAssets.length > existingVideos.length) {
      return sortedAssets.map((asset, idx) => ({
        ...mapContentMediaToRowVideo(asset, idx),
        displayOrder: idx,
      }));
    }
  } catch {
    // Graceful fallback when content endpoint is unavailable or unauthorized
  }

  return sortMediaBySavedOrder(existingVideos, contentId);
};

export class HttpTutorialGateway implements TutorialGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HttpTutorialGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('tutorial-gateway');
  }

  public async list(
    params?: TutorialCatalogParams,
  ): Promise<Result<PagedResult<Tutorial>, TutorialError>> {
    return this.guard(async () => {
      const qs = buildTutorialCatalogQuery(params);
      const raw = await this.httpClient.get<
        { items?: unknown[]; totalCount?: number } | unknown[]
      >(`${BASE}/catalog${qs}`);

      return parseTutorialsResponse(raw);
    });
  }

  public async getById(id: string): Promise<Result<Tutorial, TutorialError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.get(
        `${BASE}/${encodeURIComponent(id)}/catalog-item`,
      );
      const row = TutorialRowSchema.parse(raw);
      const videos = await resolveFallbackVideos(this.httpClient, row.id, row.videos);
      try {
        localStorage.removeItem(`tutorial_completed_videos_${row.id}`);
      } catch {
        // Ignore localStorage cleanup errors
      }
      const completedVideosCount =
        row.completedVideosCount || videos.filter((v) => v.isMediaCompleted).length;
      const totalVideosCount = Math.max(row.totalVideosCount, videos.length);
      const progressPercent =
        totalVideosCount > 0
          ? Math.round((completedVideosCount / totalVideosCount) * 100)
          : 0;

      return toTutorial({
        ...row,
        videos: [...videos],
        completedVideosCount,
        totalVideosCount,
        progressPercent,
      });
    });
  }

  public async save(tutorial: Tutorial): Promise<Result<Tutorial, TutorialError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.put(`${BASE}/${tutorial.id}`, {
        title: tutorial.title,
        description: tutorial.description,
        slug: resolveTutorialSaveSlug(tutorial),
        categoryId: tutorial.categoryId ?? undefined,
        category: tutorial.category,
        difficulty: difficultyToNumber(tutorial.difficulty),
        durationSeconds: tutorial.durationSeconds,
        status: 0,
      });
      return toTutorial(TutorialRowSchema.parse(raw));
    });
  }

  public async markComplete(id: string): Promise<Result<Tutorial, TutorialError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.post(`${BASE}/${id}/mark-complete`, undefined);
      return toTutorial(TutorialRowSchema.parse(raw));
    });
  }

  public async markVideoComplete(
    id: string,
    mediaAssetId: string,
  ): Promise<Result<Tutorial, TutorialError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.post(
        `${BASE}/${id}/videos/${mediaAssetId}/complete`,
        undefined,
      );
      return toTutorial(TutorialRowSchema.parse(raw));
    });
  }

  public async markHelpful(id: string): Promise<Result<Tutorial, TutorialError>> {
    return this.guard(async () => {
      await this.httpClient.post(`${BASE}/${id}/mark-helpful`, undefined);
      const raw = await this.httpClient.get(`${BASE}/${id}/catalog-item`);
      return toTutorial(TutorialRowSchema.parse(raw));
    });
  }

  public async remove(id: string): Promise<Result<void, TutorialError>> {
    return this.guard(async () => {
      await this.httpClient.delete(`${BASE}/${id}`);
    });
  }

  public async getEnum(
    enumName: string,
  ): Promise<Result<readonly EnumValue[], TutorialError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.get<unknown[]>(
        `/api/app/enum/${encodeURIComponent(enumName)}`,
      );
      return z
        .array(
          z.object({
            value: z.number(),
            name: z.string(),
            description: z.string(),
          }),
        )
        .parse(raw);
    });
  }

  private async guard<T>(fn: () => Promise<T>): Promise<Result<T, TutorialError>> {
    try {
      return ok(await fn());
    } catch (cause) {
      const status = cause instanceof HttpError ? cause.status : undefined;
      this.logger.error('Tutorial request failed', cause, { status });
      if (status === 404) {
        return err(new TutorialNotFoundError('API returned 404'));
      }
      return err(new Error('Tutorials unavailable') as TutorialError);
    }
  }
}
