import { useRef, useEffect, type ReactElement, type ChangeEvent } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { Loader2, Check, Search, X } from 'lucide-react';
import { cn } from '@shared/utils';
import { ComboboxTypeBadge, HighlightedText } from './combobox-badges';
import styles from './InfiniteSelectableCombobox.module.css';

export { ComboboxTypeBadge, HighlightedText };

export interface ComboboxItemData {
  readonly id: string;
  readonly title: string;
  readonly type?: number | undefined;
  readonly typeName?: string | undefined;
}

const ComboboxSentinel = ({
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: {
  readonly hasNextPage?: boolean | undefined;
  readonly isFetchingNextPage?: boolean | undefined;
  readonly onFetchNextPage: () => void;
}): ReactElement | null => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }
    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onFetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

  if (!hasNextPage) {
    return null;
  }

  return (
    <div ref={sentinelRef} className={styles.loadingMore}>
      {isFetchingNextPage ? (
        <>
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          <span>Loading more...</span>
        </>
      ) : null}
    </div>
  );
};

const ComboboxOptionItem = <T extends ComboboxItemData>({
  item,
  isSelected,
  query,
  onSelect,
}: {
  readonly item: T;
  readonly isSelected: boolean;
  readonly query: string;
  readonly onSelect: (id: string, item: T) => void;
}): ReactElement => (
  <button
    type="button"
    className={cn(styles.item, isSelected && styles.itemSelected)}
    role="option"
    aria-selected={isSelected}
    onClick={() => {
      onSelect(item.id, item);
    }}
  >
    <div className={styles.itemMain}>
      <ComboboxTypeBadge type={item.type} typeName={item.typeName} compact />
      <span className={styles.itemTitle}>
        <HighlightedText text={item.title} query={query} />
      </span>
    </div>
    {isSelected ? (
      <Check size={16} className={styles.checkIcon} aria-hidden="true" />
    ) : null}
  </button>
);

const ComboboxAllOption = ({
  label,
  isSelected,
  onSelect,
}: {
  readonly label: string;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}): ReactElement => (
  <button
    type="button"
    className={cn(styles.item, isSelected && styles.itemSelected)}
    role="option"
    aria-selected={isSelected}
    onClick={onSelect}
  >
    <div className={styles.itemMain}>
      <span className={styles.itemTitle}>{label}</span>
    </div>
    {isSelected ? (
      <Check size={16} className={styles.checkIcon} aria-hidden="true" />
    ) : null}
  </button>
);

export interface ComboboxListProps<T extends ComboboxItemData> {
  readonly items: readonly T[];
  readonly value?: string | undefined;
  readonly query: string;
  readonly allOptionLabel?: string | undefined;
  readonly isLoading?: boolean | undefined;
  readonly isFetchingNextPage?: boolean | undefined;
  readonly hasNextPage?: boolean | undefined;
  readonly emptyText?: string | undefined;
  readonly onSelect: (id: string | undefined, item?: T) => void;
  readonly onFetchNextPage: () => void;
}

export const ComboboxList = <T extends ComboboxItemData>({
  items,
  value,
  query,
  allOptionLabel,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  emptyText,
  onSelect,
  onFetchNextPage,
}: ComboboxListProps<T>): ReactElement => {
  if (isLoading && items.length === 0) {
    return (
      <div className={styles.empty}>
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        <span style={{ marginLeft: '0.5rem' }}>Loading items...</span>
      </div>
    );
  }

  if (items.length === 0 && !isLoading) {
    return (
      <div className={styles.empty}>
        {emptyText ?? 'No matching content items found.'}
      </div>
    );
  }

  return (
    <div className={styles.list} role="listbox">
      {allOptionLabel ? (
        <ComboboxAllOption
          label={allOptionLabel}
          isSelected={!value || value === 'all'}
          onSelect={() => {
            onSelect(undefined);
          }}
        />
      ) : null}

      {items.map((item) => (
        <ComboboxOptionItem
          key={item.id}
          item={item}
          isSelected={value === item.id}
          query={query}
          onSelect={onSelect}
        />
      ))}

      <ComboboxSentinel
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onFetchNextPage={onFetchNextPage}
      />
    </div>
  );
};

export const ComboboxSearchInput = ({
  searchQuery,
  placeholder,
  onChange,
  onClear,
}: {
  readonly searchQuery: string;
  readonly placeholder: string;
  readonly onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly onClear: () => void;
}): ReactElement => (
  <div className={styles.searchBox}>
    <Search size={15} aria-hidden="true" />
    <input
      type="text"
      className={styles.searchInput}
      placeholder={placeholder}
      value={searchQuery}
      onChange={onChange}
      autoFocus
    />
    {searchQuery ? (
      <button
        type="button"
        className={styles.clearBtn}
        onClick={onClear}
        title="Clear search"
      >
        <X size={14} aria-hidden="true" />
      </button>
    ) : null}
  </div>
);

export interface ComboboxDropdownContentProps<T extends ComboboxItemData> {
  readonly searchQuery: string;
  readonly searchPlaceholder: string;
  readonly items: readonly T[];
  readonly value?: string | undefined;
  readonly allOptionLabel?: string | undefined;
  readonly isLoading?: boolean | undefined;
  readonly isFetchingNextPage?: boolean | undefined;
  readonly hasNextPage?: boolean | undefined;
  readonly emptyText?: string | undefined;
  readonly onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly onSearchClear: () => void;
  readonly onSelect: (id: string | undefined, item?: T) => void;
  readonly onFetchNextPage: () => void;
}

export const ComboboxDropdownContent = <T extends ComboboxItemData>({
  searchQuery,
  searchPlaceholder,
  items,
  value,
  allOptionLabel,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  emptyText,
  onSearchChange,
  onSearchClear,
  onSelect,
  onFetchNextPage,
}: ComboboxDropdownContentProps<T>): ReactElement => (
  <RadixPopover.Portal>
    <RadixPopover.Content
      className={styles.popoverContent}
      side="bottom"
      align="start"
      sideOffset={4}
    >
      <ComboboxSearchInput
        searchQuery={searchQuery}
        placeholder={searchPlaceholder}
        onChange={onSearchChange}
        onClear={onSearchClear}
      />

      <ComboboxList
        items={items}
        value={value}
        query={searchQuery}
        allOptionLabel={allOptionLabel}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        emptyText={emptyText}
        onSelect={onSelect}
        onFetchNextPage={onFetchNextPage}
      />
    </RadixPopover.Content>
  </RadixPopover.Portal>
);
