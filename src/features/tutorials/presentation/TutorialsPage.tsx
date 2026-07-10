import { useMemo, useState, type ReactElement } from 'react';
import { PageHeader, TextField } from '@shared/ui';
import { useAuth } from '@features/auth';
import { useContentTypes } from '@features/content-types';
import type { Tutorial } from '../domain';
import { useDeleteTutorial, useTutorials, useUpdateTutorial } from './use-tutorials';
import { TutorialsResults } from './TutorialsResults';
import { TutorialsModals } from './TutorialsModals';
import { CategoryPills } from './CategoryPills';
import styles from './TutorialsPage.module.css';

/** Routed tutorials-library page: category filter, search, video player, admin edit/delete. */
export const TutorialsPage = (): ReactElement => {
  const { user } = useAuth();
  const isAdmin = user?.hasAnyRole(['admin']) ?? false;
  const tutorials = useTutorials();
  const update = useUpdateTutorial();
  const remove = useDeleteTutorial();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [watching, setWatching] = useState<Tutorial | null>(null);
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const [quizzing, setQuizzing] = useState<Tutorial | null>(null);
  const categories = useContentTypes('tutorial');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tutorials.data ?? []).filter(
      (tutorial) =>
        (category === 'all' || tutorial.category === category) &&
        (q === '' ||
          tutorial.title.toLowerCase().includes(q) ||
          tutorial.category.toLowerCase().includes(q)),
    );
  }, [tutorials.data, query, category]);

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Tutorials"
        subtitle="Short, focused how-to guides for everyday tasks."
      />

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

      <CategoryPills
        categories={categories}
        active={category}
        allLabel="All Tutorials"
        onSelect={setCategory}
      />

      <TutorialsResults
        tutorials={visible}
        isLoading={tutorials.isLoading}
        error={tutorials.isError ? tutorials.error : null}
        isAdmin={isAdmin}
        removingId={remove.isPending ? remove.variables : null}
        onWatch={setWatching}
        onEdit={setEditing}
        onDelete={(id) => {
          remove.mutate(id);
        }}
        onQuiz={setQuizzing}
      />

      <TutorialsModals
        watching={watching}
        editing={editing}
        quizzing={quizzing}
        isAdmin={isAdmin}
        update={update}
        onCloseWatch={() => {
          setWatching(null);
        }}
        onCloseEdit={() => {
          setEditing(null);
        }}
        onCloseQuiz={() => {
          setQuizzing(null);
        }}
      />
    </section>
  );
};
