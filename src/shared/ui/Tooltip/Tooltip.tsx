import type { ReactElement, ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.css';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  readonly label: string;
  readonly children: ReactNode;
  readonly side?: TooltipSide;
}

/**
 * Lightweight tooltip. Requires a {@link TooltipProvider} mounted once near the app root (Radix
 * shares open/close timing through it). Token-styled content with an arrow.
 */
export const Tooltip = ({
  label,
  children,
  side = 'top',
}: TooltipProps): ReactElement => {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content className={styles.content} side={side} sideOffset={6}>
          {label}
          <RadixTooltip.Arrow className={styles.arrow} />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};

export interface TooltipProviderProps {
  readonly children: ReactNode;
  readonly delayDuration?: number;
}

/** Re-export of the Radix tooltip provider; mount this once in the app shell. */
export const TooltipProvider = ({
  children,
  delayDuration = 200,
}: TooltipProviderProps): ReactElement => (
  <RadixTooltip.Provider delayDuration={delayDuration}>{children}</RadixTooltip.Provider>
);
