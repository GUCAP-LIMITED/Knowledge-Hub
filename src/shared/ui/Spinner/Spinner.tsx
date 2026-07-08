import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly label?: string;
}

export const Spinner = ({
  size = 'md',
  label = 'Loading',
}: SpinnerProps): ReactElement => {
  return (
    <span className={cn(styles.spinner, styles[size])} role="status" aria-label={label} />
  );
};
