import { useState, type ReactElement } from 'react';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Info, Plus } from 'lucide-react';
import { Alert, Button, EmptyState } from '@shared/ui';
import { cn } from '@shared/utils';
import type { DashboardPeriod } from '../../domain';
import {
  useMyDashboard,
  useResetMyDashboard,
  useSaveMyDashboard,
} from '../use-dashboard';
import { AddWidgetModal } from './AddWidgetModal';
import { DashboardGrid } from './DashboardGrid';
import { DashboardSkeletonGrid } from './DashboardSkeletonGrid';
import { DashboardToolbar } from './DashboardToolbar';
import { useDashboardLayout } from './useDashboardLayout';
import styles from './DynamicDashboard.module.css';

export interface DynamicDashboardProps {
  readonly canEdit?: boolean;
  readonly className?: string | undefined;
}

const EditModeBanner = (): ReactElement => (
  <div className={styles.editModeBanner}>
    <Info size={16} aria-hidden="true" />
    <span>
      Layout editing active — drag tiles to reorder, click resize icon to resize, or gear
      to configure. Changes persist when you click <strong>Done editing</strong>.
    </span>
  </div>
);

const AddWidgetBottomButton = ({
  onClick,
}: {
  readonly onClick: () => void;
}): ReactElement => (
  <Button variant="outline" size="lg" fullWidth onClick={onClick}>
    <Plus aria-hidden="true" />
    <span>Add Widget to Dashboard</span>
  </Button>
);

interface DashboardContentProps {
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly errorMessage?: string | undefined;
  readonly isSuccess: boolean;
  readonly layout: ReturnType<typeof useDashboardLayout>;
  readonly isEditMode: boolean;
  readonly period: DashboardPeriod;
  readonly sensors: ReturnType<typeof useSensors>;
}

const DashboardContent = ({
  isPending,
  isError,
  errorMessage,
  isSuccess,
  layout,
  isEditMode,
  period,
  sensors,
}: DashboardContentProps): ReactElement | null => {
  if (isPending) return <DashboardSkeletonGrid />;
  if (isError) {
    return (
      <Alert tone="error" title="Could not load dashboard layout">
        {errorMessage ?? 'Unknown error'}
      </Alert>
    );
  }
  if (isSuccess && layout.widgetOrder.length === 0) {
    return (
      <EmptyState
        title="No widgets placed"
        description={
          isEditMode
            ? 'Click "Add Widget" below or in the toolbar to populate your layout.'
            : 'No widgets are currently configured for this view. Switch to edit mode to add some.'
        }
      />
    );
  }
  if (layout.widgetOrder.length > 0) {
    return (
      <DashboardGrid
        widgetOrder={layout.widgetOrder}
        allInstances={layout.allInstances}
        widgetWidths={layout.widgetWidths}
        widgetHeights={layout.widgetHeights}
        widgetConfigs={layout.widgetConfigs}
        isEditMode={isEditMode}
        period={period}
        sensors={sensors}
        onDragEnd={layout.handleDragEnd}
        onRemoveWidget={layout.removeWidget}
        onResizeWidget={layout.handleResize}
        onConfigSave={layout.handleConfigSave}
      />
    );
  }
  return null;
};

interface DynamicDashboardDataResult {
  readonly activeQuery: ReturnType<typeof useMyDashboard>;
  readonly saveMine: ReturnType<typeof useSaveMyDashboard>;
  readonly resetMine: ReturnType<typeof useResetMyDashboard>;
}

function useDynamicDashboardData(): DynamicDashboardDataResult {
  const activeQuery = useMyDashboard();
  const saveMine = useSaveMyDashboard();
  const resetMine = useResetMyDashboard();

  return { activeQuery, saveMine, resetMine };
}

interface DashboardControls {
  readonly period: DashboardPeriod;
  readonly setPeriod: (p: DashboardPeriod) => void;
  readonly isEditMode: boolean;
  readonly toggleEditMode: () => void;
  readonly showAddModal: boolean;
  readonly setShowAddModal: (show: boolean) => void;
  readonly activeQuery: ReturnType<typeof useMyDashboard>;
  readonly layout: ReturnType<typeof useDashboardLayout>;
  readonly resetMine: ReturnType<typeof useResetMyDashboard>;
  readonly sensors: ReturnType<typeof useSensors>;
}

function useDashboardControls(canEdit: boolean): DashboardControls {
  const [period, setPeriod] = useState<DashboardPeriod>('thisMonth');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const effectiveEditMode = canEdit && isEditMode;

  const { activeQuery, saveMine, resetMine } = useDynamicDashboardData();

  const layout = useDashboardLayout({
    dashboardData: activeQuery.data,
    isEditMode: effectiveEditMode,
    selectedUserTypeId: null,
    selectedUserTypeName: null,
    onSaveMine: (widgets) => {
      if (canEdit) saveMine.mutate(widgets);
    },
    onSaveTemplate: () => {
      // personal dashboard does not mutate templates
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const toggleEditMode = (): void => {
    if (!canEdit) return;
    setIsEditMode((prev) => !prev);
  };

  return {
    period,
    setPeriod,
    isEditMode: effectiveEditMode,
    toggleEditMode,
    showAddModal: canEdit && showAddModal,
    setShowAddModal,
    activeQuery,
    layout,
    resetMine,
    sensors,
  };
}

export const DynamicDashboard = ({
  canEdit = true,
  className,
}: DynamicDashboardProps): ReactElement => {
  const ctrl = useDashboardControls(canEdit);

  return (
    <div className={cn(styles.screen, className)}>
      <DashboardToolbar
        period={ctrl.period}
        onPeriodChange={ctrl.setPeriod}
        isEditMode={ctrl.isEditMode}
        onToggleEditMode={ctrl.toggleEditMode}
        onReset={() => {
          if (canEdit) ctrl.resetMine.mutate();
        }}
        onAddWidget={() => {
          if (canEdit) ctrl.setShowAddModal(true);
        }}
        isResetPending={ctrl.resetMine.isPending}
        canEdit={canEdit}
      />

      {ctrl.isEditMode ? <EditModeBanner /> : null}

      <DashboardContent
        isPending={ctrl.activeQuery.isPending}
        isError={ctrl.activeQuery.isError}
        errorMessage={ctrl.activeQuery.error?.message}
        isSuccess={ctrl.activeQuery.isSuccess}
        layout={ctrl.layout}
        isEditMode={ctrl.isEditMode}
        period={ctrl.period}
        sensors={ctrl.sensors}
      />

      {ctrl.isEditMode ? (
        <AddWidgetBottomButton
          onClick={() => {
            if (canEdit) ctrl.setShowAddModal(true);
          }}
        />
      ) : null}

      {canEdit ? (
        <AddWidgetModal
          open={ctrl.showAddModal}
          onOpenChange={ctrl.setShowAddModal}
          activeKeys={ctrl.layout.activeKeys}
          onAdd={ctrl.layout.handleAdd}
          onRemove={(key) => {
            const match = ctrl.layout.allInstances.find((w) => w.widgetKey === key);
            if (match) ctrl.layout.removeWidget(match.id);
          }}
        />
      ) : null}
    </div>
  );
};
