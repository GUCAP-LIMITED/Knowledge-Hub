import type { ReactElement, ReactNode } from 'react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { cn } from '@shared/utils';
import styles from './DropdownMenu.module.css';

export interface DropdownMenuItem {
  readonly label: string;
  readonly onSelect: () => void;
  readonly icon?: ReactNode;
  readonly danger?: boolean;
  readonly disabled?: boolean;
}

export interface DropdownMenuProps {
  /** The clickable element that opens the menu. */
  readonly trigger: ReactNode;
  readonly items: readonly DropdownMenuItem[];
  readonly align?: 'start' | 'center' | 'end';
}

/**
 * Accessible dropdown menu. Radix provides keyboard navigation, focus management and ARIA roles;
 * the caller supplies a `trigger` plus a typed `items` list. Token-styled content via CSS modules.
 */
export const DropdownMenu = ({
  trigger,
  items,
  align = 'end',
}: DropdownMenuProps): ReactElement => {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content className={styles.content} align={align} sideOffset={6}>
          {items.map((item) => (
            <Menu.Item
              key={item.label}
              className={cn(styles.item, item.danger === true && styles.danger)}
              disabled={item.disabled ?? false}
              onSelect={item.onSelect}
            >
              {item.icon !== undefined ? (
                <span className={styles.icon} aria-hidden="true">
                  {item.icon}
                </span>
              ) : null}
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
};
