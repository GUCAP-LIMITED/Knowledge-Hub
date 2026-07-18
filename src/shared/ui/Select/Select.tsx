import {
  forwardRef,
  useId,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { cn } from '@shared/utils';
import styles from './Select.module.css';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  readonly label: string;
  readonly error?: string;
  readonly children: ReactNode;
}

/** Labelled native select with an inline error slot. Forwards its ref for react-hook-form. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, className, children, ...rest }, ref): ReactElement => {
    const id = useId();
    const errorId = `${id}-error`;
    const hasError = error !== undefined && error.length > 0;
    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={id}>
          {label}
          {required === true ? (
            <span className={styles.req} aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
        <select
          id={id}
          ref={ref}
          className={cn(styles.select, hasError && styles.invalid, className)}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...rest}
        >
          {children}
        </select>
        {hasError ? (
          <span id={errorId} className={styles.error}>
            {error}
          </span>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
