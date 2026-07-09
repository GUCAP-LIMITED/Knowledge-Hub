import type { ReactElement } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { EmptyState } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Resource } from '../domain';
import { type CategoryGroup, categoryMeta } from './resources-categories';
import styles from './ResourcesPage.module.css';

const ArticleRow = ({
  title,
  meta,
  onOpen,
}: {
  readonly title: string;
  readonly meta: string;
  readonly onOpen: () => void;
}): ReactElement => (
  <button type="button" className={styles.articleRow} onClick={onOpen}>
    <FileText size={18} aria-hidden="true" className={styles.articleIcon} />
    <span className={styles.articleBody}>
      <span className={styles.articleTitle}>{title}</span>
      <span className={styles.articleMeta}>{meta}</span>
    </span>
    <ChevronRight size={16} aria-hidden="true" className={styles.chevron} />
  </button>
);

export interface CategoryCardsProps {
  readonly categories: readonly CategoryGroup[];
  readonly onSelect: (name: string) => void;
}

/** Grid of clickable knowledge-base category cards. */
export const CategoryCards = ({
  categories,
  onSelect,
}: CategoryCardsProps): ReactElement => (
  <div className={styles.categoryGrid}>
    {categories.map((category) => {
      const meta = categoryMeta(category.name);
      const Icon = meta.icon;
      return (
        <button
          key={category.name}
          type="button"
          className={cn(styles.categoryCard, styles[meta.tone])}
          onClick={() => {
            onSelect(category.name);
          }}
        >
          <span className={cn(styles.categoryTile, styles[`tile_${meta.tone}`])}>
            <Icon size={22} aria-hidden="true" />
          </span>
          <span className={styles.categoryBody}>
            <span className={styles.categoryName}>{category.name}</span>
            <span className={styles.categoryCount}>
              {category.count} article{category.count === 1 ? '' : 's'}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);

/** "Popular articles" card — the five most-viewed resources. */
export const PopularArticles = ({
  resources,
  onOpen,
}: {
  readonly resources: readonly Resource[];
  readonly onOpen: (resource: Resource) => void;
}): ReactElement => (
  <div className={styles.panel}>
    <h2 className={styles.panelHeading}>Popular articles</h2>
    <div className={styles.articleList}>
      {resources.slice(0, 5).map((resource) => (
        <ArticleRow
          key={resource.id}
          title={resource.title}
          meta={`${resource.category} • Updated ${resource.updated.toLocaleDateString('en-GB')} • ${resource.views.toLocaleString()} views`}
          onOpen={() => {
            onOpen(resource);
          }}
        />
      ))}
    </div>
  </div>
);

export interface ArticleResultsProps {
  readonly heading: string;
  readonly resources: readonly Resource[];
  readonly onBack: () => void;
  readonly onOpen: (resource: Resource) => void;
}

/** Filtered article results (a chosen category or a search), with a back link. */
export const ArticleResults = ({
  heading,
  resources,
  onBack,
  onOpen,
}: ArticleResultsProps): ReactElement => (
  <div className={styles.panel}>
    <button type="button" className={styles.backLink} onClick={onBack}>
      <ChevronLeft size={16} aria-hidden="true" /> Back to categories
    </button>
    <h2 className={styles.panelHeading}>{heading}</h2>
    {resources.length === 0 ? (
      <EmptyState
        title="No articles found"
        description="Try a different search term or browse all categories."
      />
    ) : (
      <div className={styles.articleList}>
        {resources.map((resource) => (
          <ArticleRow
            key={resource.id}
            title={resource.title}
            meta={`${String(resource.helpful)}% found this helpful • Updated ${resource.updated.toLocaleDateString('en-GB')}`}
            onOpen={() => {
              onOpen(resource);
            }}
          />
        ))}
      </div>
    )}
  </div>
);
