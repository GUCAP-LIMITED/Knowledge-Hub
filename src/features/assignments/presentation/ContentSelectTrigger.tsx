import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type KeyboardEvent,
  type ReactElement,
} from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@shared/utils';
import type { ContentSummary } from '@features/content';
import { getTypeMeta } from './content-select-types';
import styles from './ContentSelect.module.css';

export interface ContentSelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly value: string;
  readonly selectedItem: ContentSummary | null;
  readonly onClear: () => void;
}

export const ContentSelectTrigger = forwardRef<
  HTMLButtonElement,
  ContentSelectTriggerProps
>(
  (
    { value, selectedItem, onClear, className, type = 'button', onClick, ...rest },
    ref,
  ): ReactElement => {
    const selectedMeta = selectedItem ? getTypeMeta(selectedItem.type) : null;
    const SelectedIcon = selectedMeta?.icon;

    const handleClearClick = (e: MouseEvent): void => {
      e.stopPropagation();
      e.preventDefault();
      onClear();
    };

    const handleClearKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.stopPropagation();
        e.preventDefault();
        onClear();
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(styles.trigger, className)}
        onClick={onClick}
        {...rest}
      >
        <div className={styles.triggerLeft}>
          {selectedItem && selectedMeta && SelectedIcon ? (
            <>
              <span className={cn(styles.itemIcon, selectedMeta.iconClass)}>
                <SelectedIcon size={15} aria-hidden="true" />
              </span>
              <span className={styles.triggerText}>
                [{selectedMeta.label}] {selectedItem.title}
              </span>
            </>
          ) : (
            <span className={cn(styles.triggerText, styles.placeholder)}>
              Select training content…
            </span>
          )}
        </div>
        <div className={styles.triggerActions}>
          {value.length > 0 ? (
            <span
              role="button"
              tabIndex={0}
              className={styles.clearTriggerBtn}
              onClick={handleClearClick}
              onKeyDown={handleClearKeyDown}
              aria-label="Clear selection"
            >
              <X size={14} />
            </span>
          ) : null}
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </button>
    );
  },
);

ContentSelectTrigger.displayName = 'ContentSelectTrigger';
