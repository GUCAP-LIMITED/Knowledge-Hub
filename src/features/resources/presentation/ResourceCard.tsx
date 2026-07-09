import type { ReactElement } from 'react';
import { Eye, FileText, ThumbsUp } from 'lucide-react';
import { Badge, Button, CategoryBadge } from '@shared/ui';
import type { Resource } from '../domain';
import styles from './ResourcesPage.module.css';

export interface ResourceCardProps {
  readonly resource: Resource;
  readonly isBusy: boolean;
  readonly onHelpful: (resource: Resource) => void;
}

/** Knowledge-base card for a single resource. */
export const ResourceCard = ({
  resource,
  isBusy,
  onHelpful,
}: ResourceCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.cardTop}>
      <Badge tone="info" icon={FileText}>
        {resource.type}
      </Badge>
      {resource.isPopular() ? <Badge tone="secondary">Popular</Badge> : null}
    </div>
    <h2 className={styles.cardTitle}>{resource.title}</h2>
    <div>
      <CategoryBadge category={resource.category} size="sm" />
    </div>
    <div className={styles.metaRow}>
      <span className={styles.metaItem}>
        <Eye size={14} aria-hidden="true" /> {resource.views.toLocaleString()} views
      </span>
      <span className={styles.metaItem}>
        Updated {resource.updated.toLocaleDateString()}
      </span>
    </div>
    <Button
      size="sm"
      variant="ghost"
      isLoading={isBusy}
      onClick={() => {
        onHelpful(resource);
      }}
    >
      <ThumbsUp size={14} aria-hidden="true" /> Helpful ({resource.helpful})
    </Button>
  </article>
);
