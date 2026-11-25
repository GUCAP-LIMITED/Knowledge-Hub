import type { ReactElement } from 'react';
import { CheckCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, IconButton } from '@shared/ui';
import { cn, formatUserType } from '@shared/utils';
import { useMyCapabilities } from '@features/users';
import type { UserTypeHierarchyNode } from '../domain';
import { getNodeColor, getNodeIcon } from './user-type-constants';
import styles from './UserTypesPage.module.css';

export interface UserTypeHierarchyTreeProps {
  readonly flatNodes: readonly UserTypeHierarchyNode[];
  readonly selectedInsertIndex: number | null;
  readonly onSelectInsertIndex: (index: number) => void;
  readonly newRoleName: string;
  readonly activeEditId?: string | null | undefined;
  readonly editingRoleName?: string | null | undefined;
  readonly isApexRoleEditing?: boolean | undefined;
  readonly onEdit: (node: UserTypeHierarchyNode) => void;
  readonly onDelete: (node: UserTypeHierarchyNode) => void;
}

const NodeLeadSection = ({
  node,
  isActiveEdit,
}: {
  readonly node: UserTypeHierarchyNode;
  readonly isActiveEdit: boolean;
}): ReactElement => {
  const color = getNodeColor(node.userTypeName);
  const Icon = getNodeIcon(node.userTypeName);
  const reportsLabel =
    node.reportsTo === 'Top of Hierarchy' ||
    node.reportsTo === null ||
    node.reportsTo === undefined
      ? 'Top of Hierarchy'
      : formatUserType(node.reportsTo);

  return (
    <div className={styles.nodeLead}>
      <div
        className={styles.nodeIconBox}
        style={{ backgroundColor: color.bg, color: color.color }}
      >
        <Icon size={18} aria-hidden />
      </div>
      <div className={styles.nodeInfo}>
        <div className={styles.nodeTitleRow}>
          <span className={styles.nodeName}>{formatUserType(node.userTypeName)}</span>
          {isActiveEdit ? (
            <Badge tone="primary" size="sm">
              Editing
            </Badge>
          ) : null}
          <Badge tone={node.canLogin ? 'success' : 'danger'} size="sm">
            {node.canLogin ? 'Login: Allowed' : 'Login: Disallowed'}
          </Badge>
        </div>
        <span className={styles.nodeSub}>
          Level {String(node.hierarchyLevel)} • {reportsLabel}
        </span>
      </div>
    </div>
  );
};

const isApexUserTypeNode = (node: UserTypeHierarchyNode, isTop: boolean): boolean =>
  isTop ||
  node.reportsTo === 'Top of Hierarchy' ||
  (Boolean(node.isDefault) &&
    (node.userTypeName === 'System Admin' || node.userTypeName === 'SystemAdmin'));

const NodeActionsSection = ({
  node,
  canEdit,
  canDelete,
  isApex,
  onEdit,
  onDelete,
}: {
  readonly node: UserTypeHierarchyNode;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly isApex: boolean;
  readonly onEdit: (n: UserTypeHierarchyNode) => void;
  readonly onDelete: (n: UserTypeHierarchyNode) => void;
}): ReactElement => (
  <div className={styles.nodeActions}>
    {canEdit && !isApex ? (
      <IconButton
        label={`Edit ${formatUserType(node.userTypeName)}`}
        variant="ghost"
        onClick={() => {
          onEdit(node);
        }}
      >
        <Pencil size={15} aria-hidden />
      </IconButton>
    ) : null}

    {canDelete && !node.isDefault ? (
      <IconButton
        label={`Delete ${formatUserType(node.userTypeName)}`}
        variant="danger"
        onClick={() => {
          onDelete(node);
        }}
      >
        <Trash2 size={15} aria-hidden />
      </IconButton>
    ) : null}
  </div>
);

const HierarchyNodeCard = ({
  node,
  canEdit,
  canDelete,
  isActiveEdit,
  isDimmed,
  isApex,
  onEdit,
  onDelete,
}: {
  readonly node: UserTypeHierarchyNode;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly isActiveEdit: boolean;
  readonly isDimmed: boolean;
  readonly isApex: boolean;
  readonly onEdit: (n: UserTypeHierarchyNode) => void;
  readonly onDelete: (n: UserTypeHierarchyNode) => void;
}): ReactElement => (
  <div
    className={cn(
      styles.nodeCard,
      isActiveEdit && styles.nodeCardActive,
      isDimmed && styles.nodeCardDimmed,
    )}
  >
    <NodeLeadSection node={node} isActiveEdit={isActiveEdit} />
    <NodeActionsSection
      node={node}
      canEdit={canEdit}
      canDelete={canDelete}
      isApex={isApex}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  </div>
);

