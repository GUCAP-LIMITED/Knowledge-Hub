import type { ReactElement, ReactNode } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { cn } from '@shared/utils';
import styles from './Popover.module.css';

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps {
  /** The clickable element that opens the popover. */
  readonly trigger: ReactNode;
  readonly children: ReactNode;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly align?: PopoverAlign;
  readonly side?: PopoverSide;
  readonly modal?: boolean;
  /** Extra class for the floating panel, e.g. to set its width or max-height. */
  readonly contentClassName?: string | undefined;
  /** Pixel shift along the alignment axis; for `align="end"` negative moves toward the end edge. */
  readonly alignOffset?: number | undefined;
}

/**
 * Generic click-to-open popover for arbitrary content — unlike {@link DropdownMenu}, which renders
 * a fixed item list, this one just positions whatever `children` is given. Radix handles focus
 * management, outside-click dismissal and collision-aware positioning.
 */
export const Popover = ({
  trigger,
  children,
  open,
  onOpenChange,
  align = 'end',
  side = 'bottom',
  modal,
  contentClassName,
  alignOffset = 0,
}: PopoverProps): ReactElement => (
  <RadixPopover.Root
    open={open}
    onOpenChange={onOpenChange}
    {...(modal !== undefined ? { modal } : {})}
  >
    <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
    <RadixPopover.Portal>
      <RadixPopover.Content
        className={cn(styles.content, contentClassName)}
        align={align}
        side={side}
        sideOffset={8}
        alignOffset={alignOffset}
        collisionPadding={16}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  </RadixPopover.Root>
);
