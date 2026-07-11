import { useMemo, useState, type ReactElement } from 'react';
import { PageHeader, useDeleteConfirm } from '@shared/ui';
import { useAuth } from '@features/auth';
import { useContentTypes } from '@features/content-types';
import type { Tutorial } from '../domain';
import { useDeleteTutorial, useTutorials, useUpdateTutorial } from './use-tutorials';
import { TutorialsResults } from './TutorialsResults';
import { TutorialsModals } from './TutorialsModals';
import { TutorialsToolbar } from './TutorialsToolbar';
import { CategoryPills } from './CategoryPills';
import { type TutorialSort, filterAndSortTutorials } from './tutorials-filter';
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
  const [sort, setSort] = useState<TutorialSort>('recent');
  const [watching, setWatching] = useState<Tutorial | null>(null);
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const [quizzing, setQuizzing] = useState<Tutorial | null>(null);
  const categories = useContentTypes('tutorial');
  const del = useDeleteConfirm(
    tutorials.data ?? [],
    'tutorial',
    (id) => {
      remove.mutate(id);
    },
    remove.isPending,
  );

  const visible = useMemo(
    () => filterAndSortTutorials(tutorials.data ?? [], query, category, sort),
    [tutorials.data, query, category, sort],
  );
  const filtered = query.trim() !== '' || category !== 'all';

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Tutorials"
        subtitle="Short, focused how-to guides for everyday tasks."
      />

      <TutorialsToolbar query={query} sort={sort} onQuery={setQuery} onSort={setSort} />

      <CategoryPills
        categories={categories}
        active={category}
        allLabel="All Tutorials"
        onSelect={setCategory}
      />

      <div className={styles.resultRow}>
        <span className={styles.count}>
          {visible.length} tutorial{visible.length === 1 ? '' : 's'}
          {category === 'all' ? '' : ` in ${category}`}
        </span>
      </div>

      <TutorialsResults
        tutorials={visible}
        isLoading={tutorials.isLoading}
        error={tutorials.isError ? tutorials.error : null}
        filtered={filtered}
        removingId={remove.isPending ? remove.variables : null}
        onWatch={setWatching}
        onEdit={setEditing}
        onDelete={del.request}
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

      {del.dialog}
    </section>
  );
};
