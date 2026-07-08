import type { ReactElement } from 'react';
import { Alert, Spinner } from '@shared/ui';
import { useTutorials } from './use-tutorials';
import { TutorialCard } from './TutorialCard';
import styles from './TutorialsPage.module.css';

/** Routed tutorials-library page. Reads server state via TanStack Query; no business logic here. */
export const TutorialsPage = (): ReactElement => {
  const tutorials = useTutorials();

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tutorials</h1>
          <p className={styles.subtitle}>Short, task-focused how-to guides.</p>
        </div>
      </header>

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

      {tutorials.data?.length === 0 ? (
        <p className={styles.empty}>No tutorials yet.</p>
      ) : null}

      {tutorials.data !== undefined && tutorials.data.length > 0 ? (
        <div className={styles.grid}>
          {tutorials.data.map((tutorial) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} />
          ))}
        </div>
      ) : null}
    </section>
  );
};
