import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import { z } from 'zod';
import {
  Resource,
  type ResourceAttachment,
  type ResourceError,
  type ResourceGateway,
  type ResourceCatalogParams,
  type PagedResult,
  type ResourceStats,
  ResourceNotFoundError,
  ResourcesUnavailableError,
} from '../domain';

const BASE = '/api/app/resource';

const ResourceCategoryStatSchema = z.object({
  categoryId: z.string().nullable().optional(),
  name: z.string(),
  slug: z.string().nullable().optional(),
  count: z.number().optional().default(0),
});

const ResourceStatsSchema = z.object({
  totalCount: z.number().optional().default(0),
  categories: z.array(ResourceCategoryStatSchema).optional().default([]),
});

const AttachmentSchema = z.object({
  id: z.string(),
  originalFileName: z.string().optional(),
  name: z.string().optional(),
  url: z.string().nullable().optional(),
  sizeBytes: z.number().optional().default(0),
});

const PrimaryMediaSchema = z.object({
  id: z.string(),
  originalFileName: z.string().optional().default('Document'),
  url: z.string().nullable().optional(),
  sizeBytes: z.number().optional().default(0),
});

const ResourceRowSchema = z.object({
  id: z.string(),
  slug: z.string().optional().default(''),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  visibility: z.union([z.number(), z.string()]).nullish(),
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  primaryMedia: PrimaryMediaSchema.nullable().optional(),
  attachments: z.array(AttachmentSchema).optional().default([]),
  media: z.array(AttachmentSchema).optional().default([]),
  helpfulCount: z.number().optional().default(0),
  isHelpful: z.boolean().optional().default(false),
  isCompleted: z.boolean().optional().default(false),
  completedAt: z.string().nullable().optional(),
  certificateId: z.string().nullable().optional(),
  certificateUrl: z.string().nullable().optional(),
  averageRating: z.number().optional().default(0),
  rating: z.number().optional().default(0),
  totalReviews: z.number().optional().default(0),
  canModify: z.boolean().optional().default(false),
});

type ResourceRow = z.infer<typeof ResourceRowSchema>;
type RawAttachment = z.infer<typeof AttachmentSchema>;
type RawPrimaryMedia = z.infer<typeof PrimaryMediaSchema>;

interface PrimaryMediaInfo {
  readonly mediaUrl: string | null;
  readonly primaryMediaName: string;
  readonly primaryMediaSizeBytes?: number | undefined;
}

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

const mapAttachments = (
  attachments: readonly RawAttachment[],
  media: readonly RawAttachment[],
  primaryId?: string,
): readonly ResourceAttachment[] => {
  const mediaWithoutPrimary = media.filter((m) => m.id !== primaryId);
  const combined = [...attachments, ...mediaWithoutPrimary];
  return combined.map((a) => ({
    id: a.id,
    name: a.originalFileName ?? a.name ?? 'Attachment',
    url: a.url ?? null,
    sizeBytes: a.sizeBytes,
  }));
};

const extractPrimaryMedia = (primary?: RawPrimaryMedia | null): PrimaryMediaInfo => ({
  mediaUrl: primary?.url ?? primary?.id ?? null,
  primaryMediaName: primary?.originalFileName ?? 'Document',
  primaryMediaSizeBytes: primary?.sizeBytes,
});

const resolveResourceCategory = (row: ResourceRow): string =>
  row.categoryName ?? row.category ?? 'Uncategorized';

const toResource = (row: ResourceRow): Resource => {
  const primaryInfo = extractPrimaryMedia(row.primaryMedia);
  const slug = row.slug ? row.slug : row.id;
  return new Resource({
    id: row.id,
    slug,
    title: row.title,
    subtitle: row.subtitle ?? null,
    type: row.type ?? 'Document',
    description: row.description ?? '',
    category: resolveResourceCategory(row),
    categoryId: row.categoryId ?? null,
    visibility: mapVisibility(row.visibility),
    helpful: row.helpfulCount,
    isHelpful: row.isHelpful,
    views: 0,
    updated: new Date(),
    thumbnailUrl: row.thumbnailUrl ?? null,
    mediaUrl: primaryInfo.mediaUrl,
    primaryMediaName: primaryInfo.primaryMediaName,
    primaryMediaSizeBytes: primaryInfo.primaryMediaSizeBytes,
    attachments: mapAttachments(row.attachments, row.media, row.primaryMedia?.id),
    isCompleted: row.isCompleted,
    completedAt: row.completedAt ?? null,
    certificateId: row.certificateId ?? null,
    certificateUrl: row.certificateUrl ?? null,
    rating: row.averageRating,
    totalReviews: row.totalReviews,
    canModify: row.canModify,
  });
};

