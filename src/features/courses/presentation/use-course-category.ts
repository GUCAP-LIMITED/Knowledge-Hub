import { useContentCategories } from '@features/content';

/**
 * Resolves a category id (already present on the course from the catalog listing) to its display
 * name via the shared, type-scoped categories list — no per-course content fetch needed.
 */
export const useCourseCategoryName = (categoryId: string | null): string | null => {
  const categories = useContentCategories('course');
  if (categoryId === null) {
    return null;
  }
  return categories.data?.find((category) => category.id === categoryId)?.name ?? null;
};
