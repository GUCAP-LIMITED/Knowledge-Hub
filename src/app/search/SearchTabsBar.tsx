import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import type { SearchContentTab } from '@features/search';
import { SEARCH_TABS, type SearchTabItem } from './search-overlay.types';
import styles from './SearchOverlay.module.css';

export interface SearchTabsBarProps {
  readonly activeTab: SearchContentTab;
  readonly onSelectTab: (tab: SearchContentTab) => void;
  readonly counts: Record<SearchContentTab, number>;
  readonly hasQuery: boolean;
  readonly tabs?: readonly SearchTabItem[];
}

export const SearchTabsBar = ({
  activeTab,
  onSelectTab,
  counts,
  hasQuery,
  tabs = SEARCH_TABS,
}: SearchTabsBarProps): ReactElement => (
  <div className={styles.tabsRow} role="tablist" aria-label="Content filter tabs">
    {tabs.map((tab) => {
      const count = counts[tab.id];
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          className={cn(styles.tabButton, isActive && styles.tabButtonActive)}
          onClick={() => {
            onSelectTab(tab.id);
          }}
        >
          <span>{tab.label}</span>
          {hasQuery && count > 0 ? (
            <span className={styles.tabBadge}>{count}</span>
          ) : null}
        </button>
      );
    })}
  </div>
);
