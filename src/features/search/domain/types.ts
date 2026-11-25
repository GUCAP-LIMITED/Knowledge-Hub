export type SearchContentTab = 'all' | 'courses' | 'tutorials' | 'resources';

export interface GlobalSearchItem {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly categoryName?: string | undefined;
  readonly slug: string;
  readonly type: number;
}

export interface GlobalSearchResult {
  readonly courses: readonly GlobalSearchItem[];
  readonly tutorials: readonly GlobalSearchItem[];
  readonly resources: readonly GlobalSearchItem[];
}

export interface GlobalSearchParams {
  readonly query: string;
  readonly maxPerCategory?: number | undefined;
  readonly type?: number | undefined;
}