const SlotButtonContent = ({
  isSelected,
  isEditMode,
  editingName,
  newRoleName,
  nodeName,
  nextLabel,
}: {
  readonly isSelected: boolean;
  readonly isEditMode: boolean;
  readonly editingName: string;
  readonly newRoleName: string;
  readonly nodeName: string;
  readonly nextLabel: string;
}): ReactElement => {
  if (isSelected) {
    const trimmedNewRole = newRoleName.trim();
    const formattedNewRole = trimmedNewRole ? `"${trimmedNewRole}"` : 'New Role';
    const formattedEditRole =
      editingName && editingName !== 'Role' ? `"${editingName}"` : editingName;

    return (
      <>
        <CheckCircle size={14} aria-hidden />
        {isEditMode
          ? `Move ${formattedEditRole} here`
          : `${formattedNewRole} inserted here`}
      </>
    );
  }

  return (
    <>
      <Plus size={14} aria-hidden />
      {isEditMode
        ? `Move between ${nodeName} & ${nextLabel}`
        : `Insert between ${nodeName} & ${nextLabel}`}
    </>
  );
};

const HierarchyInsertSlot = ({
  isSelected,
  newRoleName,
  isEditMode,
  editingRoleName,
  isApexRoleEditing,
  node,
  nextNode,
  onSelect,
}: {
  readonly isSelected: boolean;
  readonly newRoleName: string;
  readonly isEditMode: boolean;
  readonly editingRoleName?: string | null | undefined;
  readonly isApexRoleEditing?: boolean | undefined;
  readonly node: UserTypeHierarchyNode;
  readonly nextNode: UserTypeHierarchyNode | undefined;
  readonly onSelect: () => void;
}): ReactElement => {
  const nextLabel =
    nextNode !== undefined
      ? `${formatUserType(nextNode.userTypeName)}${!nextNode.canLogin ? ' (Login: Disallowed)' : ''}`
      : '(end)';

  const editingName = editingRoleName ? formatUserType(editingRoleName) : 'Role';
  const nodeLabel = `${formatUserType(node.userTypeName)}${!node.canLogin ? ' (Login: Disallowed)' : ''}`;

  return (
    <div className={cn(styles.connectorSection, isEditMode && styles.connectorDimmed)}>
      <div
        className={cn(styles.connectorLine, isSelected && styles.connectorLineActive)}
        aria-hidden
      />
      <button
        type="button"
        disabled={isEditMode && Boolean(isApexRoleEditing)}
        onClick={onSelect}
        className={cn(
          styles.insertBtn,
          isSelected && styles.insertBtnSelected,
          isEditMode && Boolean(isApexRoleEditing) && styles.insertBtnDisabled,
        )}
      >
        <SlotButtonContent
          isSelected={isSelected}
          isEditMode={isEditMode}
          editingName={editingName}
          newRoleName={newRoleName}
          nodeName={nodeLabel}
          nextLabel={nextLabel}
        />
      </button>
      <div
        className={cn(styles.connectorLine, isSelected && styles.connectorLineActive)}
        aria-hidden
      />
    </div>
  );
};

export const UserTypeHierarchyTree = ({
  flatNodes,
  selectedInsertIndex,
  onSelectInsertIndex,
  newRoleName,
  activeEditId,
  editingRoleName,
  isApexRoleEditing,
  onEdit,
  onDelete,
}: UserTypeHierarchyTreeProps): ReactElement => {
  const { can } = useMyCapabilities();
  const canDelete = can('user-types', 'delete');
  const canEdit = can('user-types', 'edit');
  const isEditMode = typeof activeEditId === 'string';

  return (
    <div className={styles.treeList}>
      {flatNodes.map((node, idx) => {
        const isActiveEdit = activeEditId === node.userTypeId;
        const isDimmed = isEditMode && !isActiveEdit;

        return (
          <div key={node.userTypeId} className={styles.nodeItem}>
            <HierarchyNodeCard
              node={node}
              canEdit={canEdit}
              canDelete={canDelete}
              isActiveEdit={isActiveEdit}
              isDimmed={isDimmed}
              isApex={isApexUserTypeNode(node, idx === 0)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
            <HierarchyInsertSlot
              isSelected={selectedInsertIndex === idx}
              newRoleName={newRoleName}
              isEditMode={isEditMode}
              editingRoleName={editingRoleName}
              isApexRoleEditing={isApexRoleEditing}
              node={node}
              nextNode={flatNodes[idx + 1]}
              onSelect={() => {
                onSelectInsertIndex(idx);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
