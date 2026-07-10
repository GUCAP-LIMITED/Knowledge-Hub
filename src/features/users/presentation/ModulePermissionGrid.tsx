import type { ReactElement } from 'react';
import { Eye } from 'lucide-react';
import { Switch } from '@shared/ui';
import { cn } from '@shared/utils';
import {
  BASE_CAP,
  CAP_DESC,
  CAP_LABEL,
  type CapId,
  type PermissionModule,
} from './permission-catalog';
import styles from './PermissionSets.module.css';

export interface ModulePermissionGridProps {
  readonly module: PermissionModule;
  readonly caps: Partial<Record<CapId, boolean>>;
  readonly onToggle: (cap: CapId) => void;
}

const GranularCard = ({
  cap,
  on,
  disabled,
  onToggle,
}: {
  readonly cap: CapId;
  readonly on: boolean;
  readonly disabled: boolean;
  readonly onToggle: () => void;
}): ReactElement => (
  <div className={cn(styles.granCard, disabled && styles.granCardOff)}>
    <div className={styles.granText}>
      <span className={styles.granName}>{CAP_LABEL[cap]}</span>
      <span className={styles.granDesc}>{CAP_DESC[cap]}</span>
      <span className={styles.requires}>
        Requires <span className={styles.requiresChip}>{CAP_LABEL[BASE_CAP]}</span>
      </span>
    </div>
    <Switch
      size="sm"
      checked={on}
      disabled={disabled}
      label={CAP_LABEL[cap]}
      onChange={onToggle}
    />
  </div>
);

/** Right pane of the set editor: the base View permission plus the module's granular grid. */
export const ModulePermissionGrid = ({
  module,
  caps,
  onToggle,
}: ModulePermissionGridProps): ReactElement => {
  const Icon = module.icon;
  const viewOn = caps[BASE_CAP] === true;
  const granular = module.capabilities.filter((cap) => cap !== BASE_CAP);
  return (
    <div className={styles.gridPane}>
      <div className={styles.gridHead}>
        <span className={styles.gridIcon}>
          <Icon size={18} aria-hidden="true" />
        </span>
        <div>
          <h4 className={styles.gridTitle}>{module.label}</h4>
          <p className={styles.gridSub}>{module.description}</p>
        </div>
      </div>

      <span className={styles.sectionLabel}>
        Base permission (required for all others)
      </span>
      <div className={styles.baseCard}>
        <span className={styles.baseIcon}>
          <Eye size={16} aria-hidden="true" />
        </span>
        <div className={styles.granText}>
          <span className={styles.granName}>{CAP_LABEL[BASE_CAP]}</span>
          <span className={styles.granDesc}>
            {CAP_DESC[BASE_CAP]} · controls the module&apos;s menu visibility
          </span>
        </div>
        <Switch
          checked={viewOn}
          label={`${module.label} ${CAP_LABEL[BASE_CAP]}`}
          onChange={() => {
            onToggle(BASE_CAP);
          }}
        />
      </div>

      {granular.length > 0 ? (
        <>
          <span className={styles.sectionLabel}>
            Granular permissions (depend on base)
          </span>
          <div className={styles.granGrid}>
            {granular.map((cap) => (
              <GranularCard
                key={cap}
                cap={cap}
                on={caps[cap] === true}
                disabled={!viewOn}
                onToggle={() => {
                  onToggle(cap);
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};
