import type { ReactElement } from 'react';
import { Select, TextField } from '@shared/ui';
import type { ContentCategory } from '@features/content';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import styles from './ResourcesPage.module.css';

const ALL_CATEGORIES_VALUE = '__all__';

export interface ResourcesToolbarProps {
  readonly query: string;
  readonly categoryId: string | undefined;
  readonly categories: readonly ContentCategory[];
  readonly onQuery: (value: string) => void;
  readonly onCategory: (value: string | undefined) => void;
  readonly onClearAll: () => void;
}

/** Search + category filter for the knowledge base catalog. */
export const ResourcesToolbar = ({
  query,
  categoryId,
  categories,
  onQuery,
  onCategory,
  onClearAll,
}: ResourcesToolbarProps): ReactElement => (
  <div className={styles.toolbarContainer}>
    <div className={styles.toolbar}>
      <div className={styles.toolbarSearch}>
        <TextField
          label="Search"
          placeholder="Search documents, guides, policies…"
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
            { value: ALL_CATEGORIES_VALUE, label: 'All categories' },
            ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
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
      onClearAll={onClearAll}
    />
  </div>
);
