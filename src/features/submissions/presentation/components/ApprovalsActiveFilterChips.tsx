import type { ReactElement } from 'react';
import { FilterChips, type FilterChipItem } from '@shared/ui';

export interface ApprovalsActiveFilterChipsProps {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly type: string;
  readonly onTypeChange: (value: string) => void;
  readonly onClearAll: () => void;
}

const buildFilterChips = (
  props: ApprovalsActiveFilterChipsProps,
): readonly FilterChipItem[] => {
  const chips: FilterChipItem[] = [];

  if (props.type !== 'all') {
    chips.push({
      id: 'type',
      label: `Type: ${props.type}`,
      onDismiss: () => {
        props.onTypeChange('all');
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

export const ApprovalsActiveFilterChips = (
  props: ApprovalsActiveFilterChipsProps,
): ReactElement | null => (
  <FilterChips chips={buildFilterChips(props)} onClearAll={props.onClearAll} />
);
