import type { ReactElement } from 'react';
import { Alert, Spinner } from '@shared/ui';
import type { Resource } from '../domain';
import { useResources, useMarkResourceHelpful } from './use-resources';
import { ResourceCard } from './ResourceCard';
import styles from './ResourcesPage.module.css';

/** Routed knowledge-base page. Reads server state via TanStack Query; no business logic here. */
export const ResourcesPage = (): ReactElement => {
  const resources = useResources();
  const markHelpful = useMarkResourceHelpful();

  const handleHelpful = (resource: Resource): void => {
    markHelpful.mutate({ id: resource.id });
  };

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Knowledge Base</h1>
          <p className={styles.subtitle}>Guides, policies and references for the team.</p>
        </div>
      </header>

      {resources.isLoading ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading resources" />
        </div>
      ) : null}

      {resources.isError ? (
        <Alert tone="error" title="Could not load resources">
          {resources.error.message}
        </Alert>
      ) : null}

      {resources.data?.length === 0 ? (
        <p className={styles.empty}>No resources yet.</p>
      ) : null}

      {resources.data !== undefined && resources.data.length > 0 ? (
        <div className={styles.grid}>
          {resources.data.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isBusy={markHelpful.isPending}
              onHelpful={handleHelpful}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};
