import { forwardRef, useId, type InputHTMLAttributes, type ReactElement } from 'react';
import { cn } from '@shared/utils';
import styles from './TextField.module.css';

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id'
> {
  readonly label: string;
  readonly error?: string;
}

/**
 * Labelled text input with an inline error slot. Forwards its `ref` to the underlying `<input>` so
 * it drops straight into react-hook-form (`{...register('field')}`).
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, className, ...rest }, ref): ReactElement => {
    const id = useId();
    const errorId = `${id}-error`;
    const hasError = error !== undefined && error.length > 0;

    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          className={cn(styles.input, hasError && styles.invalid, className)}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...rest}
        />
        {hasError ? (
          <span id={errorId} className={styles.error}>
            {error}
          </span>
        ) : null}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
