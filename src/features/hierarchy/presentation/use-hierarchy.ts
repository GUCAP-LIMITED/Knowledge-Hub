import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type {
  AssignManagerInput,
  EdgeKey,
  HierarchyEdge,
  HierarchyNode,
} from '../domain';
import { useHierarchyModule } from './use-hierarchy-module';

export const hierarchyKeys = {
  tree: (branchId: string) => ['hierarchy', 'tree', branchId] as const,
  edges: (branchId: string) => ['hierarchy', 'edges', branchId] as const,
};

export const useBranchTree = (
  branchId: string,
): UseQueryResult<readonly HierarchyNode[]> => {
  const { getBranchTree } = useHierarchyModule();
  return useQuery({
    queryKey: hierarchyKeys.tree(branchId),
    enabled: branchId.length > 0,
    queryFn: async (): Promise<readonly HierarchyNode[]> => {
      const result = await getBranchTree.execute(branchId);
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export const useBranchEdges = (
  branchId: string,
): UseQueryResult<readonly HierarchyEdge[]> => {
  const { listEdges } = useHierarchyModule();
  return useQuery({
    queryKey: hierarchyKeys.edges(branchId),
    enabled: branchId.length > 0,
    queryFn: async (): Promise<readonly HierarchyEdge[]> => {
      const result = await listEdges.execute(branchId);
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export const useAssignManager = (): UseMutationResult<
  HierarchyEdge,
  Error,
  AssignManagerInput
> => {
  const { assignManager } = useHierarchyModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AssignManagerInput): Promise<HierarchyEdge> => {
      const result = await assignManager.execute(input);
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: (_edge, input) => {
      void queryClient.invalidateQueries({
        queryKey: hierarchyKeys.tree(input.branchId),
      });
      void queryClient.invalidateQueries({
        queryKey: hierarchyKeys.edges(input.branchId),
      });
    },
  });
};

export const useRemoveOverride = (): UseMutationResult<void, Error, EdgeKey> => {
  const { removeOverride } = useHierarchyModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: EdgeKey): Promise<void> => {
      const result = await removeOverride.execute(key);
      if (isErr(result)) throw result.error;
    },
    onSuccess: (_void, key) => {
      void queryClient.invalidateQueries({ queryKey: hierarchyKeys.tree(key.branchId) });
      void queryClient.invalidateQueries({ queryKey: hierarchyKeys.edges(key.branchId) });
    },
  });
};
