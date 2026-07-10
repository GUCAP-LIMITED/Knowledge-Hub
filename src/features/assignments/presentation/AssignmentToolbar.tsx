import type { ReactElement } from 'react';
import { FilterBar, TextField } from '@shared/ui';
import { cn } from '@shared/utils';
import { ASSIGNMENT_TABS, type AssignmentFilter } from './assignment-filters';
import styles from './AssignTrainingPage.module.css';

export interface AssignmentToolbarProps {
  readonly query: string;
  readonly tab: AssignmentFilter;
  readonly counts: Record<AssignmentFilter, number>;
  readonly onQuery: (value: string) => void;
  readonly onTab: (value: AssignmentFilter) => void;
}

/** Search + status pill tabs for the assignments tracker. */
export const AssignmentToolbar = ({
  query,
  tab,
  counts,
  onQuery,
  onTab,
}: AssignmentToolbarProps): ReactElement => (
  <div className={styles.toolbar}>
    <FilterBar
      search={
        <TextField
          label="Search"
          placeholder="Search course or assignee…"
          value={query}
          onChange={(event) => {
            onQuery(event.target.value);
          }}
        />
      }
    />
    <div className={styles.tabs} role="tablist" aria-label="Filter assignments by status">
      {ASSIGNMENT_TABS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={tab === option.value}
          className={cn(styles.tab, tab === option.value && styles.tabActive)}
          onClick={() => {
            onTab(option.value);
          }}
        >
          {option.label}
          <span className={styles.tabCount}>{counts[option.value]}</span>
        </button>
      ))}
    </div>
  </div>
);
