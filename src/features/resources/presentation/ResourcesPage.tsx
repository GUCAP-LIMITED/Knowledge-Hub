import { useMemo, useState, type ReactElement } from 'react';
import { Alert, EmptyState, PageHeader, Spinner, TextField } from '@shared/ui';
import type { Resource } from '../domain';
import { useMarkResourceHelpful, useResources } from './use-resources';
import { ResourceCard } from './ResourceCard';
import styles from './ResourcesPage.module.css';

/** Routed knowledge-base page with search. */
export const ResourcesPage = (): ReactElement => {
  const resources = useResources();
  const markHelpful = useMarkResourceHelpful();
  const [query, setQuery] = useState('');

  const handleHelpful = (resource: Resource): void => {
    markHelpful.mutate({ id: resource.id });
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (resources.data ?? []).filter(
      (resource) =>
        q === '' ||
        resource.title.toLowerCase().includes(q) ||
        resource.category.toLowerCase().includes(q),
    );
  }, [resources.data, query]);

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Knowledge Base"
        subtitle="Guides, policies and references for the team."
      />

      <div className={styles.toolbar}>
        <TextField
          label="Search"
          placeholder="Search resources…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
      </div>

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

      {!resources.isLoading && !resources.isError && visible.length === 0 ? (
        <EmptyState title="No resources match" description="Try a different search." />
      ) : null}

      {visible.length > 0 ? (
        <div className={styles.grid}>
          {visible.map((resource) => (
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
