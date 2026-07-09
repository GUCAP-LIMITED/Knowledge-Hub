import type { ReactElement, ReactNode } from 'react';
import { cn } from '@shared/utils';
import styles from './Alert.module.css';

export type AlertTone = 'error' | 'info' | 'success' | 'warning';

export interface AlertProps {
  readonly tone?: AlertTone;
  readonly title?: string;
  readonly children: ReactNode;
}

export const Alert = ({ tone = 'info', title, children }: AlertProps): ReactElement => {
  return (
    <div
      className={cn(styles.alert, styles[tone])}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div>
        {title !== undefined ? <p className={styles.title}>{title}</p> : null}
        <p className={styles.body}>{children}</p>
      </div>
    </div>
  );
};
