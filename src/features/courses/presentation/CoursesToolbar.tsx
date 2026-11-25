import type { ReactElement } from 'react';
import { Select, TextField } from '@shared/ui';
import type { ContentCategory } from '@features/content';
import type { EnrollmentStatusDto } from '../domain';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import styles from './CoursesPage.module.css';

export type CourseSort = 'popular' | 'rating' | 'newest' | 'duration';

const ALL_CATEGORIES_VALUE = '__all__';
const ALL_STATUSES_VALUE = '__all__';

const CategoryCell = ({
  value,
  categories,
  onChange,
}: {
  readonly value: string | undefined;
  readonly categories: readonly ContentCategory[];
  readonly onChange: (value: string | undefined) => void;
}): ReactElement => (
  <div className={styles.toolbarCell}>
    <Select
      label="Category"
      value={value ?? ALL_CATEGORIES_VALUE}
      onChange={(val) => {
        onChange(val === ALL_CATEGORIES_VALUE ? undefined : val);
      }}
      options={[
        { value: ALL_CATEGORIES_VALUE, label: 'All categories' },
        ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
      ]}
    />
  </div>
);

export interface CoursesToolbarProps {
  readonly query: string;
  readonly categoryId: string | undefined;
  readonly categories: readonly ContentCategory[];
  readonly status: number | undefined;
  readonly statuses: readonly EnrollmentStatusDto[];
  readonly sort: CourseSort;
  readonly onQuery: (value: string) => void;
  readonly onCategory: (value: string | undefined) => void;
  readonly onStatus: (value: number | undefined) => void;
  readonly onSort: (value: CourseSort) => void;
  readonly onClearAll: () => void;
}

/** Search + category/status filters + sort controls for the course catalog. */
export const CoursesToolbar = ({
  query,
  categoryId,
  categories,
  status,
  statuses,
  sort,
  onQuery,
  onCategory,
  onStatus,
  onSort,
  onClearAll,
}: CoursesToolbarProps): ReactElement => (
  <div className={styles.toolbarContainer}>
    <div className={styles.toolbar}>
      <div className={styles.toolbarSearch}>
        <TextField
          label="Search"
          placeholder="Search by title or category…"
          value={query}
          onChange={(event) => {
            onQuery(event.target.value);
          }}
          onClear={() => {
            onQuery('');
          }}
        />
      </div>
      <CategoryCell value={categoryId} categories={categories} onChange={onCategory} />
      <div className={styles.toolbarCell}>
        <Select
          label="Status"
          value={status !== undefined ? String(status) : ALL_STATUSES_VALUE}
          onChange={(value) => {
            onStatus(value === ALL_STATUSES_VALUE ? undefined : Number(value));
          }}
          options={[
            { value: ALL_STATUSES_VALUE, label: 'All statuses' },
            ...statuses.map((s) => ({ value: String(s.value), label: s.label })),
          ]}
        />
      </div>
      <div className={styles.toolbarCell}>
        <Select
          label="Sort by"
          value={sort}
          onChange={(value) => {
            onSort(value as CourseSort);
          }}
          options={[
            { value: 'popular', label: 'Most popular' },
            { value: 'rating', label: 'Highest rated' },
            { value: 'newest', label: 'Newest' },
            { value: 'duration', label: 'Shortest first' },
          ]}
        />
      </div>
    </div>

    <ActiveFilterChips
      query={query}
      onQueryChange={onQuery}
      categoryId={categoryId}
      categories={categories}
      onCategoryChange={onCategory}
      status={status}
      statuses={statuses}
      onStatusChange={onStatus}
      onClearAll={onClearAll}
    />
  </div>
);
