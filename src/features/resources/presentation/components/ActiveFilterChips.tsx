import type { ReactElement } from 'react';
import { FilterChips, type FilterChipItem } from '@shared/ui';
import type { ContentCategory } from '@features/content';

export interface ResourcesActiveFilterChipsProps {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly categoryId: string | undefined;
  readonly categories: readonly ContentCategory[];
  readonly onCategoryChange: (value: string | undefined) => void;
  readonly onClearAll: () => void;
}

const buildFilterChips = (
  props: ResourcesActiveFilterChipsProps,
): readonly FilterChipItem[] => {
  const chips: FilterChipItem[] = [];

  if (props.categoryId) {
    const categoryName =
      props.categories.find((c) => c.id === props.categoryId)?.name ?? props.categoryId;
    chips.push({
      id: 'category',
      label: `Category: ${categoryName}`,
      onDismiss: () => {
        props.onCategoryChange(undefined);
      },
    });
  }

  if (props.query.trim() !== '') {
    chips.push({
      id: 'search',
      label: `Search: "${props.query}"`,
      onDismiss: () => {
        props.onQueryChange('');
      },
    });
  }

  return chips;
};

export const ActiveFilterChips = (
  props: ResourcesActiveFilterChipsProps,
): ReactElement | null => (
  <FilterChips chips={buildFilterChips(props)} onClearAll={props.onClearAll} />
);
