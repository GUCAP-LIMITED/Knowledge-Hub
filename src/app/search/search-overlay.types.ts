import type { SearchContentTab } from '@features/search';

export interface Hit {
  readonly key: string;
  readonly title: string;
  readonly sub: string;
  readonly to: string;
}

export interface SearchTabItem {
  readonly id: SearchContentTab;
  readonly label: string;
  readonly permission?: string;
}

export const SEARCH_TABS: readonly SearchTabItem[] = [
  { id: 'all', label: 'All' },
  { id: 'courses', label: 'Courses', permission: 'Courses.View' },
  { id: 'tutorials', label: 'Tutorials', permission: 'Tutorials.View' },
  { id: 'resources', label: 'Resources', permission: 'Resources.View' },
];
