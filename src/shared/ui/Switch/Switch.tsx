import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './Switch.module.css';

export interface SwitchProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  /** Accessible name — required since the switch renders no visible text. */
  readonly label: string;
  readonly disabled?: boolean;
  readonly size?: 'sm' | 'md';
}

/** A compact, label-less on/off switch for dense grids. Pair it with visible text nearby. */
export const Switch = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
}: SwitchProps): ReactElement => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    className={cn(styles.switch, size === 'sm' && styles.sm, checked && styles.on)}
    onClick={() => {
      onChange(!checked);
    }}
  >
    <span className={styles.knob} />
  </button>
);
