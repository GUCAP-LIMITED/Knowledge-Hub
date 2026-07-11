import { useMemo, useState, type ReactElement } from 'react';
import { PageHeader, TextField, useDeleteConfirm } from '@shared/ui';
import { useAuth } from '@features/auth';
import type { Resource } from '../domain';
import { useDeleteResource, useResources, useUpdateResource } from './use-resources';
import type { ArticleActions } from './ResourcesParts';
import { ResourcesBody } from './ResourcesBody';
import { ResourcesModals } from './ResourcesModals';
import { groupByCategory, mostViewed } from './resources-categories';
import styles from './ResourcesPage.module.css';

/** Routed knowledge-base page: category cards + popular articles, or filtered results. */
export const ResourcesPage = (): ReactElement => {
  const { user } = useAuth();
  const isAdmin = user?.hasAnyRole(['admin']) ?? false;
  const resources = useResources();
  const update = useUpdateResource();
  const remove = useDeleteResource();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [active, setActive] = useState<Resource | null>(null);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [quizzing, setQuizzing] = useState<Resource | null>(null);

  const all = useMemo(() => resources.data ?? [], [resources.data]);
  const del = useDeleteConfirm(all, 'resource', remove.mutate, remove.isPending);
  const categories = useMemo(() => groupByCategory(all), [all]);
  const popular = useMemo(() => mostViewed(all), [all]);

  const q = query.trim().toLowerCase();
  const browsing = category === null && q === '';
  const results = all.filter(
    (resource) =>
      (category === null || resource.category === category) &&
      (q === '' || resource.title.toLowerCase().includes(q)),
  );

  const actions: ArticleActions = {
    onOpen: setActive,
    onEdit: setEditing,
    onDelete: del.request,
    onQuiz: setQuizzing,
  };

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Resources"
        subtitle="Knowledge base, policies, guides, and FAQs."
      />

      <div className={styles.toolbar}>
        <TextField
          label="Search"
          placeholder="Search articles, guides, FAQs…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
      </div>

      <ResourcesBody
        isLoading={resources.isLoading}
        error={resources.isError ? resources.error : null}
        browsing={browsing}
        categories={categories}
        popular={popular}
        heading={category ?? `Search results for “${query}”`}
        results={results}
        onSelectCategory={setCategory}
        onBack={() => {
          setCategory(null);
          setQuery('');
        }}
        actions={actions}
      />

      <ResourcesModals
        active={active}
        editing={editing}
        quizzing={quizzing}
        isAdmin={isAdmin}
        update={update}
        onCloseView={() => {
          setActive(null);
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
