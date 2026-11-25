import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@shared/utils';
import { Spinner } from '@shared/ui/Spinner/Spinner';
import styles from './Button.module.css';

/**
 * The variant set mirrors the sibling Lead-Frontend's shadcn Button (`default`, `destructive`,
 * `outline`, `secondary`, `ghost`, `link`). `accent` is Academy's own extra: the orange
 * secondary-emphasis CTA, reserved for the sanctioned moments in docs/design-accents.md.
 */
export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'accent';
export type ButtonSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'icon-xs'
  | 'icon-sm'
  | 'icon'
  | 'icon-lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly fullWidth?: boolean;
  /**
   * Style the single child element (e.g. a router `<Link>` or `<a download>`) as a button instead
   * of rendering a `<button>`, so real links keep their href, middle-click and new-tab behaviour.
   * `isLoading` and the ref are not applied to the child.
   */
  readonly asChild?: boolean;
  readonly children: ReactNode;
}

type AsChildProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> & {
  readonly children: ReactNode;
};

const ButtonAsChild = ({
  className,
  disabled,
  children,
  ...rest
}: AsChildProps): ReactElement | null => {
  if (!isValidElement<{ className?: string }>(children)) {
    return null;
  }
  return cloneElement(children, {
    ...rest,
    className: cn(className, children.props.className),
    ...(disabled === true ? { 'aria-disabled': true, tabIndex: -1 } : {}),
  });
};

/**
 * The single button primitive for the whole app. Feature code must use this rather than raw
 * `<button>` so styling, focus, loading and disabled semantics stay consistent everywhere.
 * Forwards its ref — required for Radix `asChild` triggers (DropdownMenu, Tooltip, Popover) to
 * measure and position their content against this element.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      asChild = false,
      disabled,
      type = 'button',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const classes = cn(
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      className,
    );
    if (asChild) {
      return (
        <ButtonAsChild className={classes} disabled={disabled} {...rest}>
          {children}
        </ButtonAsChild>
      );
    }
    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled === true || isLoading}
        aria-busy={isLoading}
        {...rest}
      >
        {isLoading ? <Spinner size="sm" /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
