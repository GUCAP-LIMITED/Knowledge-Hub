import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '@shared/utils';
import styles from './IconButton.module.css';

export type IconButtonVariant = 'ghost' | 'danger';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name — icon-only buttons have no text content, so this is required. */
  readonly label: string;
  readonly variant?: IconButtonVariant;
  readonly children: ReactNode;
}

/**
 * Square, icon-only button primitive. Forces an accessible `label` so screen readers always have a
 * name, and reuses the token palette for hover/focus states.
 */
export const IconButton = ({
  label,
  variant = 'ghost',
  type = 'button',
  className,
  children,
  ...rest
}: IconButtonProps): ReactElement => {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(styles.iconButton, styles[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
};
