import type { ChangeEvent, ReactElement } from 'react';
import { Select, TextField } from '@shared/ui';
import { CATEGORIES } from '@core/domain';

export type CourseSort = 'newest' | 'rating' | 'title';

export interface CoursesToolbarProps {
  readonly query: string;
  readonly category: string;
  readonly sort: CourseSort;
  readonly onQuery: (value: string) => void;
  readonly onCategory: (value: string) => void;
  readonly onSort: (value: CourseSort) => void;
}

/** Search + category filter + sort controls for the course catalog. */
export const CoursesToolbar = ({
  query,
  category,
  sort,
  onQuery,
  onCategory,
  onSort,
}: CoursesToolbarProps): ReactElement => {
  const handleSort = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value;
    if (value === 'newest' || value === 'rating' || value === 'title') {
      onSort(value);
    }
  };

  return (
    <>
      <TextField
        label="Search"
        placeholder="Search courses…"
        value={query}
        onChange={(event) => {
          onQuery(event.target.value);
        }}
      />
      <Select
        label="Category"
        value={category}
        onChange={(event) => {
          onCategory(event.target.value);
        }}
      >
        <option value="all">All categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </Select>
      <Select label="Sort by" value={sort} onChange={handleSort}>
        <option value="newest">Newest</option>
        <option value="rating">Top rated</option>
        <option value="title">A–Z</option>
      </Select>
    </>
  );
};
