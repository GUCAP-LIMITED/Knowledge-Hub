import { useEffect, useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch, type SearchContentTab } from '@features/search';
import { buildHitsFromSearch, calculateCounts } from './search-hits-builder';
import { useSearchTabs } from './use-search-tabs';
import { useSearchNavigation } from './use-search-navigation';
import { SearchInputRow } from './SearchInputRow';
import { SearchTabsBar } from './SearchTabsBar';
import { SearchResultsList } from './SearchResultsList';
import styles from './SearchOverlay.module.css';

/** Command-palette style search powered by PostgreSQL database-level full-text and fuzzy search. */
export const SearchOverlay = ({
  onClose,
}: {
  readonly onClose: () => void;
}): ReactElement => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchContentTab>('all');
  const { visibleTabs, placeholder } = useSearchTabs(activeTab, setActiveTab);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const search = useGlobalSearch(debouncedQuery, 10);
  const q = debouncedQuery.trim();
  const go = (to: string): void => {
    navigate(to);
    onClose();
  };

  const groups = buildHitsFromSearch(q, search.data, activeTab);
  const flatHits = groups.flatMap(([, hits]) => hits);
  const activeIndex = useSearchNavigation({
    query: q,
    activeTab,
    flatHits,
    onClose,
    go,
  });

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close search"
        onClick={onClose}
      />
      <div className={styles.panel} role="dialog" aria-label="Search">
        <SearchInputRow
          query={query}
          onChangeQuery={setQuery}
          onClose={onClose}
          placeholder={placeholder}
        />
        <SearchTabsBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={calculateCounts(search.data)}
          hasQuery={q.length > 0}
          tabs={visibleTabs}
        />
        <div className={styles.results}>
          <SearchResultsList
            query={query}
            isLoading={search.isLoading}
            activeTab={activeTab}
            groups={groups}
            total={flatHits.length}
            activeIndex={activeIndex}
            onGo={go}
          />
        </div>
      </div>
    </div>
  );
};
