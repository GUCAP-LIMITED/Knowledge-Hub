import type { ReactElement } from 'react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import { Plus, Search } from 'lucide-react';
import styles from './EmailTemplatesManager.module.css';

export type FilterTab = 'all' | 'email' | 'sms' | 'active' | 'inactive';

export interface FilterCounts {
  readonly all: number;
  readonly email: number;
  readonly sms: number;
  readonly active: number;
  readonly inactive: number;
}

export interface TemplatesFilterBarProps {
  readonly search: string;
  readonly onSearchChange: (search: string) => void;
  readonly filter: FilterTab;
  readonly onFilterChange: (filter: FilterTab) => void;
  readonly counts: FilterCounts;
  readonly onCreate: () => void;
}

export const TemplatesFilterBar = ({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  counts,
  onCreate,
}: TemplatesFilterBarProps): ReactElement => {
  const tabs: readonly {
    readonly key: FilterTab;
    readonly label: string;
    readonly count: number;
  }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'email', label: 'Email', count: counts.email },
    { key: 'sms', label: 'SMS', count: counts.sms },
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'inactive', label: 'Inactive', count: counts.inactive },
  ];

  return (
    <div className={styles.headerRow}>
      <div className={styles.searchAndFilters}>
        <div className={styles.searchInputWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search templates..."
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
          />
        </div>

        <div className={styles.filterChips}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cn(styles.chip, filter === tab.key && styles.chipActive)}
              onClick={() => {
                onFilterChange(tab.key);
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <Button type="button" variant="default" onClick={onCreate}>
        <Plus size={16} style={{ marginRight: '0.4rem' }} />
        Create Template
      </Button>
    </div>
  );
};
