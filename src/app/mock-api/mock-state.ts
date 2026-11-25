import { createPermissionSets, createTypeDefaults } from './seed/permission-sets';

/**
 * The mock backend's mutable world. One instance per app session (created in the composition
 * root), so a page reload resets the demo data — exactly what a stakeholder walkthrough wants.
 */
export interface MockState {
  readonly permissionSets: ReturnType<typeof createPermissionSets>;
  readonly typeDefaults: ReturnType<typeof createTypeDefaults>;
}

export const createMockState = (): MockState => ({
  permissionSets: createPermissionSets(),
  typeDefaults: createTypeDefaults(),
});