const buildResourceCatalogQuery = (params?: ResourceCatalogParams): string => {
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

const parseResourcesResponse = (
  raw: { items?: unknown[]; totalCount?: number } | unknown[],
): PagedResult<Resource> => {
  if (Array.isArray(raw)) {
    const items = z.array(ResourceRowSchema).parse(raw).map(toResource);
    return { items, totalCount: items.length };
  }

  const items = z
    .array(ResourceRowSchema)
    .parse(raw.items ?? [])
    .map(toResource);
  const totalCount = typeof raw.totalCount === 'number' ? raw.totalCount : items.length;
  return { items, totalCount };
};

const resolveResourceSaveSlug = (resource: Resource): string =>
  resource.slug && resource.slug !== resource.id
    ? resource.slug
    : resource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export interface HttpResourceGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export class HttpResourceGateway implements ResourceGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HttpResourceGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('resource-gateway');
  }

  public async getStats(): Promise<Result<ResourceStats, ResourceError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.get(`${BASE}/stats`);
      const parsed = ResourceStatsSchema.parse(raw);
      return {
        totalCount: parsed.totalCount,
        categories: parsed.categories.map((c) => ({
          categoryId: c.categoryId ?? null,
          name: c.name,
          slug: c.slug ?? null,
          count: c.count,
        })),
      };
    });
  }

  public async list(
    params?: ResourceCatalogParams,
  ): Promise<Result<PagedResult<Resource>, ResourceError>> {
    return this.guard(async () => {
      const qs = buildResourceCatalogQuery(params);
      const raw = await this.httpClient.get<
        { items?: unknown[]; totalCount?: number } | unknown[]
      >(`${BASE}/catalog${qs}`);

      return parseResourcesResponse(raw);
    });
  }

  public async getById(id: string): Promise<Result<Resource, ResourceError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.get(
        `${BASE}/${encodeURIComponent(id)}/catalog-item`,
      );
      return toResource(ResourceRowSchema.parse(raw));
    });
  }

  public async markHelpful(id: string): Promise<Result<Resource, ResourceError>> {
    return this.guard(async () => {
      await this.httpClient.post(`${BASE}/${id}/mark-helpful`, undefined);
      const raw = await this.httpClient.get(`${BASE}/${id}/catalog-item`);
      return toResource(ResourceRowSchema.parse(raw));
    });
  }

  public async markComplete(id: string): Promise<Result<Resource, ResourceError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.post(`${BASE}/${id}/mark-complete`, undefined);
      return toResource(ResourceRowSchema.parse(raw));
    });
  }

  public async save(resource: Resource): Promise<Result<Resource, ResourceError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.put(`${BASE}/${resource.id}`, {
        title: resource.title,
        description: resource.description,
        slug: resolveResourceSaveSlug(resource),
        status: 0,
        categoryId: resource.categoryId ?? null,
        category: resource.category || undefined,
      });
      return toResource(ResourceRowSchema.parse(raw));
    });
  }

  public async remove(id: string): Promise<Result<void, ResourceError>> {
    return this.guard(async () => {
      await this.httpClient.delete(`${BASE}/${id}`);
    });
  }

  private async guard<T>(fn: () => Promise<T>): Promise<Result<T, ResourceError>> {
    try {
      return ok(await fn());
    } catch (cause) {
      const status = cause instanceof HttpError ? cause.status : undefined;
      this.logger.error('Resource request failed', cause, { status });
      if (status === 404) {
        return err(new ResourceNotFoundError('API returned 404'));
      }
      return err(new ResourcesUnavailableError(cause));
    }
  }
}
