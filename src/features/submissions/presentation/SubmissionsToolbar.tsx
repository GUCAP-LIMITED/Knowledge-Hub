import type { ReactElement } from 'react';
import { Select, TextField } from '@shared/ui';
import type { ContentCategory } from '@features/content';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import {
  TYPE_OPTIONS,
  STATUS_OPTIONS,
  SORT_OPTIONS,
  type SubmissionSortFilter,
  type SubmissionStatusFilter,
  type SubmissionTypeFilter,
} from './submissions-filter';
import styles from './SubmissionsPage.module.css';

export type {
  SubmissionSortFilter,
  SubmissionStatusFilter,
  SubmissionTypeFilter,
} from './submissions-filter';

export interface SubmissionsToolbarProps {
  readonly query: string;
  readonly onQuery: (value: string) => void;
  readonly type: SubmissionTypeFilter;
  readonly onType: (value: SubmissionTypeFilter) => void;
  readonly status: SubmissionStatusFilter;
  readonly onStatus: (value: SubmissionStatusFilter) => void;
  readonly categoryId: string;
  readonly onCategory: (value: string) => void;
  readonly categories: readonly ContentCategory[];
  readonly sorting: SubmissionSortFilter;
  readonly onSorting: (value: SubmissionSortFilter) => void;
  readonly isAdmin: boolean;
  readonly onClearAll: () => void;
}

/** Search + type/status/category/sorting filter box, driving the Content API's `GetListAsync` params. */
// eslint-disable-next-line max-lines-per-function
export const SubmissionsToolbar = ({
  query,
  onQuery,
  type,
  onType,
  status,
  onStatus,
  categoryId,
  onCategory,
  categories,
  sorting,
  onSorting,
  isAdmin,
  onClearAll,
}: SubmissionsToolbarProps): ReactElement => {
  const categoryOptions =
    type === 'all'
      ? [{ value: 'all', label: 'Select a type first' }]
      : [
          { value: 'all', label: 'All categories' },
          ...categories.map((category) => ({ value: category.id, label: category.name })),
        ];

  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarSearch}>
          <TextField
            label="Search"
            placeholder="Search documents…"
            value={query}
            onChange={(event) => {
              onQuery(event.target.value);
            }}
            onClear={() => {
              onQuery('');
            }}
          />
        </div>
        <div className={styles.toolbarCell}>
          <Select
            label="Type"
            value={type}
            onChange={(value) => {
              onType(value as SubmissionTypeFilter);
            }}
            options={TYPE_OPTIONS}
          />
        </div>
        <div className={styles.toolbarCell}>
          <Select
            label="Status"
            value={status}
            onChange={(value) => {
              onStatus(value as SubmissionStatusFilter);
            }}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className={styles.toolbarCell}>
          <Select
            label="Category"
            value={categoryId}
            onChange={onCategory}
            disabled={type === 'all'}
            options={categoryOptions}
          />
        </div>
        <div className={styles.toolbarCell}>
          <Select
            label="Sort by"
            value={sorting}
            onChange={(value) => {
              onSorting(value as SubmissionSortFilter);
            }}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      <ActiveFilterChips
        query={query}
        onQueryChange={onQuery}
        type={type}
        onTypeChange={onType}
        status={status}
        onStatusChange={onStatus}
        categoryId={categoryId}
        onCategoryChange={onCategory}
        categories={categories}
        isAdmin={isAdmin}
        onClearAll={onClearAll}
      />
    </div>
  );
};
