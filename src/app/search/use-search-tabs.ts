import { useCallback, useEffect, useMemo } from 'react';
import { useMyPermissions } from '@features/permissions';
import type { SearchContentTab } from '@features/search';
import { SEARCH_TABS, type SearchTabItem } from './search-overlay.types';

export interface UseSearchTabsResult {
  readonly visibleTabs: readonly SearchTabItem[];
  readonly placeholder: string;
}

/** Resolves available search filter tabs and placeholder text based on user view permissions. */
export const useSearchTabs = (
  activeTab: SearchContentTab,
  setActiveTab: (tab: SearchContentTab) => void,
): UseSearchTabsResult => {
  const permissionsQuery = useMyPermissions();

  const visibleTabs = useMemo(() => {
    if (permissionsQuery.data === undefined) {
      return SEARCH_TABS;
    }
    return SEARCH_TABS.filter(
      (tab) => !tab.permission || permissionsQuery.data[tab.permission] === true,
    );
  }, [permissionsQuery.data]);

  const resetTab = useCallback(() => {
    setActiveTab('all');
  }, [setActiveTab]);

  useEffect(() => {
    if (
      permissionsQuery.data !== undefined &&
      !visibleTabs.some((t) => t.id === activeTab)
    ) {
      resetTab();
    }
  }, [visibleTabs, activeTab, permissionsQuery.data, resetTab]);

  const placeholder = useMemo(() => {
    const labels = visibleTabs
      .filter((t) => t.id !== 'all')
      .map((t) => t.label.toLowerCase());
    if (labels.length === 0) {
      return 'Search Knowledge Hub…';
    }
    return `Search ${labels.join(', ')}…`;
  }, [visibleTabs]);

  return { visibleTabs, placeholder };
};
