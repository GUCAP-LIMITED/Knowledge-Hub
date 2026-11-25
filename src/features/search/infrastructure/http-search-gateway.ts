import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import { UnexpectedError } from '@core/errors/app-error';
import type { SearchGateway } from '../domain/ports/search-gateway';
import type { GlobalSearchParams, GlobalSearchResult } from '../domain/types';

const BASE = '/api/app/search';

export interface HttpSearchGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

interface RawSearchResponse {
  readonly courses?: readonly {
    readonly id?: string;
    readonly title?: string;
    readonly subtitle?: string;
    readonly categoryName?: string;
    readonly slug?: string;
    readonly type?: number;
  }[];
  readonly tutorials?: readonly {
    readonly id?: string;
    readonly title?: string;
    readonly subtitle?: string;
    readonly categoryName?: string;
    readonly slug?: string;
    readonly type?: number;
  }[];
  readonly resources?: readonly {
    readonly id?: string;
    readonly title?: string;
    readonly subtitle?: string;
    readonly categoryName?: string;
    readonly slug?: string;
    readonly type?: number;
  }[];
}

export class HttpSearchGateway implements SearchGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HttpSearchGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('http-search-gateway');
  }

  public async search(params: GlobalSearchParams): Promise<Result<GlobalSearchResult>> {
    try {
      const q = encodeURIComponent(params.query.trim());
      const maxParam =
        params.maxPerCategory !== undefined
          ? `&maxPerCategory=${encodeURIComponent(String(params.maxPerCategory))}`
          : '';
      const typeParam =
        params.type !== undefined
          ? `&type=${encodeURIComponent(String(params.type))}`
          : '';
      const raw = await this.httpClient.get<RawSearchResponse>(
        `${BASE}?query=${q}${maxParam}${typeParam}`,
      );

      const courses = (raw.courses ?? []).map((c) => ({
        id: c.id ?? '',
        title: c.title ?? '',
        subtitle: c.subtitle,
        categoryName: c.categoryName,
        slug: c.slug ?? '',
        type: c.type ?? 0,
      }));

      const tutorials = (raw.tutorials ?? []).map((t) => ({
        id: t.id ?? '',
        title: t.title ?? '',
        subtitle: t.subtitle,
        categoryName: t.categoryName,
        slug: t.slug ?? '',
        type: t.type ?? 5,
      }));

      const resources = (raw.resources ?? []).map((r) => ({
        id: r.id ?? '',
        title: r.title ?? '',
        subtitle: r.subtitle,
        categoryName: r.categoryName,
        slug: r.slug ?? '',
        type: r.type ?? 10,
      }));

      return ok({ courses, tutorials, resources });
    } catch (error) {
      this.logger.error('Failed to execute search', { error, query: params.query });
      return err(new UnexpectedError('Search request failed', { cause: error }));
    }
  }
}
