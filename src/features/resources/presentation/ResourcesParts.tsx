import type { ReactElement } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Pencil,
  Trash2,
} from 'lucide-react';
import { EmptyState, IconButton } from '@shared/ui';
import { cn } from '@shared/utils';
import { useMyCapabilities } from '@features/users';
import type { Resource } from '../domain';
import { type CategoryGroup, categoryMeta } from './resources-categories';
import styles from './ResourcesPage.module.css';

export interface ArticleActions {
  readonly onOpen: (resource: Resource) => void;
  readonly onEdit: (resource: Resource) => void;
  readonly onDelete: (id: string) => void;
  readonly onQuiz: (resource: Resource) => void;
}

const ArticleRow = ({
  resource,
  meta,
  actions,
}: {
  readonly resource: Resource;
  readonly meta: string;
  readonly actions: ArticleActions;
}): ReactElement => {
  const { can } = useMyCapabilities();
  return (
    <div className={styles.articleRow}>
      <button
        type="button"
        className={styles.articleMain}
        onClick={() => {
          actions.onOpen(resource);
        }}
      >
        <FileText size={18} aria-hidden="true" className={styles.articleIcon} />
        <span className={styles.articleBody}>
          <span className={styles.articleTitle}>{resource.title}</span>
          <span className={styles.articleMeta}>{meta}</span>
        </span>
        <ChevronRight size={16} aria-hidden="true" className={styles.chevron} />
      </button>
      <div className={styles.articleAdmin}>
        <IconButton
          label="Resource quizzes"
          onClick={() => {
            actions.onQuiz(resource);
          }}
        >
          <ClipboardList size={15} />
        </IconButton>
        {can('resources', 'edit') ? (
          <IconButton
            label="Edit resource"
            onClick={() => {
              actions.onEdit(resource);
            }}
          >
            <Pencil size={15} />
          </IconButton>
        ) : null}
        {can('resources', 'delete') ? (
          <IconButton
            label="Delete resource"
            variant="danger"
            onClick={() => {
              actions.onDelete(resource.id);
            }}
          >
            <Trash2 size={15} />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
};

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
  actions,
}: {
  readonly resources: readonly Resource[];
  readonly actions: ArticleActions;
}): ReactElement => (
  <div className={styles.panel}>
    <h2 className={styles.panelHeading}>Popular articles</h2>
    <div className={styles.articleList}>
      {resources.slice(0, 5).map((resource) => (
        <ArticleRow
          key={resource.id}
          resource={resource}
          meta={`${resource.category} • Updated ${resource.updated.toLocaleDateString('en-GB')} • ${resource.views.toLocaleString()} views`}
          actions={actions}
        />
      ))}
    </div>
  </div>
);

export interface ArticleResultsProps {
  readonly heading: string;
  readonly resources: readonly Resource[];
  readonly onBack: () => void;
  readonly actions: ArticleActions;
}

/** Filtered article results (a chosen category or a search), with a back link. */
export const ArticleResults = ({
  heading,
  resources,
  onBack,
  actions,
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
            resource={resource}
            meta={`${String(resource.helpful)}% found this helpful • Updated ${resource.updated.toLocaleDateString('en-GB')}`}
            actions={actions}
          />
        ))}
      </div>
    )}
  </div>
);
