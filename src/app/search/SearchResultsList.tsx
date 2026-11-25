import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import type { SearchContentTab } from '@features/search';
import type { Hit } from './search-overlay.types';
import { getEmptyMessage } from './search-hits-builder';
import styles from './SearchOverlay.module.css';

interface ResultGroupProps {
  readonly label: string;
  readonly hits: readonly Hit[];
  readonly startIndex: number;
  readonly activeIndex: number;
  readonly onGo: (to: string) => void;
}

const ResultGroup = ({
  label,
  hits,
  startIndex,
  activeIndex,
  onGo,
}: ResultGroupProps): ReactElement | null => {
  if (hits.length === 0) {
    return null;
  }
  return (
    <div className={styles.group}>
      <div className={styles.groupLabel}>{label}</div>
      {hits.map((hit, index) => (
        <button
          key={hit.key}
          type="button"
          className={cn(
            styles.hit,
            startIndex + index === activeIndex && styles.hitActive,
          )}
          onClick={() => {
            onGo(hit.to);
          }}
        >
          <span className={styles.hitTitle}>{hit.title}</span>
          <span className={styles.hitSub}>{hit.sub}</span>
        </button>
      ))}
    </div>
  );
};

export interface SearchResultsListProps {
  readonly query: string;
  readonly isLoading: boolean;
  readonly activeTab: SearchContentTab;
  readonly groups: readonly (readonly [string, readonly Hit[]])[];
  readonly total: number;
  readonly activeIndex: number;
  readonly onGo: (to: string) => void;
}

export const SearchResultsList = ({
  query,
  isLoading,
  activeTab,
  groups,
  total,
  activeIndex,
  onGo,
}: SearchResultsListProps): ReactElement => {
  if (query.trim() === '') {
    return <p className={styles.hint}>Type to search across the Knowledge Hub.</p>;
  }

  if (isLoading) {
    return <p className={styles.hint}>Searching...</p>;
  }

  let startIndex = 0;

  return (
    <>
      {groups.map(([label, hits]) => {
        const groupStart = startIndex;
        startIndex += hits.length;
        return (
          <ResultGroup
            key={label}
            label={label}
            hits={hits}
            startIndex={groupStart}
            activeIndex={activeIndex}
            onGo={onGo}
          />
        );
      })}
      {total === 0 ? (
        <p className={styles.hint}>{getEmptyMessage(activeTab, query)}</p>
      ) : null}
    </>
  );
};
