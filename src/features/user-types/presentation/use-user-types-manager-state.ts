import { useCallback, useMemo, useState } from 'react';
import type { UserType, UserTypeHierarchyNode } from '../domain';
import type { FormValues } from './AddUserTypeCard';
import { flattenHierarchy } from './user-type-constants';
import {
  useCreateUserType,
  useDeleteUserType,
  useUpdateUserType,
  useUserTypeHierarchy,
  useUserTypes,
} from './use-user-types';
import {
  useDeleteActions,
  useReconcileEditTarget,
  useSubmitAction,
} from './use-user-types-manager-actions';

export interface UserTypesManagerState {
  readonly hierarchyQuery: ReturnType<typeof useUserTypeHierarchy>;
  readonly userTypesQuery: ReturnType<typeof useUserTypes>;
  readonly createMutation: ReturnType<typeof useCreateUserType>;
  readonly updateMutation: ReturnType<typeof useUpdateUserType>;
  readonly deleteMutation: ReturnType<typeof useDeleteUserType>;
  readonly newRoleName: string;
  readonly setNewRoleName: (name: string) => void;
  readonly editRoleName: string;
  readonly setEditRoleName: (name: string) => void;
  readonly selectedInsertIndex: number | null;
  readonly toggleInsertIndex: (idx: number) => void;
  readonly resetInsertIndex: () => void;
  readonly formKey: number;
  readonly editTarget: UserType | null;
  readonly setEditTarget: (target: UserType | null) => void;
  readonly pendingDelete: UserType | null;
  readonly setPendingDelete: (target: UserType | null) => void;
  readonly flatNodes: readonly UserTypeHierarchyNode[];
  readonly existingNames: readonly string[];
  readonly selectedNodeName: string | null;
  readonly currentReportsTo: string | null;
  readonly isApexRoleEditing: boolean;
  readonly handleFormSubmit: (values: FormValues) => void;
  readonly handleCancelEdit: () => void;
  readonly handleRevertPosition: () => void;
  readonly handleDeleteNode: (node: UserTypeHierarchyNode) => void;
  readonly handleDeleteConfirm: (id: string) => void;
  readonly handleDeleteClose: () => void;
}

interface RoleSelectionState {
  readonly newRoleName: string;
  readonly setNewRoleName: (name: string) => void;
  readonly editRoleName: string;
  readonly setEditRoleName: (name: string) => void;
  readonly selectedInsertIndex: number | null;
  readonly setSelectedInsertIndex: (
    updater: number | null | ((prev: number | null) => number | null),
  ) => void;
  readonly formKey: number;
  readonly setFormKey: (updater: number | ((prev: number) => number)) => void;
  readonly editTarget: UserType | null;
  readonly setEditTarget: (target: UserType | null) => void;
  readonly pendingDelete: UserType | null;
  readonly setPendingDelete: (target: UserType | null) => void;
}

function useRoleSelectionState(): RoleSelectionState {
  const [newRoleName, setNewRoleName] = useState('');
  const [editRoleName, setEditRoleName] = useState('');
  const [selectedInsertIndex, setSelectedInsertIndex] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [editTarget, setEditTarget] = useState<UserType | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserType | null>(null);

  return {
    newRoleName,
    setNewRoleName,
    editRoleName,
    setEditRoleName,
    selectedInsertIndex,
    setSelectedInsertIndex,
    formKey,
    setFormKey,
    editTarget,
    setEditTarget,
    pendingDelete,
    setPendingDelete,
  };
}

interface DerivedHierarchyProps {
  readonly flatNodes: readonly UserTypeHierarchyNode[];
  readonly editTarget: UserType | null;
  readonly selectedInsertIndex: number | null;
}

interface DerivedHierarchyReturn {
  readonly existingNames: readonly string[];
  readonly selectedNodeName: string | null;
  readonly currentReportsTo: string | null;
  readonly isApexRoleEditing: boolean;
}

function useDerivedHierarchy({
  flatNodes,
  editTarget,
  selectedInsertIndex,
}: DerivedHierarchyProps): DerivedHierarchyReturn {
  const existingNames = useMemo(() => flatNodes.map((n) => n.userTypeName), [flatNodes]);

  const selectedNodeName =
    selectedInsertIndex !== null
      ? (flatNodes[selectedInsertIndex]?.userTypeName ?? null)
      : null;

  const currentReportsTo = useMemo(() => {
    if (editTarget === null) return null;
    return flatNodes.find((n) => n.userTypeId === editTarget.id)?.reportsTo ?? null;
  }, [editTarget, flatNodes]);

  const isApexRoleEditing = useMemo(() => {
    if (editTarget === null) return false;
    return (
      flatNodes[0]?.userTypeId === editTarget.id ||
      (editTarget.isDefault && editTarget.refId === '1') ||
      currentReportsTo === 'Top of Hierarchy'
    );
  }, [editTarget, flatNodes, currentReportsTo]);

  return { existingNames, selectedNodeName, currentReportsTo, isApexRoleEditing };
}

export function useUserTypesManagerState(): UserTypesManagerState {
  const hierarchyQuery = useUserTypeHierarchy();
  const userTypesQuery = useUserTypes();
  const createMutation = useCreateUserType();
  const updateMutation = useUpdateUserType();
  const deleteMutation = useDeleteUserType();
  const selection = useRoleSelectionState();

  const handleCancelEdit = useCallback((): void => {
    selection.setEditTarget(null);
    selection.setSelectedInsertIndex(null);
    selection.setEditRoleName('');
  }, [selection]);

  useReconcileEditTarget({
    editTargetId: selection.editTarget?.id,
    isSuccess: userTypesQuery.isSuccess,
    userTypes: userTypesQuery.data,
    onReconcileExit: handleCancelEdit,
  });

  const deleteActions = useDeleteActions({
    userTypes: userTypesQuery.data,
    editTargetId: selection.editTarget?.id,
    selectedInsertIndex: selection.selectedInsertIndex,
    deleteMutation,
    setPendingDelete: selection.setPendingDelete,
    onExitEdit: handleCancelEdit,
    onResetInsertIndex: () => {
      selection.setSelectedInsertIndex(null);
    },
  });

  const flatNodes = useMemo(
    () => flattenHierarchy(hierarchyQuery.data ?? []),
    [hierarchyQuery.data],
  );

  const derived = useDerivedHierarchy({
    flatNodes,
    editTarget: selection.editTarget,
    selectedInsertIndex: selection.selectedInsertIndex,
  });

  const handleFormSubmit = useSubmitAction({
    flatNodes,
    selectedInsertIndex: selection.selectedInsertIndex,
    editTarget: selection.editTarget,
    createMutation,
    updateMutation,
    onSuccessCreate: () => {
      selection.setNewRoleName('');
      selection.setSelectedInsertIndex(null);
      selection.setFormKey((k) => k + 1);
    },
    onSuccessUpdate: handleCancelEdit,
  });

  return {
    hierarchyQuery,
    userTypesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    ...selection,
    toggleInsertIndex: (idx: number) => {
      selection.setSelectedInsertIndex((prev) => (prev === idx ? null : idx));
    },
    resetInsertIndex: () => {
      selection.setNewRoleName('');
      selection.setSelectedInsertIndex(null);
      selection.setFormKey((k) => k + 1);
    },
    flatNodes,
    ...derived,
    handleFormSubmit,
    handleCancelEdit,
    handleRevertPosition: () => {
      selection.setSelectedInsertIndex(null);
    },
    ...deleteActions,
  };
}
