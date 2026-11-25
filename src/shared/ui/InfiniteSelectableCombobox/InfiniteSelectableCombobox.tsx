import { useState, useEffect, useId, type ReactElement } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { ChevronDown, X } from 'lucide-react';
import { cn, useDebouncedValue } from '@shared/utils';
import {
  ComboboxDropdownContent,
  ComboboxTypeBadge,
  type ComboboxItemData,
} from './combobox-parts';
import styles from './InfiniteSelectableCombobox.module.css';

export type { ComboboxItemData };

export interface InfiniteSelectableComboboxProps<T extends ComboboxItemData> {
  readonly label: string;
  readonly value?: string | undefined;
  readonly selectedItemTitle?: string | undefined;
  readonly placeholder?: string | undefined;
  readonly searchPlaceholder?: string | undefined;
  readonly emptyText?: string | undefined;
  readonly allOptionLabel?: string | undefined;
  readonly required?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly error?: string | undefined;
  readonly className?: string | undefined;
  readonly items: readonly T[];
  readonly isLoading?: boolean | undefined;
  readonly isFetchingNextPage?: boolean | undefined;
  readonly hasNextPage?: boolean | undefined;
  readonly onSearchChange: (search: string) => void;
  readonly onFetchNextPage: () => void;
  readonly onSelect: (id: string | undefined, item?: T) => void;
}

const ComboboxTrigger = ({
  id,
  open,
  disabled,
  hasError,
  hasSelection,
  displayTitle,
  placeholder,
  selectedItem,
  onClear,
}: {
  readonly id: string;
  readonly open: boolean;
  readonly disabled?: boolean | undefined;
  readonly hasError: boolean;
  readonly hasSelection: boolean;
  readonly displayTitle?: string | undefined;
  readonly placeholder: string;
  readonly selectedItem?: ComboboxItemData | undefined;
  readonly onClear: (e: React.MouseEvent) => void;
}): ReactElement => (
  <RadixPopover.Trigger asChild disabled={disabled}>
    <button
      id={id}
      type="button"
      className={cn(styles.trigger, hasError && styles.invalid)}
      aria-expanded={open}
      aria-haspopup="listbox"
      data-placeholder={!displayTitle ? '' : undefined}
    >
      <span className={styles.triggerContent}>
        {selectedItem ? (
          <ComboboxTypeBadge type={selectedItem.type} typeName={selectedItem.typeName} />
        ) : null}
        <span>{displayTitle ?? placeholder}</span>
      </span>

      <span className={styles.triggerActions}>
        {hasSelection ? (
          <span
            role="button"
            tabIndex={0}
            className={styles.clearBtn}
            onClick={onClear}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClear(e as unknown as React.MouseEvent);
              }
            }}
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X size={14} aria-hidden="true" />
          </span>
        ) : null}
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </button>
  </RadixPopover.Trigger>
);

interface UseComboboxStateOptions<T extends ComboboxItemData> {
  readonly items: readonly T[];
  readonly value?: string | undefined;
  readonly selectedItemTitle?: string | undefined;
  readonly allOptionLabel?: string | undefined;
  readonly onSearchChange: (search: string) => void;
}

interface ComboboxState<T extends ComboboxItemData> {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly searchQuery: string;
  readonly setSearchQuery: (query: string) => void;
  readonly selectedItem: T | undefined;
  readonly displayTitle: string | undefined;
  readonly hasSelection: boolean;
}

const useComboboxState = <T extends ComboboxItemData>({
  items,
  value,
  selectedItemTitle,
  allOptionLabel,
  onSearchChange,
}: UseComboboxStateOptions<T>): ComboboxState<T> => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 250);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const selectedItem = items.find((it) => it.id === value);
  const displayTitle =
    selectedItem?.title ??
    selectedItemTitle ??
    (value === 'all' || !value ? allOptionLabel : undefined);

  return {
    open,
    setOpen,
    searchQuery,
    setSearchQuery,
    selectedItem,
    displayTitle,
    hasSelection: Boolean(value && value !== 'all'),
  };
};

const ComboboxLabel = ({
  htmlFor,
  label,
  required,
}: {
  readonly htmlFor: string;
  readonly label: string;
  readonly required?: boolean | undefined;
}): ReactElement => (
  <label className={styles.label} htmlFor={htmlFor}>
    {label}
    {required ? (
      <span className={styles.req} aria-hidden="true">
        {' '}
        *
      </span>
    ) : null}
  </label>
);

interface ComboboxPopoverProps<T extends ComboboxItemData> {
  readonly id: string;
  readonly state: ComboboxState<T>;
  readonly props: InfiniteSelectableComboboxProps<T>;
  readonly hasError: boolean;
}

const ComboboxPopover = <T extends ComboboxItemData>({
  id,
  state,
  props,
  hasError,
}: ComboboxPopoverProps<T>): ReactElement => {
  const {
    placeholder = 'Select content item...',
    searchPlaceholder = 'Search by title, topic, keywords...',
    emptyText,
    allOptionLabel,
    disabled,
    items,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    value,
    onFetchNextPage,
    onSelect,
  } = props;

  return (
    <RadixPopover.Root open={state.open} onOpenChange={state.setOpen}>
      <ComboboxTrigger
        id={id}
        open={state.open}
        disabled={disabled}
        hasError={hasError}
        hasSelection={state.hasSelection}
        displayTitle={state.displayTitle}
        placeholder={placeholder}
        selectedItem={state.selectedItem}
        onClear={(e) => {
          e.stopPropagation();
          onSelect(undefined);
        }}
      />

      <ComboboxDropdownContent
        searchQuery={state.searchQuery}
        searchPlaceholder={searchPlaceholder}
        items={items}
        value={value}
        allOptionLabel={allOptionLabel}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        emptyText={emptyText}
        onSearchChange={(e) => {
          state.setSearchQuery(e.target.value);
        }}
        onSearchClear={() => {
          state.setSearchQuery('');
        }}
        onSelect={(selectedId, item) => {
          onSelect(selectedId, item);
          state.setOpen(false);
        }}
        onFetchNextPage={onFetchNextPage}
      />
    </RadixPopover.Root>
  );
};

export const InfiniteSelectableCombobox = <T extends ComboboxItemData>(
  props: InfiniteSelectableComboboxProps<T>,
): ReactElement => {
  const { label, required, error, className } = props;
  const id = useId();
  const state = useComboboxState(props);
  const hasError = Boolean(error && error.length > 0);

  return (
    <div className={cn(styles.field, className)}>
      <ComboboxLabel htmlFor={id} label={label} required={required} />
      <ComboboxPopover id={id} state={state} props={props} hasError={hasError} />
      {hasError ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
};
