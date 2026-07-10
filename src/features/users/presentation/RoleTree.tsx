import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import { type PermissionMatrix, ROLES, countGrants } from './role-permissions-model';
import styles from './RolePermissions.module.css';

export interface RoleTreeProps {
  readonly activeId: string;
  readonly matrix: PermissionMatrix;
  readonly onSelect: (roleId: string) => void;
}

/** The org-chart hierarchy, indented by level, with a per-role grant count. Selectable. */
export const RoleTree = ({ activeId, matrix, onSelect }: RoleTreeProps): ReactElement => (
  <div className={styles.tree} role="tablist" aria-label="Roles">
    {ROLES.map((role) => (
      <button
        key={role.id}
        type="button"
        role="tab"
        aria-selected={activeId === role.id}
        className={cn(styles.roleRow, activeId === role.id && styles.roleActive)}
        style={{ paddingLeft: `${String(0.7 + (role.level - 1) * 1.1)}rem` }}
        onClick={() => {
          onSelect(role.id);
        }}
      >
        <span className={styles.roleDot} aria-hidden="true" />
        <span className={styles.roleBody}>
          <span className={styles.roleLabel}>{role.label}</span>
          <span className={styles.roleDesc}>{role.description}</span>
        </span>
        <span className={styles.roleCount}>{countGrants(matrix, role.id)}</span>
      </button>
    ))}
  </div>
);
