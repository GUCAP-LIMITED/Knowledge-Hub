import type { ReactElement } from 'react';
import { Alert, Spinner } from '@shared/ui';
import type { Resource } from '../domain';
import {
  ArticleResults,
  type ArticleActions,
  CategoryCards,
  PopularArticles,
} from './ResourcesParts';
import type { CategoryGroup } from './resources-categories';
import styles from './ResourcesPage.module.css';

export interface ResourcesBodyProps {
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly browsing: boolean;
  readonly categories: readonly CategoryGroup[];
  readonly popular: readonly Resource[];
  readonly heading: string;
  readonly results: readonly Resource[];
  readonly onSelectCategory: (name: string) => void;
  readonly onBack: () => void;
  readonly actions: ArticleActions;
}

/** Loading / error / (category cards + popular) / filtered results for the knowledge base. */
export const ResourcesBody = ({
  isLoading,
  error,
  browsing,
  categories,
  popular,
  heading,
  results,
  onSelectCategory,
  onBack,
  actions,
}: ResourcesBodyProps): ReactElement => {
  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading resources" />
      </div>
    );
  }
  if (error !== null) {
    return (
      <Alert tone="error" title="Could not load resources">
        {error.message}
      </Alert>
    );
  }
  if (browsing) {
    return (
      <>
        <CategoryCards categories={categories} onSelect={onSelectCategory} />
        <PopularArticles resources={popular} actions={actions} />
      </>
    );
  }
  return (
    <ArticleResults
      heading={heading}
      resources={results}
      onBack={onBack}
      actions={actions}
    />
  );
};
