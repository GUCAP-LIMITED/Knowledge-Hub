import { useMemo } from 'react';
import { useContentCategories } from '@features/content';

/**
 * `categoryId` → display name, merged across every content kind — a submissions row can be a
 * course, tutorial, or resource, each with its own category taxonomy.
 */
export const useCategoryNameLookup = (): ReadonlyMap<string, string> => {
  const courses = useContentCategories('course');
  const tutorials = useContentCategories('tutorial');
  const resources = useContentCategories('resource');

  return useMemo(() => {
    const map = new Map<string, string>();
    for (const list of [courses.data, tutorials.data, resources.data]) {
      list?.forEach((category) => {
        map.set(category.id, category.name);
      });
    }
    return map;
  }, [courses.data, tutorials.data, resources.data]);
};
