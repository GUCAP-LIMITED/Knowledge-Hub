import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import { z } from 'zod';
import {
  type NewSubmissionInput,
  Submission,
  type SubmissionError,
  type SubmissionGateway,
  SubmissionRequestRejectedError,
  type SubmissionStatus,
  SubmissionsUnavailableError,
} from '../domain';

/** The Content API backs the review workflow — one `ContentItem` per submission. */
const BASE = '/api/app/content';
/** Reviewer queue size; the queue is a working set, not an archive. */
const PAGE_SIZE = 200;

/** `ContentType` int → the label the queue shows. */
const TYPE_LABEL: Readonly<Record<number, string>> = {
  0: 'Course',
  5: 'Tutorial',
  10: 'Resource',
};
const TYPE_INT: Readonly<Record<string, number>> = {
  Course: 0,
  Tutorial: 5,
  Resource: 10,
};
/** `ContentStatus` int → `SubmissionStatus`. Draft (0) has no queue state — filtered out. */
const STATUS_BY_INT: Readonly<Record<number, SubmissionStatus>> = {
  5: 'pending', // PendingReview
  10: 'review', // InReview
  15: 'approved', // Approved
  20: 'published', // Published
  25: 'rejected', // Rejected
};

/**
 * Lenient over both `ContentListItemDto` (rows) and `ContentDetailDto` (single) — the review-only
 * fields (`submittedById`, `reviewNote`) are present only on the detail payload, so they are optional.
 */
const ContentRowSchema = z.object({
  id: z.string(),
  type: z.number(),
  title: z.string(),
  status: z.number(),
  ownerId: z.string().nullish(),
  submittedById: z.string().nullish(),
  submittedAt: z.string().nullish(),
  reviewNote: z.string().nullish(),
  creationTime: z.string().nullish(),
});

type ContentRow = z.infer<typeof ContentRowSchema>;

/** Map a Content row to a `Submission`, or `null` for a Draft (not part of the review queue). */
const toSubmission = (row: ContentRow): Submission | null => {
  const status = STATUS_BY_INT[row.status];
  if (status === undefined) {
    return null;
  }
  const when = row.submittedAt ?? row.creationTime;
  return new Submission({
    id: row.id,
    title: row.title,
    type: TYPE_LABEL[row.type] ?? 'Content',
    // Identity is the owner GUID — the queue never joins user display names.
    submittedBy: row.submittedById ?? row.ownerId ?? '',
    submittedAt: when !== null && when !== undefined ? new Date(when) : new Date(0),
    status,
    note: row.reviewNote ?? null,
  });
};

export interface HttpSubmissionGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/**
 * {@link SubmissionGateway} backed by the Content REST API. Reads map `ContentItem`s onto the
 * `Submission` domain; `save` translates the *resulting* status into the matching workflow endpoint
 * (review→flag, approved→approve, rejected→reject, published→publish), carrying the note/reason.
 */
export class HttpSubmissionGateway implements SubmissionGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HttpSubmissionGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('submission-gateway');
  }

  public async list(): Promise<Result<readonly Submission[], SubmissionError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.get<{ items?: unknown[] } | unknown[]>(BASE, {
        query: { MaxResultCount: PAGE_SIZE },
      });
      const items = Array.isArray(raw) ? raw : (raw.items ?? []);
      return z
        .array(ContentRowSchema)
        .parse(items)
        .map(toSubmission)
        .filter((submission): submission is Submission => submission !== null);
    });
  }

  public async getById(id: string): Promise<Result<Submission, SubmissionError>> {
    return this.guard(async () => {
      const row = ContentRowSchema.parse(await this.httpClient.get(`${BASE}/${id}`));
      const submission = toSubmission(row);
      if (submission === null) {
        throw new Error('This content is still a draft and cannot be reviewed.');
      }
      return submission;
    });
  }

  public async create(
    input: NewSubmissionInput,
  ): Promise<Result<Submission, SubmissionError>> {
    return this.guard(async () => {
      const created = ContentRowSchema.parse(
        await this.httpClient.post(BASE, {
          type: TYPE_INT[input.type] ?? 0,
          title: input.title,
        }),
      );
      const submitted = ContentRowSchema.parse(
        await this.httpClient.post(`${BASE}/${created.id}/submit`),
      );
      const submission = toSubmission(submitted);
      if (submission === null) {
        throw new Error('Created content did not enter the review queue.');
      }
      return submission;
    });
  }

  public async save(
    submission: Submission,
  ): Promise<Result<Submission, SubmissionError>> {
    return this.guard(async () => {
      await this.dispatch(submission);
      const row = ContentRowSchema.parse(
        await this.httpClient.get(`${BASE}/${submission.id}`),
      );
      return toSubmission(row) ?? submission;
    });
  }

  /** Route a completed domain transition to its Content workflow endpoint. */
  private async dispatch(submission: Submission): Promise<void> {
    const { id, status, note } = submission;
    switch (status) {
      case 'review':
        await this.httpClient.post(`${BASE}/${id}/flag-for-review`);
        return;
      case 'approved':
        await this.httpClient.post(`${BASE}/${id}/approve`, { note });
        return;
      case 'rejected':
        await this.httpClient.post(`${BASE}/${id}/reject`, { reason: note ?? '' });
        return;
      case 'published':
        await this.httpClient.post(`${BASE}/${id}/publish`);
        return;
      case 'pending':
        await this.httpClient.post(`${BASE}/${id}/submit`);
        return;
    }
  }

  private async guard<T>(fn: () => Promise<T>): Promise<Result<T, SubmissionError>> {
    try {
      return ok(await fn());
    } catch (cause) {
      const status = cause instanceof HttpError ? cause.status : undefined;
      this.logger.error('Content request failed', cause, { status });
      const serverMessage = this.serverMessage(cause);
      // The server replied with a readable reason (illegal transition, denied permission) — pass it
      // through; a transport failure (offline/5xx) stays the generic "unavailable" message.
      return err(
        serverMessage !== null
          ? new SubmissionRequestRejectedError(serverMessage, cause)
          : new SubmissionsUnavailableError(cause),
      );
    }
  }

  /** The ABP `error.message` from a non-2xx response, if the body carried one. */
  private serverMessage(cause: unknown): string | null {
    if (!(cause instanceof HttpError)) {
      return null;
    }
    const body = cause.body as { error?: { message?: string } } | undefined;
    const message = body?.error?.message;
    return message !== undefined && message.length > 0 ? message : null;
  }
}
