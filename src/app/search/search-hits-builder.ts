import type { GlobalSearchResult, SearchContentTab } from '@features/search';
import type { Hit } from './search-overlay.types';

export const shouldInclude = (
  activeTab: SearchContentTab,
  target: SearchContentTab,
): boolean => activeTab === 'all' || activeTab === target;

export const mapCourses = (result: GlobalSearchResult): readonly Hit[] =>
  result.courses.map((c) => ({
    key: c.id,
    title: c.title,
    sub: c.categoryName ?? 'Course',
    to: `/courses/${c.slug || c.id}`,
  }));

export const mapTutorials = (result: GlobalSearchResult): readonly Hit[] =>
  result.tutorials.map((t) => ({
    key: t.id,
    title: t.title,
    sub: t.categoryName ?? 'Tutorial',
    to: `/tutorials/${t.slug || t.id}`,
  }));

export const mapResources = (result: GlobalSearchResult): readonly Hit[] =>
  result.resources.map((r) => ({
    key: r.id,
    title: r.title,
    sub: r.categoryName ?? 'Resource',
    to: `/resources/${r.slug || r.id}`,
  }));

export const buildHitsFromSearch = (
  query: string,
  result?: GlobalSearchResult,
  activeTab: SearchContentTab = 'all',
): readonly (readonly [string, readonly Hit[]])[] => {
  if (query === '' || !result) {
    return [];
  }

  const groups: (readonly [string, readonly Hit[]])[] = [];

  if (shouldInclude(activeTab, 'courses') && result.courses.length > 0) {
    groups.push(['Courses', mapCourses(result)]);
  }

  if (shouldInclude(activeTab, 'tutorials') && result.tutorials.length > 0) {
    groups.push(['Tutorials', mapTutorials(result)]);
  }

  if (shouldInclude(activeTab, 'resources') && result.resources.length > 0) {
    groups.push(['Resources', mapResources(result)]);
  }

  return groups;
};

export const calculateCounts = (
  data?: GlobalSearchResult,
): Record<SearchContentTab, number> => {
  if (!data) {
    return { all: 0, courses: 0, tutorials: 0, resources: 0 };
  }
  const courses = data.courses.length;
  const tutorials = data.tutorials.length;
  const resources = data.resources.length;
  return {
    all: courses + tutorials + resources,
    courses,
    tutorials,
    resources,
  };
};

export const getEmptyMessage = (tab: SearchContentTab, query: string): string =>
  tab === 'all' ? `No results for “${query}”.` : `No ${tab} found for “${query}”.`;
