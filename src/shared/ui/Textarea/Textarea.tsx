import { forwardRef, useId, type ReactElement, type TextareaHTMLAttributes } from 'react';
import { cn } from '@shared/utils';
import styles from './Textarea.module.css';

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id'
> {
  readonly label: string;
  readonly error?: string;
}

/** Labelled textarea with an inline error slot. Forwards its ref for react-hook-form. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, rows = 4, ...rest }, ref): ReactElement => {
    const id = useId();
    const errorId = `${id}-error`;
    const hasError = error !== undefined && error.length > 0;
    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          className={cn(styles.textarea, hasError && styles.invalid, className)}
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

Textarea.displayName = 'Textarea';
