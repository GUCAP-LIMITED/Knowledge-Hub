import type { ReactElement } from 'react';
import { DeleteConfirmDialog } from '@shared/ui';
import { formatUserType } from '@shared/utils';
import { useMyCapabilities } from '@features/users';
import type { UserType, UserTypeHierarchyNode } from '../domain';
import { AddUserTypeCard } from './AddUserTypeCard';
import { TreePanel } from './TreePanel';
import {
  useUserTypesManagerState,
  type UserTypesManagerState,
} from './use-user-types-manager-state';
import styles from './UserTypesPage.module.css';

interface ManagerModalsProps {
  readonly pendingDelete: UserType | null;
  readonly isDeleting: boolean;
  readonly onDeleteConfirm: (id: string) => void;
  readonly onDeleteClose: () => void;
}

const ManagerModals = ({
  pendingDelete,
  isDeleting,
  onDeleteConfirm,
  onDeleteClose,
}: ManagerModalsProps): ReactElement => (
  <DeleteConfirmDialog
    item={
      pendingDelete !== null
        ? { id: pendingDelete.id, title: formatUserType(pendingDelete.name) }
        : null
    }
    noun="user type"
    isBusy={isDeleting}
    onConfirm={onDeleteConfirm}
    onCancel={onDeleteClose}
  />
);

interface ManagerEditorProps {
  readonly state: UserTypesManagerState;
  readonly canEdit: boolean;
  readonly canCreate: boolean;
}

const ManagerEditor = ({
  state,
  canEdit,
  canCreate,
}: ManagerEditorProps): ReactElement | null => {
  const shouldRenderForm = state.editTarget !== null ? canEdit : canCreate;
  if (!shouldRenderForm) {
    return null;
  }

  return (
    <AddUserTypeCard
      key={
        state.editTarget
          ? `edit-${state.editTarget.id}`
          : `create-${String(state.formKey)}`
      }
      editTarget={state.editTarget}
      name={state.editTarget ? state.editRoleName : state.newRoleName}
      onNameChange={state.editTarget ? state.setEditRoleName : state.setNewRoleName}
      selectedNodeName={state.selectedNodeName}
      currentReportsTo={state.currentReportsTo}
      isApexRole={state.isApexRoleEditing}
      existingNames={state.existingNames}
      isSubmitting={
        state.editTarget ? state.updateMutation.isPending : state.createMutation.isPending
      }
      onSubmit={state.handleFormSubmit}
      onReset={state.resetInsertIndex}
      onCancelEdit={state.handleCancelEdit}
      onRevertPosition={state.handleRevertPosition}
    />
  );
};

export const UserTypesManager = (): ReactElement => {
  const { can } = useMyCapabilities();
  const canEdit = can('user-types', 'edit');
  const canCreate = can('user-types', 'create');

  const state = useUserTypesManagerState();

  const handleEdit = (node: UserTypeHierarchyNode): void => {
    if (
      node.reportsTo === 'Top of Hierarchy' ||
      (Boolean(node.isDefault) &&
        (node.userTypeName === 'System Admin' || node.userTypeName === 'SystemAdmin'))
    ) {
      return;
    }
    const full = state.userTypesQuery.data?.find((u) => u.id === node.userTypeId);
    if (full !== undefined) {
      state.setEditTarget(full);
      state.setEditRoleName(full.name);
      state.handleRevertPosition();
    }
  };

  return (
    <div className={styles.layout}>
      <ManagerEditor state={state} canEdit={canEdit} canCreate={canCreate} />

      <TreePanel
        isPending={state.hierarchyQuery.isPending}
        isError={state.hierarchyQuery.isError}
        errorMessage={state.hierarchyQuery.error?.message}
        flatNodes={state.flatNodes}
        selectedInsertIndex={state.selectedInsertIndex}
        onSelectInsertIndex={state.toggleInsertIndex}
        newRoleName={state.newRoleName}
        activeEditId={state.editTarget?.id}
        editingRoleName={state.editTarget ? state.editRoleName : null}
        isApexRoleEditing={state.isApexRoleEditing}
        onEdit={handleEdit}
        onDelete={state.handleDeleteNode}
      />

      <ManagerModals
        pendingDelete={state.pendingDelete}
        isDeleting={state.deleteMutation.isPending}
        onDeleteConfirm={state.handleDeleteConfirm}
        onDeleteClose={state.handleDeleteClose}
      />
    </div>
  );
};
