import { describe, expect, it, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UserType, type UserTypeHierarchyNode } from '../domain';
import { useUserTypesManagerState } from './use-user-types-manager-state';
import * as useUserTypesHooks from './use-user-types';

vi.mock('./use-user-types', () => ({
  useUserTypeHierarchy: vi.fn(),
  useUserTypes: vi.fn(),
  useCreateUserType: vi.fn(),
  useUpdateUserType: vi.fn(),
  useDeleteUserType: vi.fn(),
}));

interface DeleteMutationOptions {
  readonly onSuccess?: () => void;
  readonly onSettled?: () => void;
}

type DeleteMutateFn = (id: string, options?: DeleteMutationOptions) => void;

const createMockUserType = (id: string, name: string, hierarchyLevel = 1): UserType =>
  new UserType({
    id,
    name,
    description: null,
    canLogin: true,
    isAdmin: false,
    displayOrder: 0,
    hierarchyLevel,
    dataAccessScope: 0,
    isDefault: false,
    refId: null,
    createdAt: new Date(),
    roles: [],
  });

describe('useUserTypesManagerState - Deletion lifecycle', () => {
  const mockMutateDelete = vi.fn<DeleteMutateFn>();
  let mockUserTypes: UserType[];
  let mockHierarchyNodes: UserTypeHierarchyNode[];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserTypes = [
      createMockUserType('qwe-id', 'Qwe', 2),
      createMockUserType('other-id', 'Other Role', 1),
    ];

    mockHierarchyNodes = [
      {
        userTypeId: 'qwe-id',
        userTypeName: 'Qwe',
        hierarchyLevel: 2,
        canLogin: true,
        reportsTo: 'Top of Hierarchy',
        reports: [],
      },
      {
        userTypeId: 'other-id',
        userTypeName: 'Other Role',
        hierarchyLevel: 1,
        canLogin: true,
        reportsTo: 'Reports to Qwe',
        reports: [],
      },
    ];

    vi.mocked(useUserTypesHooks.useUserTypes).mockReturnValue({
      data: mockUserTypes,
      isSuccess: true,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useUserTypesHooks.useUserTypes>);

    vi.mocked(useUserTypesHooks.useUserTypeHierarchy).mockReturnValue({
      data: mockHierarchyNodes,
      isSuccess: true,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useUserTypesHooks.useUserTypeHierarchy>);

    vi.mocked(useUserTypesHooks.useCreateUserType).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUserTypesHooks.useCreateUserType>);

    vi.mocked(useUserTypesHooks.useUpdateUserType).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUserTypesHooks.useUpdateUserType>);

    vi.mocked(useUserTypesHooks.useDeleteUserType).mockReturnValue({
      mutate: mockMutateDelete,
      isPending: false,
    } as unknown as ReturnType<typeof useUserTypesHooks.useDeleteUserType>);
  });

  it('exits editing mode immediately when the editing UserType itself is deleted', () => {
    const { result } = renderHook(() => useUserTypesManagerState());

    // Enter edit mode for Qwe
    act(() => {
      result.current.setEditTarget(mockUserTypes[0] ?? null);
      result.current.setEditRoleName('Qwe');
      result.current.toggleInsertIndex(1);
    });

    expect(result.current.editTarget?.id).toBe('qwe-id');
    expect(result.current.editRoleName).toBe('Qwe');
    expect(result.current.selectedInsertIndex).toBe(1);

    // Trigger delete confirmation for Qwe
    act(() => {
      result.current.handleDeleteConfirm('qwe-id');
    });

    expect(mockMutateDelete).toHaveBeenCalledTimes(1);
    const call = mockMutateDelete.mock.calls[0];
    expect(call?.[0]).toBe('qwe-id');

    // Simulate mutation success and settlement
    act(() => {
      call?.[1]?.onSuccess?.();
      call?.[1]?.onSettled?.();
    });

    // Verify edit mode was cleanly exited
    expect(result.current.editTarget).toBeNull();
    expect(result.current.editRoleName).toBe('');
    expect(result.current.selectedInsertIndex).toBeNull();
    expect(result.current.pendingDelete).toBeNull();
  });

  it('preserves editing mode when a different UserType is deleted, but resets provisional slot selection', () => {
    const { result } = renderHook(() => useUserTypesManagerState());

    // Enter edit mode for Qwe with a repositioning index selected
    act(() => {
      result.current.setEditTarget(mockUserTypes[0] ?? null);
      result.current.setEditRoleName('Qwe Updated');
      result.current.toggleInsertIndex(1);
    });

    expect(result.current.editTarget?.id).toBe('qwe-id');
    expect(result.current.selectedInsertIndex).toBe(1);

    // Delete a different user type ('other-id')
    act(() => {
      result.current.handleDeleteConfirm('other-id');
    });

    const call = mockMutateDelete.mock.calls[0];
    expect(call?.[0]).toBe('other-id');

    act(() => {
      call?.[1]?.onSuccess?.();
      call?.[1]?.onSettled?.();
    });

    // Verify Qwe is still being edited, but slot selection is reset to avoid drift
    expect(result.current.editTarget?.id).toBe('qwe-id');
    expect(result.current.editRoleName).toBe('Qwe Updated');
    expect(result.current.selectedInsertIndex).toBeNull();
    expect(result.current.pendingDelete).toBeNull();
  });

  it('keeps editing mode intact if delete mutation fails', () => {
    const { result } = renderHook(() => useUserTypesManagerState());

    act(() => {
      result.current.setEditTarget(mockUserTypes[0] ?? null);
      result.current.setEditRoleName('Qwe');
      result.current.toggleInsertIndex(1);
    });

    act(() => {
      result.current.handleDeleteConfirm('qwe-id');
    });

    const call = mockMutateDelete.mock.calls[0];

    // On failure, only onSettled is called (no onSuccess)
    act(() => {
      call?.[1]?.onSettled?.();
    });

    expect(result.current.editTarget?.id).toBe('qwe-id');
    expect(result.current.editRoleName).toBe('Qwe');
    expect(result.current.selectedInsertIndex).toBe(1);
    expect(result.current.pendingDelete).toBeNull();
  });

  it('sets and clears pendingDelete using handleDeleteNode and handleDeleteClose', () => {
    const { result } = renderHook(() => useUserTypesManagerState());

    const nodeToDelete = mockHierarchyNodes[0];
    expect(nodeToDelete).toBeDefined();

    if (nodeToDelete !== undefined) {
      act(() => {
        result.current.handleDeleteNode(nodeToDelete);
      });
      expect(result.current.pendingDelete?.id).toBe('qwe-id');

      act(() => {
        result.current.handleDeleteClose();
      });
      expect(result.current.pendingDelete).toBeNull();
    }
  });

  it('defensively clears editTarget if the active role disappears from query data', () => {
    const { result, rerender } = renderHook(() => useUserTypesManagerState());

    // Initially editing Qwe
    act(() => {
      result.current.setEditTarget(mockUserTypes[0] ?? null);
      result.current.setEditRoleName('Qwe');
    });
    expect(result.current.editTarget?.id).toBe('qwe-id');

    // Simulate query refetch where Qwe has been removed externally
    vi.mocked(useUserTypesHooks.useUserTypes).mockReturnValue({
      data: [mockUserTypes[1]!], // only 'other-id' remains
      isSuccess: true,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useUserTypesHooks.useUserTypes>);

    rerender();

    // Invariant guard effect should clear editTarget
    expect(result.current.editTarget).toBeNull();
    expect(result.current.editRoleName).toBe('');
    expect(result.current.selectedInsertIndex).toBeNull();
  });
});
