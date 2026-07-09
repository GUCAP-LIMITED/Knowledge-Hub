import type { ReactElement } from 'react';
import { Select, TextField } from '@shared/ui';
import type { ContentType } from '../domain';
import {
  type ContentQuery,
  STATUS_LABELS,
  type StatusFilter,
  type TypeFilter,
} from './content-filter';
import styles from './ContentManagementPage.module.css';

export interface ContentFiltersProps {
  readonly query: ContentQuery;
  readonly types: readonly ContentType[];
  readonly onChange: (query: ContentQuery) => void;
}

const STATUS_VALUES: readonly StatusFilter[] = ['all', 'draft', 'review', 'published'];

/** Search + type + status filter bar for the content library. */
export const ContentFilters = ({
  query,
  types,
  onChange,
}: ContentFiltersProps): ReactElement => (
  <div className={styles.filters}>
    <div className={styles.filterSearch}>
      <TextField
        label="Search"
        placeholder="Search by title or author…"
        value={query.search}
        onChange={(event) => {
          onChange({ ...query, search: event.target.value });
        }}
      />
    </div>
    <div className={styles.filterCell}>
      <Select
        label="Type"
        value={query.type}
        onChange={(event) => {
          onChange({ ...query, type: event.target.value as TypeFilter });
        }}
      >
        <option value="all">All types</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>
    </div>
    <div className={styles.filterCell}>
      <Select
        label="Status"
        value={query.status}
        onChange={(event) => {
          onChange({ ...query, status: event.target.value as StatusFilter });
        }}
      >
        {STATUS_VALUES.map((value) => (
          <option key={value} value={value}>
            {value === 'all' ? 'All statuses' : STATUS_LABELS[value]}
          </option>
        ))}
      </Select>
    </div>
  </div>
);
