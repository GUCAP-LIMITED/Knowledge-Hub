import type { LucideIcon } from 'lucide-react';

export interface Permission {
  readonly id: string;
  readonly label: string;
  readonly desc: string;
  readonly requires?: readonly string[];
}

export interface PermissionModule {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly base: Permission;
  readonly granular: readonly Permission[];
}

/** moduleId → permissionId → enabled. */
export type PermState = Record<string, Record<string, boolean>>;

export interface PermissionSet {
  readonly id: string;
  readonly label: string;
  readonly desc: string;
  readonly perms: PermState;
}
