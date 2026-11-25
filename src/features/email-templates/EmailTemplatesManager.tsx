import { useState, useMemo, type ReactElement } from 'react';
import { ConfirmDialog, EmptyState, Spinner } from '@shared/ui';
import { type EmailTemplate, EmailTemplateKind } from './types';
import { useEmailTemplates } from './use-email-templates';
import { useTemplateActions, type TemplateActions } from './use-template-actions';
import { EmailTemplateEditorModal } from './EmailTemplateEditorModal';
import { TemplateCard } from './TemplateCard';
import {
  TemplatesFilterBar,
  type FilterCounts,
  type FilterTab,
} from './TemplatesFilterBar';
import styles from './EmailTemplatesManager.module.css';

const filterTemplates = (
  templates: readonly EmailTemplate[],
  filter: FilterTab,
  search: string,
): readonly EmailTemplate[] => {
  const query = search.trim().toLowerCase();
  return templates.filter((template) => {
    if (filter === 'email' && template.kind !== EmailTemplateKind.Email) return false;
    if (filter === 'sms' && template.kind !== EmailTemplateKind.Sms) return false;
    if (filter === 'active' && !template.isActive) return false;
    if (filter === 'inactive' && template.isActive) return false;
    if (query) {
      const matchName = template.name.toLowerCase().includes(query);
      const matchBody = template.body.toLowerCase().includes(query);
      return matchName || matchBody;
    }
    return true;
  });
};

const computeFilterCounts = (templates: readonly EmailTemplate[]): FilterCounts => ({
  all: templates.length,
  email: templates.filter((t) => t.kind === EmailTemplateKind.Email).length,
  sms: templates.filter((t) => t.kind === EmailTemplateKind.Sms).length,
  active: templates.filter((t) => t.isActive).length,
  inactive: templates.filter((t) => !t.isActive).length,
});

interface TemplateGridProps {
  readonly templates: readonly EmailTemplate[];
  readonly onToggleActive: (template: EmailTemplate, nextActive: boolean) => void;
  readonly onEdit: (template: EmailTemplate) => void;
  readonly onDelete: (id: string) => void;
}

const TemplateGrid = ({
  templates,
  onToggleActive,
  onEdit,
  onDelete,
}: TemplateGridProps): ReactElement => {
  if (templates.length === 0) {
    return (
      <EmptyState
        title="No templates found"
        description="Try adjusting your filter or search query, or create a new template."
      />
    );
  }

  return (
    <div className={styles.grid}>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onToggleActive={onToggleActive}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

interface TemplateModalsProps {
  readonly actions: TemplateActions;
}

const TemplateModals = ({ actions }: TemplateModalsProps): ReactElement => (
  <>
    <EmailTemplateEditorModal
      open={actions.isModalOpen}
      onOpenChange={actions.setIsModalOpen}
      template={actions.editingTemplate}
      onSave={actions.handleSave}
      isSaving={actions.isSaving}
    />

    <ConfirmDialog
      open={actions.deleteId !== null}
      onCancel={() => {
        actions.setDeleteId(null);
      }}
      title="Delete Template"
      description="Are you sure you want to delete this communication template? This action cannot be undone."
      confirmLabel={actions.isDeleting ? 'Deleting...' : 'Delete'}
      tone="danger"
      onConfirm={actions.handleDeleteConfirm}
      isBusy={actions.isDeleting}
    />
  </>
);

export const EmailTemplatesManager = (): ReactElement => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const { data: templates = [], isLoading, isError } = useEmailTemplates();
  const actions = useTemplateActions();

  const filtered = useMemo(
    () => filterTemplates(templates, filter, search),
    [templates, filter, search],
  );

  const counts = useMemo(() => computeFilterCounts(templates), [templates]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <Spinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="Could not load templates"
          description="Failed to load communication templates from the server. Please try refreshing."
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <TemplatesFilterBar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        onCreate={() => {
          actions.setEditingTemplate(null);
          actions.setIsModalOpen(true);
        }}
      />

      <TemplateGrid
        templates={filtered}
        onToggleActive={actions.handleToggleActive}
        onEdit={(tpl) => {
          actions.setEditingTemplate(tpl);
          actions.setIsModalOpen(true);
        }}
        onDelete={actions.setDeleteId}
      />

      <TemplateModals actions={actions} />
    </div>
  );
};
