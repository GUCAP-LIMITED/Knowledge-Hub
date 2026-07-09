import type { ContentItem, ContentStatus, ContentType } from '../domain';

/** Type filter value; "all" is a synthetic pass-through, not a real content type. */
export type TypeFilter = 'all' | ContentType;

/** Status filter value; "all" is a synthetic pass-through, not a real status. */
export type StatusFilter = 'all' | ContentStatus;

/** The three axes the management page filters by. */
export interface ContentQuery {
  readonly search: string;
  readonly type: TypeFilter;
  readonly status: StatusFilter;
}

export const EMPTY_QUERY: ContentQuery = { search: '', type: 'all', status: 'all' };

/** Human labels for each lifecycle status. */
export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Draft',
  review: 'In review',
  published: 'Published',
};

/** The distinct content types present in a library, for the type dropdown. */
export const distinctTypes = (items: readonly ContentItem[]): readonly ContentType[] => [
  ...new Set(items.map((item) => item.type)),
];

const matchesSearch = (item: ContentItem, search: string): boolean => {
  const q = search.trim().toLowerCase();
  if (q === '') {
    return true;
  }
  return item.title.toLowerCase().includes(q) || item.author.toLowerCase().includes(q);
};

/** Apply the search + type + status filters to a library. */
export const filterContent = (
  items: readonly ContentItem[],
  query: ContentQuery,
): readonly ContentItem[] =>
  items.filter(
    (item) =>
      matchesSearch(item, query.search) &&
      (query.type === 'all' || item.type === query.type) &&
      (query.status === 'all' || item.status === query.status),
  );
