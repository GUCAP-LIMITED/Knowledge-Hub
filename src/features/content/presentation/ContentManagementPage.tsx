import { useMemo, useState, type ReactElement } from 'react';
import { Plus } from 'lucide-react';
import { Button, PageHeader } from '@shared/ui';
import { useAuth } from '@features/auth';
import type { ContentItem } from '../domain';
import {
  useContent,
  useCreateContent,
  useDeleteContent,
  useUpdateContent,
} from './use-content';
import { ContentFilters } from './ContentFilters';
import { ContentResults } from './ContentResults';
import { ContentFormModal, type ContentFormValues } from './ContentFormModal';
import {
  type ContentQuery,
  EMPTY_QUERY,
  distinctTypes,
  filterContent,
} from './content-filter';
import styles from './ContentManagementPage.module.css';

/** Admin content library: search/filter, create, edit, publish-via-status, and delete. */
export const ContentManagementPage = (): ReactElement => {
  const { user } = useAuth();
  const content = useContent();
  const create = useCreateContent();
  const update = useUpdateContent();
  const remove = useDeleteContent();

  const [query, setQuery] = useState<ContentQuery>(EMPTY_QUERY);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);

  const all = useMemo(() => content.data ?? [], [content.data]);
  const items = useMemo(() => filterContent(all, query), [all, query]);
  const types = useMemo(() => distinctTypes(all), [all]);
  const busyId = remove.isPending ? remove.variables : null;

  const openCreate = (): void => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (item: ContentItem): void => {
    setEditing(item);
    setModalOpen(true);
  };
  const close = (): void => {
    setModalOpen(false);
  };

  const submit = (values: ContentFormValues): void => {
    const options = { onSuccess: close };
    if (editing !== null) {
      update.mutate({ id: editing.id, ...values }, options);
      return;
    }
    create.mutate({ ...values, author: user?.fullName ?? 'Unknown' }, options);
  };

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Content Management"
        subtitle="Manage all content across the platform"
      >
        <Button onClick={openCreate}>
          <Plus size={16} aria-hidden="true" /> New content
        </Button>
      </PageHeader>

      <ContentFilters query={query} types={types} onChange={setQuery} />

      <ContentResults
        items={items}
        isLoading={content.isLoading}
        error={content.isError ? content.error : null}
        busyId={busyId}
        onEdit={openEdit}
        onDelete={(id) => {
          remove.mutate(id);
        }}
        onClearFilters={() => {
          setQuery(EMPTY_QUERY);
        }}
      />

      <ContentFormModal
        key={editing?.id ?? 'new'}
        open={modalOpen}
        editing={editing}
        isSubmitting={create.isPending || update.isPending}
        onClose={close}
        onSubmit={submit}
      />
    </section>
  );
};
