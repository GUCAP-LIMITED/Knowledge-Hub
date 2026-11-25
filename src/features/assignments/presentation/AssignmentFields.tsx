import { useState, type ReactElement } from 'react';
import { Button, IconButton } from '@shared/ui';
import { BookOpen, FolderOpen, Lightbulb, Plus, Trash2 } from 'lucide-react';
import { CONTENT_TYPE } from '@features/content';
import { cn } from '@shared/utils';
import type { AssigneeCategory } from '../domain';
import { AssigneeSelect } from './AssigneeSelect';
import { ContentSelect } from './ContentSelect';
import styles from './AssignTrainingPage.module.css';

export interface FormAssignee {
  id: number;
  category: AssigneeCategory;
  targetId: string;
  displayName: string;
  email?: string | undefined;
}

export interface FormState {
  contentItemId: string;
  assignees: FormAssignee[];
  dueDate: string;
}

type ContentFilterType = 'all' | 'courses' | 'tutorials' | 'resources';

interface ContentTypeFilterConfig {
  readonly key: ContentFilterType;
  readonly label: string;
  readonly icon: typeof BookOpen | null;
  readonly typeVal?: number;
}

const TYPE_CONFIG: readonly ContentTypeFilterConfig[] = [
  { key: 'all', label: 'All', icon: null },
  { key: 'courses', label: 'Courses', icon: BookOpen, typeVal: CONTENT_TYPE.course },
  {
    key: 'tutorials',
    label: 'Tutorials',
    icon: Lightbulb,
    typeVal: CONTENT_TYPE.tutorial,
  },
  {
    key: 'resources',
    label: 'Resources',
    icon: FolderOpen,
    typeVal: CONTENT_TYPE.resource,
  },
];

const AssigneeRow = ({
  assignee,
  disabledTargetIds,
  onChange,
  onRemove,
  canRemove,
}: {
  readonly assignee: FormAssignee;
  readonly disabledTargetIds: ReadonlySet<string>;
  readonly onChange: (updated: FormAssignee) => void;
  readonly onRemove: () => void;
  readonly canRemove: boolean;
}): ReactElement => (
  <div
    style={{
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'flex-end',
      marginBottom: '0.5rem',
    }}
  >
    <div style={{ flex: 1 }}>
      <AssigneeSelect
        value={{
          category: assignee.category,
          targetId: assignee.targetId,
          displayName: assignee.displayName,
          email: assignee.email,
        }}
        disabledTargetIds={disabledTargetIds}
        onChange={(selection) => {
          onChange({
            ...assignee,
            category: selection.category,
            targetId: selection.targetId,
            displayName: selection.displayName,
            email: selection.email,
          });
        }}
      />
    </div>
    <div style={{ paddingBottom: '2px' }}>
      <IconButton label="Remove" onClick={onRemove} disabled={!canRemove}>
        <Trash2 size={20} />
      </IconButton>
    </div>
  </div>
);

const TypeFilterPills = ({
  filter,
  onSelectFilter,
}: {
  readonly filter: ContentFilterType;
  readonly onSelectFilter: (filter: ContentFilterType) => void;
}): ReactElement => (
  <div className={styles.typeFilterGroup}>
    <span className={styles.label}>Content type</span>
    <div className={styles.typePills} role="group" aria-label="Filter content by type">
      {TYPE_CONFIG.map((cfg) => {
        const Icon = cfg.icon;
        return (
          <button
            key={cfg.key}
            type="button"
            className={cn(styles.typePill, filter === cfg.key && styles.typePillActive)}
            onClick={() => {
              onSelectFilter(cfg.key);
            }}
          >
            {Icon ? <Icon size={14} aria-hidden="true" /> : null}
            <span>{cfg.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const AssigneeListSection = ({
  assignees,
  onChange,
  onAdd,
  onRemove,
}: {
  readonly assignees: readonly FormAssignee[];
  readonly onChange: (updated: FormAssignee) => void;
  readonly onAdd: () => void;
  readonly onRemove: (id: number) => void;
}): ReactElement => {
  const selectedTargetIds = new Set(
    assignees.map((a) => a.targetId).filter((id) => id.length > 0),
  );

  return (
    <div className={styles.field}>
      <label className={styles.label}>Assignees</label>
      {assignees.map((assignee) => {
        const otherTargetIds = new Set(selectedTargetIds);
        otherTargetIds.delete(assignee.targetId);

        return (
          <AssigneeRow
            key={assignee.id}
            assignee={assignee}
            disabledTargetIds={otherTargetIds}
            onChange={onChange}
            onRemove={() => {
              onRemove(assignee.id);
            }}
            canRemove={assignees.length > 1}
          />
        );
      })}
      <Button variant="outline" size="sm" onClick={onAdd} style={{ marginTop: '0.5rem' }}>
        <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Assignee
      </Button>
    </div>
  );
};

export interface AssignmentFieldsProps {
  readonly form: FormState;
  readonly onChange: (form: FormState) => void;
  readonly onAddAssignee: () => void;
  readonly onRemoveAssignee: (id: number) => void;
}

export const AssignmentFields = ({
  form,
  onChange,
  onAddAssignee,
  onRemoveAssignee,
}: AssignmentFieldsProps): ReactElement => {
  const [filter, setFilter] = useState<ContentFilterType>('all');

  const selectedConfig = TYPE_CONFIG.find((c) => c.key === filter);
  const typeFilter = selectedConfig?.typeVal;

  const handleAssigneeChange = (updated: FormAssignee): void => {
    onChange({
      ...form,
      assignees: form.assignees.map((a) => (a.id === updated.id ? updated : a)),
    });
  };

  return (
    <div className={styles.form}>
      <TypeFilterPills filter={filter} onSelectFilter={setFilter} />

      <ContentSelect
        value={form.contentItemId}
        typeFilter={typeFilter}
        onChange={(id) => {
          onChange({ ...form, contentItemId: id });
        }}
      />

      <AssigneeListSection
        assignees={form.assignees}
        onChange={handleAssigneeChange}
        onAdd={onAddAssignee}
        onRemove={onRemoveAssignee}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="assign-due">
          Due date
        </label>
        <input
          id="assign-due"
          type="date"
          className={styles.dateInput}
          value={form.dueDate}
          onChange={(event) => {
            onChange({ ...form, dueDate: event.target.value });
          }}
        />
      </div>
    </div>
  );
};
