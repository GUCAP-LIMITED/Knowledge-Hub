import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './Toggle.module.css';

export interface ToggleProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label: string;
  readonly description?: string;
  /** Drops the row's built-in vertical padding, for callers that supply their own (e.g. a bordered wrapper). */
  readonly compact?: boolean;
}

/** Labelled on/off switch. */
export const Toggle = ({
  checked,
  onChange,
  label,
  description,
  compact = false,
}: ToggleProps): ReactElement => (
  <div className={cn(styles.row, compact && styles.compact)}>
    <div className={styles.text}>
      <div className={styles.label}>{label}</div>
      {description !== undefined ? (
        <div className={styles.desc}>{description}</div>
      ) : null}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn(styles.switch, checked && styles.on)}
      onClick={() => {
        onChange(!checked);
      }}
    >
      <span className={styles.knob} />
    </button>
  </div>
);
