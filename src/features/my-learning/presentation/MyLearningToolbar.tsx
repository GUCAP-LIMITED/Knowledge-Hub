import { useMemo, type ReactElement } from 'react';
import { Select, TextField, type SelectOption } from '@shared/ui';
import type { MyLearningStats, MyLearningStatusOption } from '../domain/types';
import { FALLBACK_MY_LEARNING_STATUSES } from '../infrastructure/http-my-learning-gateway';
import { OriginTabs } from './components/OriginTabs';
import { AssignedScopePills } from './components/AssignedScopePills';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { buildDynamicStatusOptions } from './my-learning-query-utils';
import styles from './MyLearningToolbar.module.css';

const CONTENT_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: 'all', label: 'All Content' },
  { value: '0', label: 'Courses' },
  { value: '5', label: 'Tutorials' },
  { value: '10', label: 'Resources' },
];

const buildSortingOptions = (isAssignedActive: boolean): readonly SelectOption[] => [
  ...(isAssignedActive
    ? [
        { value: 'DueDate ASC', label: 'Due Date (Earliest First)' },
        { value: 'DueDate DESC', label: 'Due Date (Latest First)' },
      ]
    : []),
  { value: 'LastAccessedAt DESC', label: 'Recently Accessed' },
  { value: 'EnrolledOrAssignedAt DESC', label: 'Date Added (Newest)' },
  { value: 'EnrolledOrAssignedAt ASC', label: 'Date Added (Oldest)' },
  { value: 'Title ASC', label: 'Title (A–Z)' },
  { value: 'Title DESC', label: 'Title (Z–A)' },
];

export interface MyLearningToolbarProps {
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
  readonly statuses?: readonly MyLearningStatusOption[] | undefined;
  readonly sorting: string;
  readonly onSortingChange: (value: string) => void;
  readonly stats: MyLearningStats | undefined;
  readonly onClearAll: () => void;
}

// eslint-disable-next-line max-lines-per-function
export const MyLearningToolbar = ({
  search,
  onSearchChange,
  origin,
  onOriginChange,
  assignedScope,
  onAssignedScopeChange,
  contentType,
  onContentTypeChange,
  status,
  onStatusChange,
  statuses,
  sorting,
  onSortingChange,
  stats,
  onClearAll,
}: MyLearningToolbarProps): ReactElement => {
  const isAssignedActive = origin === 'assigned';
  const effectiveStatuses =
    statuses && statuses.length > 0 ? statuses : FALLBACK_MY_LEARNING_STATUSES;

  const statusOptions = useMemo(
    () => buildDynamicStatusOptions(effectiveStatuses, isAssignedActive),
    [effectiveStatuses, isAssignedActive],
  );

  const statusLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of effectiveStatuses) {
      map[s.value.toString()] = s.label;
    }
    return map;
  }, [effectiveStatuses]);

  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.originTabsRow}>
        <OriginTabs origin={origin} onOriginChange={onOriginChange} stats={stats} />

        {isAssignedActive ? (
          <AssignedScopePills
            assignedScope={assignedScope}
            onAssignedScopeChange={onAssignedScopeChange}
            stats={stats}
          />
        ) : null}
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.searchCell}>
          <TextField
            label="Search"
            placeholder="Search your courses, tutorials, resources…"
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
            onClear={() => {
              onSearchChange('');
            }}
          />
        </div>

        <div className={styles.filterCell}>
          <Select
            label="Content Type"
            value={contentType}
            onChange={onContentTypeChange}
            options={CONTENT_TYPE_OPTIONS}
          />
        </div>

        <div className={styles.filterCell}>
          <Select
            label="Status"
            value={status}
            onChange={onStatusChange}
            options={statusOptions}
          />
        </div>

        <div className={styles.filterCell}>
          <Select
            label="Sort by"
            value={sorting}
            onChange={onSortingChange}
            options={buildSortingOptions(isAssignedActive)}
          />
        </div>
      </div>

      <ActiveFilterChips
        search={search}
        onSearchChange={onSearchChange}
        origin={origin}
        onOriginChange={onOriginChange}
        assignedScope={assignedScope}
        onAssignedScopeChange={onAssignedScopeChange}
        contentType={contentType}
        onContentTypeChange={onContentTypeChange}
        status={status}
        onStatusChange={onStatusChange}
        statusLabels={statusLabels}
        onClearAll={onClearAll}
      />
    </div>
  );
};
