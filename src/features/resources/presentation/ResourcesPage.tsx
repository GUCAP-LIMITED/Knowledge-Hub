import { useMemo, useState, type ReactElement } from 'react';
import {
  Alert,
  MediaViewer,
  Modal,
  PageHeader,
  Spinner,
  TextField,
  demoAsset,
} from '@shared/ui';
import type { Resource } from '../domain';
import { useResources } from './use-resources';
import { ArticleResults, CategoryCards, PopularArticles } from './ResourcesParts';
import { groupByCategory, mostViewed } from './resources-categories';
import styles from './ResourcesPage.module.css';

/** Word-style resources preview inline as a fallback; everything else renders as a PDF. */
const kindFor = (resource: Resource): 'pdf' | 'doc' =>
  resource.type.toLowerCase().includes('document') ? 'doc' : 'pdf';

/** Routed knowledge-base page: category cards + popular articles, or filtered results. */
export const ResourcesPage = (): ReactElement => {
  const resources = useResources();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [active, setActive] = useState<Resource | null>(null);

  const all = useMemo(() => resources.data ?? [], [resources.data]);
  const categories = useMemo(() => groupByCategory(all), [all]);
  const popular = useMemo(() => mostViewed(all), [all]);

  const q = query.trim().toLowerCase();
  const browsing = category === null && q === '';
  const results = all.filter(
    (resource) =>
      (category === null || resource.category === category) &&
      (q === '' || resource.title.toLowerCase().includes(q)),
  );

  const back = (): void => {
    setCategory(null);
    setQuery('');
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

      {!resources.isLoading && !resources.isError ? (
        browsing ? (
          <>
            <CategoryCards categories={categories} onSelect={setCategory} />
            <PopularArticles resources={popular} onOpen={setActive} />
          </>
        ) : (
          <ArticleResults
            heading={category ?? `Search results for “${query}”`}
            resources={results}
            onBack={back}
            onOpen={setActive}
          />
        )
      ) : null}

      <Modal
        open={active !== null}
        onOpenChange={(next) => {
          if (!next) {
            setActive(null);
          }
        }}
        title={active?.title ?? 'Resource'}
        description={active ? `${active.type} · ${active.category}` : undefined}
        size="lg"
      >
        {active !== null ? (
          <MediaViewer asset={demoAsset(kindFor(active), active.title)} />
        ) : null}
      </Modal>
    </section>
  );
};
