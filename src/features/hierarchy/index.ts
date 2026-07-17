/**
 * Public API of the hierarchy feature. Other features and the app shell import ONLY from here.
 */
export {
  createHierarchyModule,
  type HierarchyModule,
  type HierarchyModuleDeps,
} from './hierarchy-module';
export {
  HierarchyModuleProvider,
  useBranchTree,
  useBranchEdges,
  useAssignManager,
  useRemoveOverride,
  hierarchyKeys,
} from './presentation';
export type { HierarchyNode, HierarchyEdge } from './domain';

// NOTE: HierarchyPage is intentionally NOT re-exported — the router lazy-loads it from its module path
// so it can be code-split into its own chunk.
