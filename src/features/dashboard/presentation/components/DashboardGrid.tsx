import type { ReactElement } from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { cn } from '@shared/utils';
import {
  buildWidgetConfig,
  type DashboardPeriod,
  type WidgetHeightValue,
  type WidgetInstance,
  type WidgetWidthValue,
} from '../../domain';
import { SortableWidgetTile } from './SortableWidgetTile';
import styles from './DynamicDashboard.module.css';

export interface DashboardGridProps {
  readonly widgetOrder: readonly string[];
  readonly allInstances: readonly WidgetInstance[];
  readonly widgetWidths: Map<string, number>;
  readonly widgetHeights: Map<string, number>;
  readonly widgetConfigs: Map<string, Record<string, unknown>>;
  readonly isEditMode: boolean;
  readonly period: DashboardPeriod;
  readonly sensors: SensorDescriptor<SensorOptions>[];
  readonly onDragEnd: (event: DragEndEvent) => void;
  readonly onRemoveWidget: (id: string) => void;
  readonly onResizeWidget: (
    id: string,
    w: WidgetWidthValue,
    h: WidgetHeightValue,
  ) => void;
  readonly onConfigSave: (id: string, cfg: Record<string, unknown>) => void;
}

export const DashboardGrid = ({
  widgetOrder,
  allInstances,
  widgetWidths,
  widgetHeights,
  widgetConfigs,
  isEditMode,
  period,
  sensors,
  onDragEnd,
  onRemoveWidget,
  onResizeWidget,
  onConfigSave,
}: DashboardGridProps): ReactElement => {
  return (
    <div className={styles.gridWrapper}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={[...widgetOrder]} strategy={rectSortingStrategy}>
          <div className={cn(styles.grid, isEditMode && styles.gridEditing)}>
            {widgetOrder.map((id) => {
              const inst = allInstances.find((w) => w.id === id);
              if (!inst) return null;
              return (
                <SortableWidgetTile
                  key={id}
                  instance={{
                    ...inst,
                    config: buildWidgetConfig(
                      inst.configSchema,
                      widgetConfigs.get(id) ?? inst.config,
                    ),
                  }}
                  width={widgetWidths.get(id) ?? inst.width}
                  height={widgetHeights.get(id) ?? inst.height}
                  isEditMode={isEditMode}
                  period={period}
                  onDelete={() => {
                    onRemoveWidget(id);
                  }}
                  onResize={(w, h) => {
                    onResizeWidget(id, w, h);
                  }}
                  onConfigSave={(cfg) => {
                    onConfigSave(id, cfg);
                  }}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
