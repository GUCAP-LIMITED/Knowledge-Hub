import { getContentTypeKey } from '@features/content';

/** The item just created by the upload wizard — only what the success card needs to link to it. */
export interface CreatedContent {
  readonly id: string;
  readonly type: number;
}

export interface UploadResultLink {
  readonly label: string;
  readonly to: string;
  /** Static route the destination lives under; the user must be allowed to open it. */
  readonly guardPath: string;
}

const CATALOG_PATHS = {
  course: '/courses',
  tutorial: '/tutorials',
  resource: '/resources',
} as const;

const SUBMISSIONS_PATH = '/submissions';

/**
 * Where the success card's secondary action leads. Directly-published content is live, so it
 * opens its catalog detail page; content submitted for review isn't in the catalog yet, so it
 * opens the author's own submission instead.
 */
export const uploadResultLink = (
  created: CreatedContent,
  publishedDirectly: boolean,
): UploadResultLink => {
  if (!publishedDirectly) {
    return {
      label: 'View submission',
      to: `${SUBMISSIONS_PATH}/${created.id}/edit`,
      guardPath: SUBMISSIONS_PATH,
    };
  }
  const key = getContentTypeKey(created.type);
  const base = CATALOG_PATHS[key];
  return { label: `View ${key}`, to: `${base}/${created.id}`, guardPath: base };
};
