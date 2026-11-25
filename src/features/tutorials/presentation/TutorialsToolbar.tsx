import type { ReactElement } from 'react';
import { Select, TextField } from '@shared/ui';
import type { ContentCategory } from '@features/content';
import { SORT_OPTIONS, type TutorialSort } from './tutorials-filter';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import styles from './TutorialsPage.module.css';

const ALL_CATEGORIES_VALUE = '__all__';

export interface TutorialsToolbarProps {
  readonly query: string;
  readonly categoryId: string | undefined;
  readonly categories: readonly ContentCategory[];
  readonly sort: TutorialSort;
  readonly onQuery: (value: string) => void;
  readonly onCategory: (value: string | undefined) => void;
  readonly onSort: (value: TutorialSort) => void;
  readonly onClearAll: () => void;
}

/** Search + category/sort controls for the tutorials library, in a single toolbar bar. */
export const TutorialsToolbar = ({
  query,
  categoryId,
  categories,
  sort,
  onQuery,
  onCategory,
  onSort,
  onClearAll,
}: TutorialsToolbarProps): ReactElement => (
  <div className={styles.toolbarContainer}>
    <div className={styles.toolbar}>
      <div className={styles.toolbarSearch}>
        <TextField
          label="Search"
          placeholder="Search tutorials, tasks, topics…"
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
          label="Category"
          value={categoryId ?? ALL_CATEGORIES_VALUE}
          onChange={(val) => {
            onCategory(val === ALL_CATEGORIES_VALUE ? undefined : val);
          }}
          options={[
            { value: ALL_CATEGORIES_VALUE, label: 'All Tutorials' },
            ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
          ]}
        />
      </div>
      <div className={styles.toolbarCell}>
        <Select
          label="Sort by"
          value={sort}
          onChange={(value) => {
            onSort(value as TutorialSort);
          }}
          options={SORT_OPTIONS}
        />
      </div>
    </div>

    <ActiveFilterChips
      query={query}
      onQueryChange={onQuery}
      categoryId={categoryId}
      categories={categories}
      onCategoryChange={onCategory}
      onClearAll={onClearAll}
    />
  </div>
);
