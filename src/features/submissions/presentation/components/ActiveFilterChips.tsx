import type { ReactElement } from 'react';
import { FilterChips, type FilterChipItem } from '@shared/ui';
import type { ContentCategory } from '@features/content';
import {
  TYPE_OPTIONS,
  STATUS_OPTIONS,
  defaultStatus,
  type SubmissionStatusFilter,
  type SubmissionTypeFilter,
} from '../submissions-filter';

export interface SubmissionsActiveFilterChipsProps {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly type: SubmissionTypeFilter;
  readonly onTypeChange: (value: SubmissionTypeFilter) => void;
  readonly status: SubmissionStatusFilter;
  readonly onStatusChange: (value: SubmissionStatusFilter) => void;
  readonly categoryId: string;
  readonly onCategoryChange: (value: string) => void;
  readonly categories: readonly ContentCategory[];
  readonly isAdmin: boolean;
  readonly onClearAll: () => void;
}

const typeLabel = (value: SubmissionTypeFilter): string =>
  TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;

const statusLabel = (value: SubmissionStatusFilter): string =>
  STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;

const buildFilterChips = (
  props: SubmissionsActiveFilterChipsProps,
): readonly FilterChipItem[] => {
  const chips: FilterChipItem[] = [];

  if (props.type !== 'all') {
    chips.push({
      id: 'type',
      label: `Type: ${typeLabel(props.type)}`,
      onDismiss: () => {
        props.onTypeChange('all');
      },
    });
  }

  if (props.categoryId !== 'all') {
    const categoryName =
      props.categories.find((category) => category.id === props.categoryId)?.name ??
      props.categoryId;
    chips.push({
      id: 'category',
      label: `Category: ${categoryName}`,
      onDismiss: () => {
        props.onCategoryChange('all');
      },
    });
  }

  const defaultStatusValue = defaultStatus(props.isAdmin);
  if (props.status !== defaultStatusValue) {
    chips.push({
      id: 'status',
      label: `Status: ${statusLabel(props.status)}`,
      onDismiss: () => {
        props.onStatusChange(defaultStatusValue);
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
  props: SubmissionsActiveFilterChipsProps,
): ReactElement | null => (
  <FilterChips chips={buildFilterChips(props)} onClearAll={props.onClearAll} />
);
