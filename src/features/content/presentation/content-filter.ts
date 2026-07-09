import type { TabDescriptor } from '@shared/ui';
import type { ContentItem, ContentStatus } from '../domain';

/** The status tabs shown on the management page ("all" is a synthetic, non-status value). */
export type ContentFilter = 'all' | ContentStatus;

export const CONTENT_TABS: readonly TabDescriptor[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In review' },
  { value: 'published', label: 'Published' },
];

/** Narrow an arbitrary string (from the Tabs callback) to a known filter value. */
export const toContentFilter = (value: string): ContentFilter => {
  if (value === 'draft' || value === 'review' || value === 'published') {
    return value;
  }
  return 'all';
};

/** Filter a library by status tab; "all" passes everything through. */
export const filterContent = (
  items: readonly ContentItem[],
  filter: ContentFilter,
): readonly ContentItem[] =>
  filter === 'all' ? items : items.filter((item) => item.status === filter);
