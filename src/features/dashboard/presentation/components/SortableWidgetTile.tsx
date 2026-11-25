import { useState, type CSSProperties, type ReactElement } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, X } from 'lucide-react';
import { Badge, Skeleton } from '@shared/ui';
import { cn } from '@shared/utils';
import type {
  DashboardPeriod,
  WidgetHeightValue,
  WidgetInstance,
  WidgetWidthValue,
} from '../../domain';
import { useWidgetData } from '../use-dashboard';
import { ResizeWidgetPopover } from './ResizeWidgetPopover';
import { WidgetConfigModal } from './WidgetConfigModal';
import { KpiWidgetView } from './widgets/KpiWidgetView';
import { SeriesWidgetView } from './widgets/SeriesWidgetView';
import { TableWidgetView } from './widgets/TableWidgetView';
import { FunnelWidgetView } from './widgets/FunnelWidgetView';
import { NotificationsRecentWidgetView } from './widgets/NotificationsRecentWidgetView';
import { ActionCardWidgetView } from './widgets/ActionCardWidgetView';
import { TopRatedCoursesWidgetView } from './widgets/TopRatedCoursesWidgetView';
import styles from './SortableWidgetTile.module.css';

export interface SortableWidgetTileProps {
  readonly instance: WidgetInstance;
  readonly width: number;
  readonly height: number;
  readonly isEditMode: boolean;
  readonly period: DashboardPeriod;
  readonly onDelete: () => void;
  readonly onResize: (w: WidgetWidthValue, h: WidgetHeightValue) => void;
  readonly onConfigSave: (config: Record<string, unknown>) => void;
}

const TileContent = ({
  instance,
  query,
  isEditMode,
}: {
  readonly instance: WidgetInstance;
  readonly query: ReturnType<typeof useWidgetData>;
  readonly isEditMode: boolean;
}): ReactElement => {
  if (query.isPending) {
    return (
      <div className={styles.skeletonBox}>
        <Skeleton width="50%" height={28} />
        <Skeleton width="70%" height={14} />
      </div>
    );
  }
  if (query.isError) {
    return <div className={styles.errorState}>Data unavailable</div>;
  }
  if (
    query.data.widgetKey === 'notifications.recent' ||
    instance.widgetKey === 'notifications.recent'
  ) {
    return <NotificationsRecentWidgetView data={query.data} />;
  }
  if (
    query.data.widgetKey === 'courses.top-rated' ||
    instance.widgetKey === 'courses.top-rated'
  ) {
    return <TopRatedCoursesWidgetView data={query.data} isEditMode={isEditMode} />;
  }
  if (
    query.data.widgetKey.startsWith('action.') ||
    instance.widgetKey.startsWith('action.')
  ) {
    return <ActionCardWidgetView data={query.data} isEditMode={isEditMode} />;
  }
  const effectiveKind = query.data.kind;
  if (effectiveKind === 'kpi') {
    return <KpiWidgetView data={query.data} />;
  }
  if (effectiveKind === 'table') {
    return <TableWidgetView data={query.data} />;
  }
  if (effectiveKind === 'funnel') {
    return <FunnelWidgetView data={query.data} />;
  }
  return <SeriesWidgetView data={query.data} config={instance.config} />;
};

const EditControls = ({
  onDelete,
  hasSchema,
  onOpenConfig,
  width,
  height,
  onResize,
}: {
  readonly onDelete: () => void;
  readonly hasSchema: boolean;
  readonly onOpenConfig: () => void;
  readonly width: number;
  readonly height: number;
  readonly onResize: (w: WidgetWidthValue, h: WidgetHeightValue) => void;
}): ReactElement => (
  <>
    <button
      type="button"
      aria-label="Remove widget"
      className={styles.deleteButton}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
    >
      <X size={11} aria-hidden="true" />
    </button>
    {hasSchema ? (
      <button
        type="button"
        aria-label="Widget settings"
        className={styles.configButton}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenConfig();
        }}
      >
        <Settings size={11} aria-hidden="true" />
      </button>
    ) : null}
    <ResizeWidgetPopover width={width} height={height} onSave={onResize} />
  </>
);

export const SortableWidgetTile = ({
  instance,
  width,
  height,
  isEditMode,
  period,
  onDelete,
  onResize,
  onConfigSave,
}: SortableWidgetTileProps): ReactElement => {
  const [configOpen, setConfigOpen] = useState(false);
  const query = useWidgetData(instance, period);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: instance.id,
      disabled: !isEditMode,
    });

  const isAction =
    instance.widgetKey.startsWith('action.') ||
    (query.data?.widgetKey ? query.data.widgetKey.startsWith('action.') : false);

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: 'span ' + String(width),
    gridRow: 'span ' + String(Math.max(height, 1)),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        styles.tileWrapper,
        isEditMode && styles.tileEditMode,
        isDragging && styles.tileDragging,
      )}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
    >
      {isEditMode ? (
        <EditControls
          onDelete={onDelete}
          hasSchema={instance.configSchema.length > 0}
          onOpenConfig={() => {
            setConfigOpen(true);
          }}
          width={width}
          height={height}
          onResize={onResize}
        />
      ) : null}

      <div className={cn(styles.tile, isAction && styles.actionTile)}>
        {!isAction ? (
          <div className={styles.tileHead}>
            <span className={styles.tileTitle}>{instance.displayName}</span>
            <Badge tone="neutral" size="sm">
              {instance.category}
            </Badge>
          </div>
        ) : null}
        <div className={styles.tileBody}>
          <TileContent instance={instance} query={query} isEditMode={isEditMode} />
        </div>
      </div>

      {configOpen ? (
        <WidgetConfigModal
          open={configOpen}
          onOpenChange={setConfigOpen}
          instance={instance}
          onSave={onConfigSave}
        />
      ) : null}
    </div>
  );
};
