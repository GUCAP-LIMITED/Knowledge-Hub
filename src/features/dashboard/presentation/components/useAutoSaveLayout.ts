import { useEffect, useRef } from 'react';
import { buildWidgetConfig, type SaveWidget, type WidgetInstance } from '../../domain';
import type { SaveDashboardTemplateArgs } from '../use-dashboard';

interface SavePayloadArgs {
  readonly widgetOrder: readonly string[];
  readonly allInstances: readonly WidgetInstance[];
  readonly widgetWidths: Map<string, number>;
  readonly widgetHeights: Map<string, number>;
  readonly widgetConfigs: Map<string, Record<string, unknown>>;
}

function buildSavePayload({
  widgetOrder,
  allInstances,
  widgetWidths,
  widgetHeights,
  widgetConfigs,
}: SavePayloadArgs): SaveWidget[] {
  return widgetOrder.flatMap((id, idx) => {
    const inst = allInstances.find((w) => w.id === id);
    if (!inst) return [];
    return [
      {
        widgetKey: inst.widgetKey,
        x: 0,
        y: 0,
        width: widgetWidths.get(id) ?? inst.width,
        height: widgetHeights.get(id) ?? inst.height,
        order: idx,
        config: buildWidgetConfig(
          inst.configSchema,
          widgetConfigs.get(id) ?? inst.config,
        ),
      },
    ];
  });
}

export interface AutoSaveProps {
  readonly isEditMode: boolean;
  readonly hasChanges: boolean;
  readonly onSaved: () => void;
  readonly widgetOrder: readonly string[];
  readonly allInstances: readonly WidgetInstance[];
  readonly widgetWidths: Map<string, number>;
  readonly widgetHeights: Map<string, number>;
  readonly widgetConfigs: Map<string, Record<string, unknown>>;
  readonly selectedUserTypeId: string | null;
  readonly selectedUserTypeName: string | null;
  readonly dashboardId: string | null | undefined;
  readonly onSaveMine: (widgets: readonly SaveWidget[]) => void;
  readonly onSaveTemplate: (args: SaveDashboardTemplateArgs) => void;
}

export function useAutoSaveLayout({
  isEditMode,
  hasChanges,
  onSaved,
  widgetOrder,
  allInstances,
  widgetWidths,
  widgetHeights,
  widgetConfigs,
  selectedUserTypeId,
  selectedUserTypeName,
  dashboardId,
  onSaveMine,
  onSaveTemplate,
}: AutoSaveProps): void {
  const prevEditMode = useRef(isEditMode);

  useEffect(() => {
    const wasEditing = prevEditMode.current;
    prevEditMode.current = isEditMode;

    if (wasEditing && !isEditMode && hasChanges) {
      const payload = buildSavePayload({
        widgetOrder,
        allInstances,
        widgetWidths,
        widgetHeights,
        widgetConfigs,
      });

      if (selectedUserTypeId) {
        onSaveTemplate({
          id: dashboardId ?? null,
          name: selectedUserTypeName ? `${selectedUserTypeName} Template` : 'Template',
          userTypeId: selectedUserTypeId,
          isDefault: false,
          widgets: payload,
        });
      } else {
        onSaveMine(payload);
      }
      onSaved();
    }
  }, [
    isEditMode,
    allInstances,
    widgetOrder,
    widgetWidths,
    widgetHeights,
    widgetConfigs,
    selectedUserTypeId,
    selectedUserTypeName,
    dashboardId,
    hasChanges,
    onSaveMine,
    onSaveTemplate,
    onSaved,
  ]);
}
