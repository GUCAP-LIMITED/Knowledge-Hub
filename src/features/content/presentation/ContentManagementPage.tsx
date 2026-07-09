import { useMemo, useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, PageHeader } from '@shared/ui';
import type { ContentItem } from '../domain';
import { useContent, useDeleteContent, useUpdateContent } from './use-content';
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

/**
 * Admin content library: browse/filter existing content, edit its metadata, publish-via-status
 * and delete. Authoring brand-new content happens in the shared upload wizard — "New content"
 * launches it, so both entry points converge on one create flow.
 */
export const ContentManagementPage = (): ReactElement => {
  const navigate = useNavigate();
  const content = useContent();
  const update = useUpdateContent();
  const remove = useDeleteContent();

  const [query, setQuery] = useState<ContentQuery>(EMPTY_QUERY);
  const [editing, setEditing] = useState<ContentItem | null>(null);

  const all = useMemo(() => content.data ?? [], [content.data]);
  const items = useMemo(() => filterContent(all, query), [all, query]);
  const types = useMemo(() => distinctTypes(all), [all]);
  const busyId = remove.isPending ? remove.variables : null;

  const submit = (values: ContentFormValues): void => {
    if (editing === null) {
      return;
    }
    update.mutate(
      { id: editing.id, ...values },
      {
        onSuccess: () => {
          setEditing(null);
        },
      },
    );
  };

  return (
    <section className={styles.screen}>
      <PageHeader
        title="Content Management"
        subtitle="Manage all content across the platform"
      >
        <Button
          onClick={() => {
            navigate('/upload');
          }}
        >
          <Plus size={16} aria-hidden="true" /> New content
        </Button>
      </PageHeader>

      <ContentFilters query={query} types={types} onChange={setQuery} />

      <ContentResults
        items={items}
        isLoading={content.isLoading}
        error={content.isError ? content.error : null}
        busyId={busyId}
        onEdit={setEditing}
        onDelete={(id) => {
          remove.mutate(id);
        }}
        onClearFilters={() => {
          setQuery(EMPTY_QUERY);
        }}
      />

      <ContentFormModal
        key={editing?.id ?? 'none'}
        open={editing !== null}
        editing={editing}
        isSubmitting={update.isPending}
        onClose={() => {
          setEditing(null);
        }}
        onSubmit={submit}
      />
    </section>
  );
};
