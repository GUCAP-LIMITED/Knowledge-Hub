import type { ReactElement } from 'react';
import { Toggle } from '@shared/ui';
import type { PermissionModule } from './permission-modules';
import styles from './AdminSettingsPage.module.css';

export interface PermissionDetailProps {
  readonly module: PermissionModule;
  readonly state: Record<string, boolean>;
  readonly onToggle: (permId: string, value: boolean) => void;
}

/** Base + granular permission editor for one module. */
export const PermissionDetail = ({
  module,
  state,
  onToggle,
}: PermissionDetailProps): ReactElement => {
  const baseOn = state[module.base.id] === true;
  return (
    <div className={styles.detail}>
      <div className={styles.detailBase}>
        <span className={styles.requiredBadge}>Required</span>
        <Toggle
          label={`${module.label} — ${module.base.label}`}
          description={module.base.desc}
          checked={baseOn}
          onChange={(value) => {
            onToggle(module.base.id, value);
          }}
        />
      </div>
      <div className={styles.granularGrid}>
        {module.granular.map((permission) => (
          <div key={permission.id} className={styles.granularCell}>
            <Toggle
              label={permission.label}
              description={`${permission.desc} · Requires ${module.base.label}`}
              checked={state[permission.id] === true}
              onChange={(value) => {
                onToggle(permission.id, value);
              }}
            />
            {baseOn ? null : <div className={styles.disabledMask} />}
          </div>
        ))}
      </div>
    </div>
  );
};
