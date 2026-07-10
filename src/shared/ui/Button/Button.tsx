import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '@shared/utils';
import { Spinner } from '@shared/ui/Spinner/Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly fullWidth?: boolean;
  readonly children: ReactNode;
}

/**
 * The single button primitive for the whole app. Feature code must use this rather than raw
 * `<button>` so styling, focus, loading and disabled semantics stay consistent everywhere.
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps): ReactElement => {
  return (
    <button
      type={type}
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled === true || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
};
