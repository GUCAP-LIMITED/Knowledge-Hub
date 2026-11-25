import type { ReactElement } from 'react';
import { FilterChips, type FilterChipItem } from '@shared/ui';

const SCOPE_LABELS: Record<'me' | 'team' | 'role', string> = {
  me: 'Direct to Me',
  team: 'My Team',
  role: 'My Role',
};

const TYPE_LABELS: Record<string, string> = {
  '0': 'Course',
  '5': 'Tutorial',
  '10': 'Resource',
};

const STATUS_LABELS: Record<string, string> = {
  '0': 'Not Started',
  '1': 'In Progress',
  '2': 'Completed',
  '3': 'Overdue',
  '4': 'Paused',
};

export interface ActiveFilterChipsProps {
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly origin: 'all' | 'self' | 'assigned';
  readonly onOriginChange: (value: 'all' | 'self' | 'assigned') => void;
  readonly assignedScope: 'all' | 'me' | 'team' | 'role';
  readonly onAssignedScopeChange: (value: 'all' | 'me' | 'team' | 'role') => void;
  readonly contentType: string;
  readonly onContentTypeChange: (value: string) => void;
  readonly status: string;
  readonly onStatusChange: (value: string) => void;
  readonly statusLabels?: Record<string, string> | undefined;
  readonly onClearAll: () => void;
}

const buildFilterChips = (props: ActiveFilterChipsProps): readonly FilterChipItem[] => {
  const chips: FilterChipItem[] = [];

  if (props.origin !== 'all') {
    chips.push({
      id: 'origin',
      label: `Origin: ${props.origin === 'assigned' ? 'Assigned' : 'Self-Enrolled'}`,
      onDismiss: () => {
        props.onOriginChange('all');
      },
    });
  }

  if (props.origin === 'assigned' && props.assignedScope !== 'all') {
    chips.push({
      id: 'scope',
      label: `Target: ${SCOPE_LABELS[props.assignedScope]}`,
      onDismiss: () => {
        props.onAssignedScopeChange('all');
      },
    });
  }

  if (props.contentType !== 'all') {
    chips.push({
      id: 'contentType',
      label: `Type: ${TYPE_LABELS[props.contentType] ?? props.contentType}`,
      onDismiss: () => {
        props.onContentTypeChange('all');
      },
    });
  }

  if (props.status !== 'all') {
    const statusLabel =
      props.statusLabels?.[props.status] ?? STATUS_LABELS[props.status] ?? props.status;
    chips.push({
      id: 'status',
      label: `Status: ${statusLabel}`,
      onDismiss: () => {
        props.onStatusChange('all');
      },
    });
  }

  if (props.search.trim() !== '') {
    chips.push({
      id: 'search',
      label: `Search: "${props.search}"`,
      onDismiss: () => {
        props.onSearchChange('');
      },
    });
  }

  return chips;
};

export const ActiveFilterChips = (props: ActiveFilterChipsProps): ReactElement | null => (
  <FilterChips chips={buildFilterChips(props)} onClearAll={props.onClearAll} />
);
