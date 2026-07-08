import type { ReactElement } from 'react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Resource } from '../domain';
import styles from './ResourcesPage.module.css';

export interface ResourceCardProps {
  readonly resource: Resource;
  readonly isBusy: boolean;
  readonly onHelpful: (resource: Resource) => void;
}

/** Knowledge-base card for a single resource. Presentational — business questions come from the entity. */
export const ResourceCard = ({
  resource,
  isBusy,
  onHelpful,
}: ResourceCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.cardTop}>
      <span className={styles.type}>{resource.type}</span>
      {resource.isPopular() ? <span className={styles.popular}>Popular</span> : null}
    </div>
    <h2 className={styles.cardTitle}>{resource.title}</h2>
    <span className={styles.category}>{resource.category}</span>
    <dl className={styles.meta}>
      <div>
        <dt>Views</dt>
        <dd>{resource.views}</dd>
      </div>
      <div>
        <dt>Helpful</dt>
        <dd>{resource.helpful}</dd>
      </div>
    </dl>
    <Button
      size="sm"
      variant="primary"
      className={cn(styles.helpfulButton)}
      isLoading={isBusy}
      onClick={() => {
        onHelpful(resource);
      }}
    >
      Helpful ({resource.helpful})
    </Button>
  </article>
);
