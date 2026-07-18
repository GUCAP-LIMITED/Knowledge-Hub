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
  ContentGateway,
  ContentSummary,
  CreateContentInput,
  MediaAsset,
  MediaUploadTicket,
  UpdateContentDetailsInput,
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
  slot: z.number(),
  kind: z.number(),
  originalFileName: z.string(),
  streamStatus: z.number(),
  url: z.string().nullish(),
});

const DetailDtoSchema = z.object({
  id: z.string(),
  type: z.number(),
  title: z.string(),
  status: z.number(),
  difficulty: z.number(),
  visibility: z.number(),
  durationSeconds: z.number(),
  slug: z.string(),
  description: z.string().nullish(),
  thumbnailUrl: z.string().nullish(),
  tags: z.array(z.string()),
  media: z.array(MediaDtoSchema),
});

const TicketDtoSchema = z.object({
  blobName: z.string(),
  uploadUrl: z.string().nullish(),
  method: z.string(),
  headers: z.record(z.string()),
});

const toMedia = (d: z.infer<typeof MediaDtoSchema>): MediaAsset => ({
  id: d.id,
  slot: d.slot,
  kind: d.kind,
  originalFileName: d.originalFileName,
  streamStatus: d.streamStatus,
  url: d.url ?? null,
});

const toDetail = (d: z.infer<typeof DetailDtoSchema>): ContentDetail => ({
  id: d.id,
  type: d.type,
  title: d.title,
  status: d.status,
  difficulty: d.difficulty,
  visibility: d.visibility,
  durationSeconds: d.durationSeconds,
  thumbnailUrl: d.thumbnailUrl ?? null,
  slug: d.slug,
  description: d.description ?? null,
  tags: d.tags,
  media: d.media.map(toMedia),
});

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

  public async list(params: {
    status?: number;
    type?: number;
  }): Promise<readonly ContentSummary[]> {
    return this.call(async () => {
      const raw = await this.httpClient.get<{ items?: unknown[] } | unknown[]>(BASE, {
        query: { Status: params.status, Type: params.type },
      });
      const items = Array.isArray(raw) ? raw : (raw.items ?? []);
      return z
        .array(
          DetailDtoSchema.partial().required({
            id: true,
            type: true,
            title: true,
            status: true,
          }),
        )
        .parse(items)
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
            code: z.string(),
            isPrimary: z.boolean(),
          }),
        )
        .parse(raw.items ?? []);
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
        method: dto.method,
        headers: dto.headers,
      };
    });
  }

  public async uploadToBlob(ticket: MediaUploadTicket, file: File): Promise<void> {
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
    });
    if (!response.ok) {
      throw new Error(`Upload failed (${String(response.status)}).`);
    }
  }

  public async addMedia(id: string, input: AddMediaInput): Promise<MediaAsset> {
    return this.call(async () =>
      toMedia(
        MediaDtoSchema.parse(await this.httpClient.post(`${BASE}/${id}/media`, input)),
      ),
    );
  }

  public async addSection(id: string, title: string): Promise<{ readonly id: string }> {
    return this.call(async () => {
      const dto = z
        .object({ id: z.string() })
        .parse(await this.httpClient.post(`${BASE}/${id}/section`, { title }));
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
