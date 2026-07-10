import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type CapId,
  type PermissionMatrix,
  ROLES,
  buildDefaultMatrix,
  defaultGrant,
} from './role-permissions-model';

const STORAGE_KEY = 'kh.role-permissions.v1';

export interface RolePermissionsState {
  readonly matrix: PermissionMatrix;
  /** Flip a single capability for a role + module. */
  readonly toggle: (roleId: string, moduleId: string, cap: CapId) => void;
  /** Grant or clear every capability of one module for a role (row toggle). */
  readonly setModule: (
    roleId: string,
    moduleId: string,
    caps: readonly CapId[],
    on: boolean,
  ) => void;
  /** Reset one role to the seeded defaults. */
  readonly resetRole: (roleId: string) => void;
  /** Reset the whole matrix to the seeded defaults. */
  readonly resetAll: () => void;
}

const defaultRole = (roleId: string): Record<string, Partial<Record<CapId, boolean>>> =>
  buildDefaultMatrix()[roleId] ?? {};

/**
 * Client-only store for the role → module → capability matrix. No backend yet, so overrides live
 * in localStorage; the Permissions screen edits them.
 */
export const useRolePermissions = create<RolePermissionsState>()(
  persist(
    (set) => ({
      matrix: buildDefaultMatrix(),
      toggle: (roleId, moduleId, cap): void => {
        set((state) => {
          const role = state.matrix[roleId] ?? {};
          const module = role[moduleId] ?? {};
          return {
            matrix: {
              ...state.matrix,
              [roleId]: {
                ...role,
                [moduleId]: { ...module, [cap]: !(module[cap] ?? false) },
              },
            },
          };
        });
      },
      setModule: (roleId, moduleId, caps, on): void => {
        set((state) => {
          const role = state.matrix[roleId] ?? {};
          const next: Partial<Record<CapId, boolean>> = {};
          for (const cap of caps) {
            next[cap] = on;
          }
          return {
            matrix: { ...state.matrix, [roleId]: { ...role, [moduleId]: next } },
          };
        });
      },
      resetRole: (roleId): void => {
        set((state) => ({
          matrix: { ...state.matrix, [roleId]: defaultRole(roleId) },
        }));
      },
      resetAll: (): void => {
        set({ matrix: buildDefaultMatrix() });
      },
    }),
    { name: STORAGE_KEY },
  ),
);

/** Whether a role has a given capability (used by the app to gate actions, if wired later). */
export const roleCan = (
  matrix: PermissionMatrix,
  roleId: string,
  moduleId: string,
  cap: CapId,
): boolean => matrix[roleId]?.[moduleId]?.[cap] ?? false;

/** The seeded default for a role/capability — used to show "changed from default" hints. */
export const isDefault = (roleId: string, cap: CapId, value: boolean): boolean => {
  const role = ROLES.find((r) => r.id === roleId);
  return role !== undefined && defaultGrant(role.level, cap) === value;
};
