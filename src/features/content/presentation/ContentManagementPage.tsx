import { useMemo, useState, type ReactElement } from 'react';
import { Alert, PageHeader, Spinner, Tabs, TabsPanel } from '@shared/ui';
import {
  useContent,
  useCreateContent,
  useDeleteContent,
  usePublishContent,
} from './use-content';
import { CreateContentForm } from './CreateContentForm';
import { ContentList } from './ContentList';
import {
  CONTENT_TABS,
  type ContentFilter,
  filterContent,
  toContentFilter,
} from './content-filter';
import styles from './ContentManagementPage.module.css';

/** Routed content-management page: author, filter by status, publish and delete. */
export const ContentManagementPage = (): ReactElement => {
  const content = useContent();
  const create = useCreateContent();
  const publish = usePublishContent();
  const remove = useDeleteContent();
  const [filter, setFilter] = useState<ContentFilter>('all');

  const items = useMemo(
    () => filterContent(content.data ?? [], filter),
    [content.data, filter],
  );
  const busyId =
    (publish.isPending ? publish.variables : undefined) ??
    (remove.isPending ? remove.variables : undefined) ??
    null;

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Content Management"
        subtitle="Create, publish and manage all content"
      />

      <CreateContentForm
        isSubmitting={create.isPending}
        onSubmit={(values) => {
          create.mutate({ ...values, author: 'Md Shamim' });
        }}
      />

      {content.isError ? (
        <Alert tone="error" title="Could not load content">
          {content.error.message}
        </Alert>
      ) : null}

      {content.isLoading ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading content" />
        </div>
      ) : (
        <Tabs
          tabs={CONTENT_TABS}
          value={filter}
          onValueChange={(value) => {
            setFilter(toContentFilter(value));
          }}
        >
          <TabsPanel value={filter}>
            <ContentList
              items={items}
              busyId={busyId}
              onPublish={(id) => {
                publish.mutate(id);
              }}
              onDelete={(id) => {
                remove.mutate(id);
              }}
            />
          </TabsPanel>
        </Tabs>
      )}
    </section>
  );
};
