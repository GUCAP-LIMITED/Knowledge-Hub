import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type {
  DashboardView,
  SaveWidget,
  WidgetCatalogItem,
  WidgetHeightValue,
  WidgetInstance,
  WidgetWidthValue,
} from '../../domain';
import type { SaveDashboardTemplateArgs } from '../use-dashboard';
import { useAutoSaveLayout } from './useAutoSaveLayout';

export interface UseDashboardLayoutProps {
  readonly dashboardData: DashboardView | null | undefined;
  readonly isEditMode: boolean;
  readonly selectedUserTypeId: string | null;
  readonly selectedUserTypeName: string | null;
  readonly onSaveMine: (widgets: readonly SaveWidget[]) => void;
  readonly onSaveTemplate: (args: SaveDashboardTemplateArgs) => void;
}

export interface UseDashboardLayoutResult {
  readonly widgetOrder: readonly string[];
  readonly allInstances: readonly WidgetInstance[];
  readonly widgetWidths: Map<string, number>;
  readonly widgetHeights: Map<string, number>;
  readonly widgetConfigs: Map<string, Record<string, unknown>>;
  readonly activeKeys: readonly string[];
  readonly handleDragEnd: (event: DragEndEvent) => void;
  readonly removeWidget: (id: string) => void;
  readonly handleResize: (id: string, w: WidgetWidthValue, h: WidgetHeightValue) => void;
  readonly handleConfigSave: (id: string, cfg: Record<string, unknown>) => void;
  readonly handleAdd: (
    item: WidgetCatalogItem,
    config: Record<string, unknown>,
    w: WidgetWidthValue,
    h: WidgetHeightValue,
  ) => void;
}

interface CreateInstanceArgs {
  readonly item: WidgetCatalogItem;
  readonly config: Record<string, unknown>;
  readonly width: WidgetWidthValue;
  readonly height: WidgetHeightValue;
  readonly order: number;
}

function createNewInstance({
  item,
  config,
  width,
  height,
  order,
}: CreateInstanceArgs): WidgetInstance {
  return {
    id: 'tile-' + item.key + '-' + String(Date.now()),
    widgetKey: item.key,
    x: 0,
    y: 0,
    width,
    height,
    order,
    config,
    kind: item.kind,
    displayName: item.displayName,
    category: item.category,
    dataEndpoint: item.dataEndpoint,
    requiredPermissions: item.requiredPermissions,
    configSchema: item.configSchema,
  };
}

interface LayoutDataState {
  readonly widgetOrder: readonly string[];
  readonly setWidgetOrder: React.Dispatch<React.SetStateAction<readonly string[]>>;
  readonly widgetWidths: Map<string, number>;
  readonly setWidgetWidths: React.Dispatch<React.SetStateAction<Map<string, number>>>;
  readonly widgetHeights: Map<string, number>;
  readonly setWidgetHeights: React.Dispatch<React.SetStateAction<Map<string, number>>>;
  readonly widgetConfigs: Map<string, Record<string, unknown>>;
  readonly setWidgetConfigs: React.Dispatch<
    React.SetStateAction<Map<string, Record<string, unknown>>>
  >;
  readonly addedWidgets: readonly WidgetInstance[];
  readonly setAddedWidgets: React.Dispatch<
    React.SetStateAction<readonly WidgetInstance[]>
  >;
  readonly allInstances: readonly WidgetInstance[];
}

function useLayoutDataState(
  dashboardData: DashboardView | null | undefined,
): LayoutDataState {
  const [widgetOrder, setWidgetOrder] = useState<readonly string[]>([]);
  const [widgetWidths, setWidgetWidths] = useState<Map<string, number>>(new Map());
  const [widgetHeights, setWidgetHeights] = useState<Map<string, number>>(new Map());
  const [widgetConfigs, setWidgetConfigs] = useState<
    Map<string, Record<string, unknown>>
  >(new Map());
  const [addedWidgets, setAddedWidgets] = useState<readonly WidgetInstance[]>([]);

  useEffect(() => {
    if (dashboardData) {
      const sorted = [...dashboardData.widgets].sort((a, b) => a.order - b.order);
      setWidgetOrder(sorted.map((w) => w.id));
      setAddedWidgets([]);
      setWidgetWidths(new Map());
      setWidgetHeights(new Map());
      setWidgetConfigs(new Map());
    }
  }, [dashboardData]);

  const allInstances = useMemo(
    () => [...(dashboardData?.widgets ?? []), ...addedWidgets],
    [dashboardData?.widgets, addedWidgets],
  );

  return {
    widgetOrder,
    setWidgetOrder,
    widgetWidths,
    setWidgetWidths,
    widgetHeights,
    setWidgetHeights,
    widgetConfigs,
    setWidgetConfigs,
    addedWidgets,
    setAddedWidgets,
    allInstances,
  };
}

