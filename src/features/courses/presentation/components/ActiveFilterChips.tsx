import type { ReactElement } from 'react';
import { FilterChips, type FilterChipItem } from '@shared/ui';
import type { ContentCategory } from '@features/content';
import type { EnrollmentStatusDto } from '../../domain';

export interface CoursesActiveFilterChipsProps {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly categoryId: string | undefined;
  readonly categories: readonly ContentCategory[];
  readonly onCategoryChange: (value: string | undefined) => void;
  readonly status: number | undefined;
  readonly statuses: readonly EnrollmentStatusDto[];
  readonly onStatusChange: (value: number | undefined) => void;
  readonly onClearAll: () => void;
}

const buildFilterChips = (
  props: CoursesActiveFilterChipsProps,
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

  if (props.status !== undefined) {
    const statusLabel =
      props.statuses.find((s) => s.value === props.status)?.label ??
      `Status (${String(props.status)})`;
    chips.push({
      id: 'status',
      label: `Status: ${statusLabel}`,
      onDismiss: () => {
        props.onStatusChange(undefined);
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
  props: CoursesActiveFilterChipsProps,
): ReactElement | null => (
  <FilterChips chips={buildFilterChips(props)} onClearAll={props.onClearAll} />
);
