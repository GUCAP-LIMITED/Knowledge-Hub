import type { ReactElement } from 'react';
import { Check, Plus, RotateCcw, Settings } from 'lucide-react';
import { Button, Select } from '@shared/ui';
import type { DashboardPeriod } from '../../domain';
import styles from './DashboardToolbar.module.css';

export interface DashboardToolbarProps {
  readonly period: DashboardPeriod;
  readonly onPeriodChange: (p: DashboardPeriod) => void;
  readonly isEditMode: boolean;
  readonly onToggleEditMode: () => void;
  readonly onReset: () => void;
  readonly onAddWidget: () => void;
  readonly isResetPending?: boolean;
  readonly canEdit: boolean;
}

const PERIOD_OPTIONS: readonly { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'thisWeek', label: 'This week' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'thisYear', label: 'This year' },
];

interface ToolbarActionsProps {
  readonly isEditMode: boolean;
  readonly isResetPending: boolean;
  readonly onReset: () => void;
  readonly onAddWidget: () => void;
  readonly onToggleEditMode: () => void;
}

const ToolbarActions = ({
  isEditMode,
  isResetPending,
  onReset,
  onAddWidget,
  onToggleEditMode,
}: ToolbarActionsProps): ReactElement => {
  return (
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
  );
};

export const DashboardToolbar = ({
  period,
  onPeriodChange,
  isEditMode,
  onToggleEditMode,
  onReset,
  onAddWidget,
  isResetPending = false,
  canEdit,
}: DashboardToolbarProps): ReactElement => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <Select
            label="Timeframe"
            hideLabel
            value={period}
            onChange={(val) => {
              onPeriodChange(val as DashboardPeriod);
            }}
            options={PERIOD_OPTIONS}
          />
        </div>
      </div>

      {canEdit ? (
        <ToolbarActions
          isEditMode={isEditMode}
          isResetPending={isResetPending}
          onReset={onReset}
          onAddWidget={onAddWidget}
          onToggleEditMode={onToggleEditMode}
        />
      ) : null}
    </div>
  );
};
