import type { ReactElement } from 'react';
import { Select, TextField } from '@shared/ui';
import { SORT_OPTIONS, type TutorialSort } from './tutorials-filter';
import styles from './TutorialsPage.module.css';

export interface TutorialsToolbarProps {
  readonly query: string;
  readonly sort: TutorialSort;
  readonly onQuery: (value: string) => void;
  readonly onSort: (value: TutorialSort) => void;
}

/** Search + sort controls for the tutorials library. */
export const TutorialsToolbar = ({
  query,
  sort,
  onQuery,
  onSort,
}: TutorialsToolbarProps): ReactElement => (
  <div className={styles.toolbarBar}>
    <div className={styles.toolbarSearch}>
      <TextField
        label="Search"
        placeholder="Search tutorials, tasks, topics…"
        value={query}
        onChange={(event) => {
          onQuery(event.target.value);
        }}
      />
    </div>
    <div className={styles.toolbarSort}>
      <Select
        label="Sort by"
        value={sort}
        onChange={(event) => {
          onSort(event.target.value as TutorialSort);
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  </div>
);
