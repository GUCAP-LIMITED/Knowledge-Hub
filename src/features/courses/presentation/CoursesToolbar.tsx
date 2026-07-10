import type { ReactElement } from 'react';
import { Select, TextField } from '@shared/ui';
import { useContentTypes } from '@features/content-types';
import styles from './CoursesPage.module.css';

export type CourseSort = 'popular' | 'rating' | 'newest' | 'duration';
export type CourseStatusFilter = 'all' | 'not-started' | 'in-progress' | 'completed';
export type CourseTypeFilter = 'all' | 'mandatory' | 'optional';

const CategoryCell = ({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
}): ReactElement => {
  const categories = useContentTypes('course');
  return (
    <div className={styles.toolbarCell}>
      <Select
        label="Category"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        <option value="all">All categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </Select>
    </div>
  );
};

export interface CoursesToolbarProps {
  readonly query: string;
  readonly category: string;
  readonly status: CourseStatusFilter;
  readonly type: CourseTypeFilter;
  readonly sort: CourseSort;
  readonly onQuery: (value: string) => void;
  readonly onCategory: (value: string) => void;
  readonly onStatus: (value: CourseStatusFilter) => void;
  readonly onType: (value: CourseTypeFilter) => void;
  readonly onSort: (value: CourseSort) => void;
}

/** Search + category/status/type filters + sort controls for the course catalog. */
export const CoursesToolbar = ({
  query,
  category,
  status,
  type,
  sort,
  onQuery,
  onCategory,
  onStatus,
  onType,
  onSort,
}: CoursesToolbarProps): ReactElement => (
  <div className={styles.toolbar}>
    <div className={styles.toolbarSearch}>
      <TextField
        label="Search"
        placeholder="Search by title or category…"
        value={query}
        onChange={(event) => {
          onQuery(event.target.value);
        }}
      />
    </div>
    <CategoryCell value={category} onChange={onCategory} />
    <div className={styles.toolbarCell}>
      <Select
        label="Status"
        value={status}
        onChange={(event) => {
          onStatus(event.target.value as CourseStatusFilter);
        }}
      >
        <option value="all">All statuses</option>
        <option value="not-started">Not started</option>
        <option value="in-progress">In progress</option>
        <option value="completed">Completed</option>
      </Select>
    </div>
    <div className={styles.toolbarCell}>
      <Select
        label="Type"
        value={type}
        onChange={(event) => {
          onType(event.target.value as CourseTypeFilter);
        }}
      >
        <option value="all">All types</option>
        <option value="mandatory">Mandatory</option>
        <option value="optional">Optional</option>
      </Select>
    </div>
    <div className={styles.toolbarCell}>
      <Select
        label="Sort by"
        value={sort}
        onChange={(event) => {
          onSort(event.target.value as CourseSort);
        }}
      >
        <option value="popular">Most popular</option>
        <option value="rating">Highest rated</option>
        <option value="newest">Newest</option>
        <option value="duration">Shortest first</option>
      </Select>
    </div>
  </div>
);
