import { useEffect } from 'react';
import type { UserType, UserTypeHierarchyNode } from '../domain';
import type { FormValues } from './AddUserTypeCard';
import { computeHierarchyLevel } from './user-type-constants';
import type {
  useCreateUserType,
  useDeleteUserType,
  useUpdateUserType,
} from './use-user-types';

export interface SubmitActionParams {
  readonly flatNodes: readonly UserTypeHierarchyNode[];
  readonly selectedInsertIndex: number | null;
  readonly editTarget: UserType | null;
  readonly createMutation: ReturnType<typeof useCreateUserType>;
  readonly updateMutation: ReturnType<typeof useUpdateUserType>;
  readonly onSuccessCreate: () => void;
  readonly onSuccessUpdate: () => void;
}

export function useSubmitAction({
  flatNodes,
  selectedInsertIndex,
  editTarget,
  createMutation,
  updateMutation,
  onSuccessCreate,
  onSuccessUpdate,
}: SubmitActionParams): (values: FormValues) => void {
  const handleCreate = (values: FormValues): void => {
    if (selectedInsertIndex === null) return;
    const hierarchyLevel = computeHierarchyLevel(flatNodes, selectedInsertIndex);
    createMutation.mutate(
      {
        name: values.name,
        description: values.description,
        displayOrder: 0,
        isAdmin: values.isAdmin,
        hierarchyLevel,
        dataAccessScope: values.dataAccessScope,
      },
      { onSuccess: onSuccessCreate },
    );
  };

  const handleUpdate = (values: FormValues): void => {
    if (editTarget === null) return;
    const hierarchyLevel =
      selectedInsertIndex !== null
        ? computeHierarchyLevel(flatNodes, selectedInsertIndex, editTarget.id)
        : editTarget.hierarchyLevel;

    updateMutation.mutate(
      {
        id: editTarget.id,
        input: {
          name: values.name,
          description: values.description,
          displayOrder: editTarget.displayOrder,
          canLogin: values.canLogin,
          isAdmin: values.isAdmin,
          hierarchyLevel,
          dataAccessScope: values.dataAccessScope,
        },
      },
      { onSuccess: onSuccessUpdate },
    );
  };

  return (values: FormValues): void => {
    if (editTarget !== null) {
      handleUpdate(values);
    } else {
      handleCreate(values);
    }
  };
}

export interface ReconcileParams {
  readonly editTargetId: string | undefined;
  readonly isSuccess: boolean;
  readonly userTypes: readonly UserType[] | undefined;
  readonly onReconcileExit: () => void;
}

export function useReconcileEditTarget({
  editTargetId,
  isSuccess,
  userTypes,
  onReconcileExit,
}: ReconcileParams): void {
  useEffect(() => {
    if (editTargetId !== undefined && isSuccess) {
      const exists = userTypes?.some((u) => u.id === editTargetId);
      if (!exists) {
        onReconcileExit();
      }
    }
  }, [editTargetId, isSuccess, userTypes, onReconcileExit]);
}

export interface DeleteActionsParams {
  readonly userTypes: readonly UserType[] | undefined;
  readonly editTargetId: string | undefined;
  readonly selectedInsertIndex: number | null;
  readonly deleteMutation: ReturnType<typeof useDeleteUserType>;
  readonly setPendingDelete: (target: UserType | null) => void;
  readonly onExitEdit: () => void;
  readonly onResetInsertIndex: () => void;
}

export interface DeleteActionsReturn {
  readonly handleDeleteNode: (node: UserTypeHierarchyNode) => void;
  readonly handleDeleteConfirm: (id: string) => void;
  readonly handleDeleteClose: () => void;
}

export function useDeleteActions({
  userTypes,
  editTargetId,
  selectedInsertIndex,
  deleteMutation,
  setPendingDelete,
  onExitEdit,
  onResetInsertIndex,
}: DeleteActionsParams): DeleteActionsReturn {
  const handleDeleteNode = (node: UserTypeHierarchyNode): void => {
    const full = userTypes?.find((u) => u.id === node.userTypeId);
    if (full !== undefined) {
      setPendingDelete(full);
    }
  };

  const handleDeleteConfirm = (id: string): void => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (editTargetId === id) {
          onExitEdit();
        } else if (selectedInsertIndex !== null) {
          onResetInsertIndex();
        }
      },
      onSettled: () => {
        setPendingDelete(null);
      },
    });
  };

  const handleDeleteClose = (): void => {
    setPendingDelete(null);
  };

  return { handleDeleteNode, handleDeleteConfirm, handleDeleteClose };
}
