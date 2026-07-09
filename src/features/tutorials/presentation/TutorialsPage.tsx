import { useMemo, useState, type ReactElement } from 'react';
import { Alert, EmptyState, PageHeader, Spinner, TextField } from '@shared/ui';
import { useTutorials } from './use-tutorials';
import { TutorialCard } from './TutorialCard';
import styles from './TutorialsPage.module.css';

/** Routed tutorials-library page with search. */
export const TutorialsPage = (): ReactElement => {
  const tutorials = useTutorials();
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tutorials.data ?? []).filter(
      (tutorial) =>
        q === '' ||
        tutorial.title.toLowerCase().includes(q) ||
        tutorial.category.toLowerCase().includes(q),
    );
  }, [tutorials.data, query]);

  return (
    <section className={styles.screen}>
      <PageHeader title="Tutorials" subtitle="Short, task-focused how-to guides." />

      <div className={styles.toolbar}>
        <TextField
          label="Search"
          placeholder="Search tutorials…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
      </div>

      {tutorials.isLoading ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading tutorials" />
        </div>
      ) : null}

      {tutorials.isError ? (
        <Alert tone="error" title="Could not load tutorials">
          {tutorials.error.message}
        </Alert>
      ) : null}

      {!tutorials.isLoading && !tutorials.isError && visible.length === 0 ? (
        <EmptyState title="No tutorials match" description="Try a different search." />
      ) : null}

      {visible.length > 0 ? (
        <div className={styles.grid}>
          {visible.map((tutorial) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} />
          ))}
        </div>
      ) : null}
    </section>
  );
};
