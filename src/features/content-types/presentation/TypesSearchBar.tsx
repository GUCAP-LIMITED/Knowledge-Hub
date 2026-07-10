import type { ReactElement } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@shared/utils';
import { CONTENT_KINDS, type ContentKind } from '../store/content-types-store';
import { KIND_META } from './content-types-model';
import styles from './ContentTypesManager.module.css';

export type KindFilter = 'all' | ContentKind;

export interface TypesSearchBarProps {
  readonly query: string;
  readonly onQuery: (value: string) => void;
  readonly filter: KindFilter;
  readonly onFilter: (value: KindFilter) => void;
}

const FILTERS: readonly { readonly value: KindFilter; readonly label: string }[] = [
  { value: 'all', label: 'All' },
  ...CONTENT_KINDS.map((kind) => ({ value: kind, label: KIND_META[kind].label })),
];

/** Search across every type plus a segmented kind filter — the screen scales to many types. */
export const TypesSearchBar = ({
  query,
  onQuery,
  filter,
  onFilter,
}: TypesSearchBarProps): ReactElement => (
  <div className={styles.searchBar}>
    <div className={styles.searchField}>
      <Search size={16} aria-hidden="true" className={styles.searchIcon} />
      <input
        type="search"
        className={styles.searchInput}
        value={query}
        placeholder="Search types across all categories…"
        aria-label="Search content types"
        onChange={(event) => {
          onQuery(event.target.value);
        }}
      />
    </div>
    <div className={styles.segmented} role="tablist" aria-label="Filter by category">
      {FILTERS.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={filter === item.value}
          className={cn(styles.segment, filter === item.value && styles.segmentActive)}
          onClick={() => {
            onFilter(item.value);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
);
