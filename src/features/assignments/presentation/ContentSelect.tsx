import { useEffect, useMemo, useState, type ReactElement } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { Check, Search, X } from 'lucide-react';
import { Badge, Spinner } from '@shared/ui';
import { cn, useDebouncedValue } from '@shared/utils';
import { CONTENT_STATUS, type ContentSummary, useContentList } from '@features/content';
import { getTypeMeta } from './content-select-types';
import { ContentSelectTrigger } from './ContentSelectTrigger';
import styles from './ContentSelect.module.css';

const PAGE_SIZE = 10;

const ContentItemRow = ({
  item,
  isSelected,
  onSelect,
}: {
  readonly item: ContentSummary;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}): ReactElement => {
  const meta = getTypeMeta(item.type);
  const Icon = meta.icon;
  return (
    <button
      type="button"
      className={cn(styles.item, isSelected && styles.itemSelected)}
      onClick={onSelect}
    >
      <div className={styles.itemLeft}>
        <span className={cn(styles.itemIcon, meta.iconClass)}>
          <Icon size={16} aria-hidden="true" />
        </span>
        <div className={styles.itemBody}>
          <span className={styles.itemTitle}>{item.title}</span>
          <span className={styles.itemSubtitle}>
            <Badge tone={meta.tone} size="sm">
              {meta.label}
            </Badge>
          </span>
        </div>
      </div>
      {isSelected ? (
        <span className={styles.check}>
          <Check size={16} aria-hidden="true" />
        </span>
      ) : null}
    </button>
  );
};

const ContentSearchInput = ({
  value,
  onChange,
  onClear,
}: {
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly onClear: () => void;
}): ReactElement => (
  <div className={styles.searchWrap}>
    <Search size={15} className={styles.searchIcon} aria-hidden="true" />
    <input
      type="text"
      autoFocus
      className={styles.searchInput}
      placeholder="Search by title…"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    />
    {value.length > 0 ? (
      <button
        type="button"
        className={styles.clearSearchBtn}
        onClick={onClear}
        aria-label="Clear search"
      >
        <X size={14} />
      </button>
    ) : null}
  </div>
);

const ContentItemList = ({
  items,
  isLoading,
  isFetchingMore,
  hasMore,
  debouncedSearch,
  selectedValue,
  onSelect,
  onLoadMore,
}: {
  readonly items: readonly ContentSummary[];
  readonly isLoading: boolean;
  readonly isFetchingMore: boolean;
  readonly hasMore: boolean;
  readonly debouncedSearch: string;
  readonly selectedValue: string;
  readonly onSelect: (item: ContentSummary) => void;
  readonly onLoadMore: () => void;
}): ReactElement => {
  if (isLoading && items.length === 0) {
    return (
      <div className={styles.statusMessage}>
        <Spinner size="sm" />
        <span style={{ marginLeft: '0.5rem' }}>Loading content…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.statusMessage}>
        No published content found
        {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}.
      </div>
    );
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 40 && hasMore && !isFetchingMore) {
      onLoadMore();
    }
  };

  return (
    <div className={styles.list} onScroll={handleScroll}>
      {items.map((item) => (
        <ContentItemRow
          key={item.id}
          item={item}
          isSelected={item.id === selectedValue}
          onSelect={() => {
            onSelect(item);
          }}
        />
      ))}
      {isFetchingMore ? (
        <div className={styles.scrollLoading}>
          <Spinner size="sm" />
          <span>Loading more…</span>
        </div>
      ) : null}
    </div>
  );
};

interface UseContentSelectProps {
  readonly value: string;
  readonly typeFilter?: number | undefined;
  readonly onChange: (id: string, item: ContentSummary | null) => void;
}

interface UseContentSelectResult {
  readonly search: string;
  readonly setSearch: (val: string) => void;
  readonly debouncedSearch: string;
  readonly selectedItem: ContentSummary | null;
  readonly items: readonly ContentSummary[];
  readonly isLoading: boolean;
  readonly isFetchingMore: boolean;
  readonly hasMore: boolean;
  readonly handleSelect: (item: ContentSummary) => void;
  readonly handleClear: () => void;
  readonly handleLoadMore: () => void;
}

const useContentSelect = ({
  value,
  typeFilter,
  onChange,
}: UseContentSelectProps): UseContentSelectResult => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState<ContentSummary | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPage(0);
  }, [typeFilter, debouncedSearch]);

  const maxResultCount = (page + 1) * PAGE_SIZE;

  const { data, isLoading, isFetching } = useContentList({
    status: CONTENT_STATUS.published,
    type: typeFilter,
    filter: debouncedSearch.trim().length > 0 ? debouncedSearch.trim() : undefined,
    skipCount: 0,
    maxResultCount,
    enabled: true,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const totalCount = data?.totalCount ?? 0;
  const hasMore = totalCount > items.length;
  const isFetchingMore = isFetching && items.length > 0;

  useEffect(() => {
    if (value.length === 0) {
      setSelectedItem(null);
      return;
    }
    if (selectedItem?.id === value) return;
    const match = items.find((i) => i.id === value);
    if (match) setSelectedItem(match);
  }, [value, items, selectedItem?.id]);

  const handleSelect = (item: ContentSummary): void => {
    setSelectedItem(item);
    onChange(item.id, item);
  };

  const handleClear = (): void => {
    setSelectedItem(null);
    onChange('', null);
  };

  const handleLoadMore = (): void => {
    setPage((prev) => prev + 1);
  };

  return {
    search,
    setSearch,
    debouncedSearch,
    selectedItem,
    items,
    isLoading,
    isFetchingMore,
    hasMore,
    handleSelect,
    handleClear,
    handleLoadMore,
  };
};

export interface ContentSelectProps {
  readonly value: string;
  readonly typeFilter?: number | undefined;
  readonly onChange: (id: string, item: ContentSummary | null) => void;
  readonly modal?: boolean;
}

export const ContentSelect = ({
  value,
  typeFilter,
  onChange,
  modal = true,
}: ContentSelectProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const selectState = useContentSelect({ value, typeFilter, onChange });

  return (
    <div className={styles.container}>
      <label className={styles.label}>Training content</label>
      <RadixPopover.Root open={open} onOpenChange={setOpen} modal={modal}>
        <RadixPopover.Trigger asChild>
          <ContentSelectTrigger
            value={value}
            selectedItem={selectState.selectedItem}
            onClear={selectState.handleClear}
          />
        </RadixPopover.Trigger>
        <RadixPopover.Portal>
          <RadixPopover.Content
            className={styles.popover}
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <ContentSearchInput
              value={selectState.search}
              onChange={selectState.setSearch}
              onClear={() => {
                selectState.setSearch('');
              }}
            />

            <ContentItemList
              items={selectState.items}
              isLoading={selectState.isLoading}
              isFetchingMore={selectState.isFetchingMore}
              hasMore={selectState.hasMore}
              debouncedSearch={selectState.debouncedSearch}
              selectedValue={value}
              onSelect={(item) => {
                selectState.handleSelect(item);
                setOpen(false);
              }}
              onLoadMore={selectState.handleLoadMore}
            />
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    </div>
  );
};
