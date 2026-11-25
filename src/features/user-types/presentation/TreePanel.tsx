import type { ReactElement } from 'react';
import { Alert, EmptyState, RowListSkeleton } from '@shared/ui';
import type { UserTypeHierarchyNode } from '../domain';
import { UserTypeHierarchyTree } from './UserTypeHierarchyTree';
import styles from './UserTypesPage.module.css';

interface TreeCardBodyProps {
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly errorMessage?: string | undefined;
  readonly flatNodes: readonly UserTypeHierarchyNode[];
  readonly selectedInsertIndex: number | null;
  readonly onSelectInsertIndex: (idx: number) => void;
  readonly newRoleName: string;
  readonly activeEditId?: string | null | undefined;
  readonly editingRoleName?: string | null | undefined;
  readonly isApexRoleEditing?: boolean | undefined;
  readonly onEdit: (node: UserTypeHierarchyNode) => void;
  readonly onDelete: (node: UserTypeHierarchyNode) => void;
}

const TreeCardBody = ({
  isPending,
  isError,
  errorMessage,
  flatNodes,
  selectedInsertIndex,
  onSelectInsertIndex,
  newRoleName,
  activeEditId,
  editingRoleName,
  isApexRoleEditing,
  onEdit,
  onDelete,
}: TreeCardBodyProps): ReactElement => {
  if (isPending) {
    return <RowListSkeleton count={4} trailing />;
  }
  if (isError) {
    return (
      <Alert tone="error" title="Could not load hierarchy">
        {errorMessage ?? 'An error occurred'}
      </Alert>
    );
  }
  if (flatNodes.length === 0) {
    return (
      <EmptyState
        title="No user types in hierarchy"
        description="Create your first role using the form."
      />
    );
  }
  return (
    <UserTypeHierarchyTree
      flatNodes={flatNodes}
      selectedInsertIndex={selectedInsertIndex}
      onSelectInsertIndex={onSelectInsertIndex}
      newRoleName={newRoleName}
      activeEditId={activeEditId}
      editingRoleName={editingRoleName}
      isApexRoleEditing={isApexRoleEditing}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export interface TreePanelProps {
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly errorMessage?: string | undefined;
  readonly flatNodes: readonly UserTypeHierarchyNode[];
  readonly selectedInsertIndex: number | null;
  readonly onSelectInsertIndex: (idx: number) => void;
  readonly newRoleName: string;
  readonly activeEditId?: string | null | undefined;
  readonly editingRoleName?: string | null | undefined;
  readonly isApexRoleEditing?: boolean | undefined;
  readonly onEdit: (node: UserTypeHierarchyNode) => void;
  readonly onDelete: (node: UserTypeHierarchyNode) => void;
}

export const TreePanel = (props: TreePanelProps): ReactElement => (
  <div className={styles.treeCard}>
    <div className={styles.treeHead}>
      <div className={styles.treeTitleRow}>
        <h3 className={styles.treeTitle}>Hierarchy & Insertion Position</h3>
      </div>
      <p className={styles.treeSubtitle}>
        {typeof props.activeEditId === 'string'
          ? 'Click an insertion position to reposition this role, or edit its attributes on the left'
          : 'Click the + Insert Here button where you want to place the new role'}
      </p>
    </div>
    <div className={styles.treeScrollArea}>
      <TreeCardBody {...props} />
    </div>
  </div>
);
