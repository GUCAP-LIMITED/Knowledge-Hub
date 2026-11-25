import { useState, type ReactElement } from 'react';
import { Select, InfiniteSelectableCombobox, type SelectOption } from '@shared/ui';
import type { SelectableContentItem } from '../domain';
import { useInfiniteSelectableContentItems } from './use-course-reviews';
import styles from './WriteReviewForm.module.css';

export type ContentTypeFilter = 'all' | '0' | '5' | '10';

export interface ContentTypeAndItemPickersProps {
  readonly contentType: ContentTypeFilter;
  readonly selectedItemValue: string;
  readonly selectedItemTitle?: string | undefined;
  readonly hasItemError: boolean;
  readonly allOptionLabel?: string | undefined;
  readonly onContentTypeChange: (type: ContentTypeFilter) => void;
  readonly onContentItemChange: (
    id: string | undefined,
    item?: SelectableContentItem,
  ) => void;
}

const TYPE_OPTIONS: readonly SelectOption[] = [
  { value: 'all', label: 'All Content Types' },
  { value: '0', label: 'Courses' },
  { value: '5', label: 'Tutorials' },
  { value: '10', label: 'Resources' },
];

const getItemLabel = (type: ContentTypeFilter): string => {
  switch (type) {
    case '0':
      return 'Course';
    case '5':
      return 'Tutorial';
    case '10':
      return 'Resource';
    case 'all':
      return 'Content Item';
  }
};

const getItemPlaceholder = (type: ContentTypeFilter): string => {
  switch (type) {
    case '0':
      return 'Search & select enrolled course...';
    case '5':
      return 'Search & select tutorial...';
    case '10':
      return 'Search & select resource...';
    case 'all':
      return 'Search & select any content...';
  }
};

export const ContentTypeAndItemPickers = ({
  contentType,
  selectedItemValue,
  selectedItemTitle,
  hasItemError,
  allOptionLabel,
  onContentTypeChange,
  onContentItemChange,
}: ContentTypeAndItemPickersProps): ReactElement => {
  const [searchQuery, setSearchQuery] = useState('');

  const contentTypeNum = contentType === 'all' ? undefined : Number(contentType);
  const itemsQuery = useInfiniteSelectableContentItems({
    type: contentTypeNum,
    filter: searchQuery.trim() || undefined,
    maxResultCount: 20,
  });

  const allItems: readonly SelectableContentItem[] =
    itemsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <div className={styles.fieldGrow}>
        <Select
          label="Content Type"
          value={contentType}
          onChange={(val) => {
            onContentTypeChange(val as ContentTypeFilter);
          }}
          options={TYPE_OPTIONS}
        />
      </div>

      <div className={styles.fieldGrow}>
        <InfiniteSelectableCombobox
          label={getItemLabel(contentType)}
          value={selectedItemValue}
          selectedItemTitle={selectedItemTitle}
          placeholder={getItemPlaceholder(contentType)}
          searchPlaceholder={`Search ${getItemLabel(contentType).toLowerCase()}s...`}
          allOptionLabel={allOptionLabel}
          items={allItems}
          isLoading={itemsQuery.isLoading}
          isFetchingNextPage={itemsQuery.isFetchingNextPage}
          hasNextPage={itemsQuery.hasNextPage}
          onSearchChange={setSearchQuery}
          onFetchNextPage={() => {
            void itemsQuery.fetchNextPage();
          }}
          onSelect={onContentItemChange}
          error={hasItemError ? 'Please select a specific content item' : undefined}
        />
      </div>
    </>
  );
};