interface LayoutCallbacksArgs {
  readonly state: LayoutDataState;
  readonly setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

interface LayoutCallbacksResult {
  readonly handleDragEnd: (event: DragEndEvent) => void;
  readonly removeWidget: (id: string) => void;
  readonly handleResize: (id: string, w: WidgetWidthValue, h: WidgetHeightValue) => void;
  readonly handleConfigSave: (id: string, cfg: Record<string, unknown>) => void;
  readonly handleAdd: (
    item: WidgetCatalogItem,
    config: Record<string, unknown>,
    w: WidgetWidthValue,
    h: WidgetHeightValue,
  ) => void;
}

function useLayoutCallbacks({
  state,
  setHasChanges,
}: LayoutCallbacksArgs): LayoutCallbacksResult {
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        state.setWidgetOrder((prev) => {
          const oldIdx = prev.indexOf(String(active.id));
          const newIdx = prev.indexOf(String(over.id));
          return arrayMove([...prev], oldIdx, newIdx);
        });
        setHasChanges(true);
      }
    },
    [state, setHasChanges],
  );

  const removeWidget = useCallback(
    (id: string) => {
      state.setWidgetOrder((prev) => prev.filter((w) => w !== id));
      state.setAddedWidgets((prev) => prev.filter((w) => w.id !== id));
      setHasChanges(true);
    },
    [state, setHasChanges],
  );

  const handleResize = useCallback(
    (id: string, w: WidgetWidthValue, h: WidgetHeightValue) => {
      state.setWidgetWidths((prev) => new Map(prev).set(id, w));
      state.setWidgetHeights((prev) => new Map(prev).set(id, h));
      setHasChanges(true);
    },
    [state, setHasChanges],
  );

  const handleConfigSave = useCallback(
    (id: string, cfg: Record<string, unknown>) => {
      state.setWidgetConfigs((prev) => new Map(prev).set(id, cfg));
      setHasChanges(true);
    },
    [state, setHasChanges],
  );

  const handleAdd = useCallback(
    (
      item: WidgetCatalogItem,
      config: Record<string, unknown>,
      width: WidgetWidthValue,
      height: WidgetHeightValue,
    ) => {
      const newInst = createNewInstance({
        item,
        config,
        width,
        height,
        order: state.widgetOrder.length,
      });
      state.setAddedWidgets((prev) => [...prev, newInst]);
      state.setWidgetOrder((prev) => [...prev, newInst.id]);
      setHasChanges(true);
    },
    [state, setHasChanges],
  );

  return {
    handleDragEnd,
    removeWidget,
    handleResize,
    handleConfigSave,
    handleAdd,
  };
}

export function useDashboardLayout({
  dashboardData,
  isEditMode,
  selectedUserTypeId,
  selectedUserTypeName,
  onSaveMine,
  onSaveTemplate,
}: UseDashboardLayoutProps): UseDashboardLayoutResult {
  const [hasChanges, setHasChanges] = useState(false);
  const state = useLayoutDataState(dashboardData);

  useEffect(() => {
    if (dashboardData) setHasChanges(false);
  }, [dashboardData]);

  useAutoSaveLayout({
    isEditMode,
    hasChanges,
    onSaved: () => {
      setHasChanges(false);
    },
    widgetOrder: state.widgetOrder,
    allInstances: state.allInstances,
    widgetWidths: state.widgetWidths,
    widgetHeights: state.widgetHeights,
    widgetConfigs: state.widgetConfigs,
    selectedUserTypeId,
    selectedUserTypeName,
    dashboardId: dashboardData?.id,
    onSaveMine,
    onSaveTemplate,
  });

  const callbacks = useLayoutCallbacks({ state, setHasChanges });

  const activeKeys = useMemo(
    () =>
      state.widgetOrder
        .map((id) => state.allInstances.find((w) => w.id === id)?.widgetKey)
        .filter((k): k is string => Boolean(k)),
    [state.widgetOrder, state.allInstances],
  );

  return {
    widgetOrder: state.widgetOrder,
    allInstances: state.allInstances,
    widgetWidths: state.widgetWidths,
    widgetHeights: state.widgetHeights,
    widgetConfigs: state.widgetConfigs,
    activeKeys,
    ...callbacks,
  };
}
