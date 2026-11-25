import type { SelectOption } from '@shared/ui';
import type { MyLearningStatusOption } from '../domain/types';

export const mapOriginParam = (
  origin: 'all' | 'self' | 'assigned',
): number | undefined => {
  if (origin === 'assigned') return 2;
  if (origin === 'self') return 1;
  return undefined;
};

export const mapAssignedScopeParam = (
  origin: 'all' | 'self' | 'assigned',
  scope: 'all' | 'me' | 'team' | 'role',
): number | undefined => {
  if (origin !== 'assigned') return undefined;
  if (scope === 'me') return 1;
  if (scope === 'team') return 2;
  if (scope === 'role') return 3;
  return undefined;
};

export const buildDynamicStatusOptions = (
  statuses: readonly MyLearningStatusOption[],
  isAssignedActive: boolean,
): readonly SelectOption[] => {
  const options: SelectOption[] = [{ value: 'all', label: 'All Statuses' }];

  for (const s of statuses) {
    if (s.name.toLowerCase() === 'overdue' && !isAssignedActive) {
      continue;
    }
    options.push({
      value: s.value.toString(),
      label: s.label || s.name,
    });
  }

  return options;
};
