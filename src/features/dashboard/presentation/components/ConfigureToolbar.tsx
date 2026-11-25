import type { ReactElement } from 'react';
import { Check, Plus, RotateCcw, Settings } from 'lucide-react';
import { Button, Select } from '@shared/ui';
import type { DashboardPeriod } from '../../domain';
import { UserTypeDashboardSelector } from './UserTypeDashboardSelector';
import styles from '../ConfigureDashboardPage.module.css';

const PERIOD_OPTIONS: readonly { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'thisWeek', label: 'This week' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'thisYear', label: 'This year' },
];

export interface ConfigureToolbarProps {
  readonly selectedUserTypeId: string | null;
  readonly onUserTypeChange: (id: string | null, name: string | null) => void;
  readonly period: DashboardPeriod;
  readonly onPeriodChange: (p: DashboardPeriod) => void;
  readonly isEditMode: boolean;
  readonly onToggleEditMode: () => void;
  readonly onReset: () => void;
  readonly onAddWidget: () => void;
  readonly isResetPending: boolean;
}

export const ConfigureToolbar = ({
  selectedUserTypeId,
  onUserTypeChange,
  period,
  onPeriodChange,
  isEditMode,
  onToggleEditMode,
  onReset,
  onAddWidget,
  isResetPending,
}: ConfigureToolbarProps): ReactElement => (
  <div className={styles.toolbar}>
    <div className={styles.filters}>
      <div className={styles.filterItemWide}>
        <UserTypeDashboardSelector
          value={selectedUserTypeId}
          onChange={onUserTypeChange}
          disabled={isEditMode}
          includePersonal={false}
          label="User Type"
          placeholder="View by user type"
        />
      </div>
      <div className={styles.filterItem}>
        <Select
          label="Timeframe"
          value={period}
          onChange={(val) => {
            onPeriodChange(val as DashboardPeriod);
          }}
          options={PERIOD_OPTIONS}
        />
      </div>
    </div>

    {selectedUserTypeId ? (
      <div className={styles.actions}>
        {isEditMode ? (
          <>
            <Button
              variant="outline"
              size="sm"
              isLoading={isResetPending}
              onClick={onReset}
            >
              <RotateCcw size={14} aria-hidden="true" className={styles.btnIcon} />
              Reset to default
            </Button>
            <Button variant="outline" size="sm" onClick={onAddWidget}>
              <Plus size={14} aria-hidden="true" className={styles.btnIcon} />
              Add Widget
            </Button>
          </>
        ) : null}

        <Button
          variant={isEditMode ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleEditMode}
        >
          {isEditMode ? (
            <>
              <Check size={14} aria-hidden="true" className={styles.btnIcon} />
              Done editing
            </>
          ) : (
            <>
              <Settings size={14} aria-hidden="true" className={styles.btnIcon} />
              Manage dashboards
            </>
          )}
        </Button>
      </div>
    ) : null}
  </div>
);
