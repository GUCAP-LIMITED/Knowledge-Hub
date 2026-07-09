import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './Toggle.module.css';

export interface ToggleProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label: string;
  readonly description?: string;
}

/** Labelled on/off switch. */
export const Toggle = ({
  checked,
  onChange,
  label,
  description,
}: ToggleProps): ReactElement => (
  <div className={styles.row}>
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
