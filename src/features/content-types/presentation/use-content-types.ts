import { useContentCategories } from '@features/content';
import type { ContentKind } from './content-types-model';

/**
 * Category **names** for one content kind, sourced from the backend category API. Returns `[]` while
 * loading so existing catalog filters / selects that expect a synchronous `string[]` keep working.
 */
export const useContentTypes = (kind: ContentKind): readonly string[] => {
  const { data } = useContentCategories(kind);
  return data?.map((category) => category.name) ?? [];
};
