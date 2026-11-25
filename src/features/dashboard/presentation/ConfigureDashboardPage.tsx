import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ArrowLeft, Info } from 'lucide-react';
import { useMyCapabilities } from '@features/users';
import { Alert, Button, EmptyState, PageHeader } from '@shared/ui';
import type { DashboardPeriod } from '../domain';
import { useByUserTypeDashboard, useSaveDashboardTemplate } from './use-dashboard';
import { AddWidgetSection } from './components/AddWidgetSection';
import { ConfigureToolbar } from './components/ConfigureToolbar';
import { DashboardGrid } from './components/DashboardGrid';
import { DashboardSkeletonGrid } from './components/DashboardSkeletonGrid';
import { useDashboardLayout } from './components/useDashboardLayout';
import { cn, formatUserType } from '@shared/utils';
import styles from './ConfigureDashboardPage.module.css';

interface TemplateContentProps {
  readonly selectedUserTypeId: string | null;
  readonly selectedUserTypeName: string | null;
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly errorMessage?: string | undefined;
  readonly isSuccess: boolean;
  readonly layout: ReturnType<typeof useDashboardLayout>;
  readonly isEditMode: boolean;
  readonly period: DashboardPeriod;
  readonly sensors: ReturnType<typeof useSensors>;
}

const TemplateContent = ({
  selectedUserTypeId,
  selectedUserTypeName,
  isPending,
  isError,
  errorMessage,
  isSuccess,
  layout,
  isEditMode,
  period,
  sensors,
}: TemplateContentProps): ReactElement => {
  if (!selectedUserTypeId) {
    return (
      <EmptyState
        title="Select a User Type"
        description="Choose a user type from the dropdown above to view and configure its default widgets."
      />
    );
  }
  if (isPending) return <DashboardSkeletonGrid />;
  if (isError) {
    return (
      <Alert tone="error" title="Could not load dashboard">
        {errorMessage ?? 'Unknown error'}
      </Alert>
    );
  }
  if (isSuccess && layout.widgetOrder.length === 0) {
    return (
      <EmptyState
        title={`No widgets configured for ${selectedUserTypeName ? formatUserType(selectedUserTypeName) : 'this user type'}`}
        description={
          isEditMode
            ? 'Click "Add Widget" to choose widgets from the catalog.'
            : 'Click "Manage dashboards" above to add widgets from the catalog.'
        }
      />
    );
  }
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
};

interface ConfigureControls {
  readonly selectedUserTypeId: string | null;
  readonly selectedUserTypeName: string | null;
  readonly handleUserTypeChange: (id: string | null, name: string | null) => void;
  readonly period: DashboardPeriod;
  readonly setPeriod: (p: DashboardPeriod) => void;
  readonly isEditMode: boolean;
  readonly toggleEditMode: () => void;
  readonly showAddModal: boolean;
  readonly setShowAddModal: (show: boolean) => void;
  readonly activeQuery: ReturnType<typeof useByUserTypeDashboard>;
  readonly layout: ReturnType<typeof useDashboardLayout>;
  readonly sensors: ReturnType<typeof useSensors>;
}

