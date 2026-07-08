import type { ReactElement, ReactNode } from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import styles from './Tabs.module.css';

export interface TabDescriptor {
  readonly value: string;
  readonly label: string;
}

export interface TabsProps {
  readonly tabs: readonly TabDescriptor[];
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  /** One `<Tabs.Panel>` per tab value. */
  readonly children: ReactNode;
}

/**
 * Accessible tabs with an underline-style active state. Radix handles roving focus and ARIA;
 * render the panels as {@link TabsPanel} children keyed by the same `value`s passed in `tabs`.
 */
export const Tabs = ({
  tabs,
  value,
  onValueChange,
  children,
}: TabsProps): ReactElement => {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange} className={styles.root}>
      <RadixTabs.List className={styles.list}>
        {tabs.map((tab) => (
          <RadixTabs.Trigger key={tab.value} value={tab.value} className={styles.trigger}>
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
};

export interface TabsPanelProps {
  readonly value: string;
  readonly children: ReactNode;
}

/** Content for a single tab. */
export const TabsPanel = ({ value, children }: TabsPanelProps): ReactElement => (
  <RadixTabs.Content value={value} className={styles.panel}>
    {children}
  </RadixTabs.Content>
);
