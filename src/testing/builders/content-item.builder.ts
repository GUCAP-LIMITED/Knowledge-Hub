import { ContentItem, type ContentItemProps } from '@features/content/domain';

export type ContentItemOverrides = Partial<ContentItemProps>;

const DEFAULT_CONTENT_ITEM: ContentItemProps = {
  id: 'ct-1',
  title: 'Getting Started with UAPP Portal',
  type: 'Course',
  status: 'draft',
  author: 'Md Shamim',
  createdAt: new Date('2024-01-05T00:00:00.000Z'),
  views: 0,
};

/** Construct a valid {@link ContentItem} for tests, overriding only what matters per case. */
export const buildContentItem = (overrides: ContentItemOverrides = {}): ContentItem =>
  new ContentItem({ ...DEFAULT_CONTENT_ITEM, ...overrides });