function useConfigureDashboardControls(canManage: boolean): ConfigureControls {
  const [selectedUserTypeId, setSelectedUserTypeId] = useState<string | null>(null);
  const [selectedUserTypeName, setSelectedUserTypeName] = useState<string | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>('thisMonth');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeQuery = useByUserTypeDashboard(selectedUserTypeId);
  const saveTemplate = useSaveDashboardTemplate();
  const effectiveEditMode = canManage && isEditMode;

  const layout = useDashboardLayout({
    dashboardData: activeQuery.data,
    isEditMode: effectiveEditMode,
    selectedUserTypeId,
    selectedUserTypeName,
    onSaveMine: () => {
      // template configuration does not save personal dashboard
    },
    onSaveTemplate: (args) => {
      saveTemplate.mutate(args);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleUserTypeChange = (id: string | null, name: string | null): void => {
    setSelectedUserTypeId(id);
    setSelectedUserTypeName(name);
    setIsEditMode(false);
  };

  const toggleEditMode = (): void => {
    setIsEditMode((prev) => !prev);
  };

  return {
    selectedUserTypeId,
    selectedUserTypeName,
    handleUserTypeChange,
    period,
    setPeriod,
    isEditMode: effectiveEditMode,
    toggleEditMode,
    showAddModal,
    setShowAddModal,
    activeQuery,
    layout,
    sensors,
  };
}

const ConfigureHeader = ({ onBack }: { readonly onBack: () => void }): ReactElement => (
  <div className={styles.headerRow}>
    <PageHeader
      title="Configure Dashboards"
      subtitle="Configure which widgets each user type receives and arrange their default layout."
    />
    <Button variant="outline" size="sm" onClick={onBack} className={styles.backButton}>
      <ArrowLeft size={16} aria-hidden="true" />
      Back to my dashboard
    </Button>
  </div>
);

const EditModeBanner = ({
  typeName,
}: {
  readonly typeName: string | null;
}): ReactElement => (
  <div className={styles.editModeBanner}>
    <Info size={16} aria-hidden="true" />
    <span>
      Editing <strong>{typeName ? formatUserType(typeName) : 'User Type'}</strong>{' '}
      dashboard — drag to reorder, resize, or add widgets. Changes save when you click{' '}
      <strong>Done editing</strong>.
    </span>
  </div>
);

export interface ConfigureDashboardPageProps {
  readonly hideHeader?: boolean;
}

export const ConfigureDashboardPage = ({
  hideHeader = false,
}: ConfigureDashboardPageProps = {}): ReactElement => {
  const navigate = useNavigate();
  const { can } = useMyCapabilities();
  const canManage = can('dashboard', 'manage');
  const ctrl = useConfigureDashboardControls(canManage);

  const screenClass = cn(
    styles.screen,
    hideHeader ? styles.screenEmbedded : styles.screenStandalone,
  );

  if (!canManage) {
    return (
      <main className={screenClass}>
        <Alert tone="error" title="Access Denied">
          You do not have permission to configure user dashboards.
        </Alert>
      </main>
    );
  }

  return (
    <main className={screenClass}>
      {!hideHeader ? (
        <ConfigureHeader
          onBack={() => {
            navigate('/dashboard');
          }}
        />
      ) : null}
      <ConfigureToolbar
        selectedUserTypeId={ctrl.selectedUserTypeId}
        onUserTypeChange={ctrl.handleUserTypeChange}
        period={ctrl.period}
        onPeriodChange={ctrl.setPeriod}
        isEditMode={ctrl.isEditMode}
        onToggleEditMode={ctrl.toggleEditMode}
        onReset={() => {
          void ctrl.activeQuery.refetch();
        }}
        onAddWidget={() => {
          ctrl.setShowAddModal(true);
        }}
        isResetPending={ctrl.activeQuery.isRefetching}
      />
      {ctrl.isEditMode ? <EditModeBanner typeName={ctrl.selectedUserTypeName} /> : null}
      <TemplateContent
        selectedUserTypeId={ctrl.selectedUserTypeId}
        selectedUserTypeName={ctrl.selectedUserTypeName}
        isPending={ctrl.activeQuery.isPending}
        isError={ctrl.activeQuery.isError}
        errorMessage={ctrl.activeQuery.error?.message}
        isSuccess={ctrl.activeQuery.isSuccess}
        layout={ctrl.layout}
        isEditMode={ctrl.isEditMode}
        period={ctrl.period}
        sensors={ctrl.sensors}
      />
      <AddWidgetSection
        isEditMode={ctrl.isEditMode}
        selectedUserTypeId={ctrl.selectedUserTypeId}
        showModal={ctrl.showAddModal}
        onOpenModal={() => {
          ctrl.setShowAddModal(true);
        }}
        onCloseModal={ctrl.setShowAddModal}
        layout={ctrl.layout}
      />
    </main>
  );
};
