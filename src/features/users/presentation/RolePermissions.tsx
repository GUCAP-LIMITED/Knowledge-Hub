import { useState, type ReactElement } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@shared/ui';
import { ROLES } from './role-permissions-model';
import { useRolePermissions } from './use-role-permissions';
import { RoleTree } from './RoleTree';
import { CapabilityMatrix } from './CapabilityMatrix';
import styles from './RolePermissions.module.css';

/** Granular permissions: an org role hierarchy + a per-role capability matrix. */
export const RolePermissions = (): ReactElement => {
  const matrix = useRolePermissions((s) => s.matrix);
  const toggle = useRolePermissions((s) => s.toggle);
  const setModule = useRolePermissions((s) => s.setModule);
  const resetRole = useRolePermissions((s) => s.resetRole);
  const [activeId, setActiveId] = useState('ceo');
  const role = ROLES.find((r) => r.id === activeId) ?? ROLES[0];

  if (role === undefined) {
    return <p>No roles defined.</p>;
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.lead}>
        Access follows the org hierarchy — higher roles inherit broader defaults.
        Fine-tune any role&apos;s capabilities per module below.
      </p>
      <div className={styles.layout}>
        <div className={styles.side}>
          <span className={styles.sideHead}>Roles</span>
          <RoleTree activeId={activeId} matrix={matrix} onSelect={setActiveId} />
        </div>
        <div className={styles.detail}>
          <div className={styles.detailHead}>
            <div>
              <h3 className={styles.detailTitle}>{role.label}</h3>
              <p className={styles.detailDesc}>
                Level {role.level} · {role.description}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                resetRole(role.id);
              }}
            >
              <RotateCcw size={14} aria-hidden="true" /> Reset to default
            </Button>
          </div>
          <CapabilityMatrix
            roleId={role.id}
            matrix={matrix}
            onToggle={(moduleId, cap) => {
              toggle(role.id, moduleId, cap);
            }}
            onSetModule={(moduleId, caps, on) => {
              setModule(role.id, moduleId, caps, on);
            }}
          />
        </div>
      </div>
    </div>
  );
};
