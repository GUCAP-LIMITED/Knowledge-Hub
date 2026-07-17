import type {
  DashboardPeriod,
  DashboardView,
  WidgetCatalogItem,
  WidgetData,
  WidgetInstance,
  WidgetKind,
} from '../domain';
import type {
  DashboardDto,
  WidgetCatalogItemDto,
  WidgetDataDto,
  WidgetInstanceDto,
} from './dto/dashboard-view-api.dto';

/** Backend `WidgetKind` (step-of-5 int) → domain union. */
export function toWidgetKind(value: number): WidgetKind {
  if (value === 5) return 'series';
  if (value === 10) return 'table';
  if (value === 15) return 'funnel';
  if (value === 20) return 'report';
  return 'kpi';
}

const PERIOD_INTS: Record<DashboardPeriod, number> = {
  today: 0,
  thisWeek: 5,
  thisMonth: 10,
  lastMonth: 15,
  thisYear: 20,
};

/** Domain period → backend `DashboardPeriod` int (step-of-5). */
export function periodToInt(period: DashboardPeriod): number {
  return PERIOD_INTS[period];
}

function toNumberOrNull(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toWidgetInstance(dto: WidgetInstanceDto): WidgetInstance {
  return {
    id: dto.id,
    widgetKey: dto.widgetKey,
    x: dto.x,
    y: dto.y,
    width: dto.width,
    height: dto.height,
    order: dto.order,
    config: dto.config ?? null,
    kind: toWidgetKind(dto.kind),
    displayName: dto.displayName,
    category: dto.category,
    dataEndpoint: dto.dataEndpoint ?? null,
    requiredPermissions: dto.requiredPermissions,
  };
}

export function toDashboardView(dto: DashboardDto): DashboardView {
  return {
    id: dto.id,
    name: dto.name,
    userTypeId: dto.userTypeId ?? null,
    isDefault: dto.isDefault,
    widgets: dto.widgets.map(toWidgetInstance),
  };
}

export function toWidgetData(dto: WidgetDataDto): WidgetData {
  return {
    widgetKey: dto.widgetKey,
    kind: toWidgetKind(dto.kind),
    title: dto.title ?? null,
    value: toNumberOrNull(dto.value),
    delta: dto.delta ?? null,
    series: dto.series.map((point) => ({
      label: point.label,
      value: point.value,
      meta: point.meta ?? null,
    })),
    summary: dto.summary ?? null,
  };
}

export function toWidgetCatalogItem(dto: WidgetCatalogItemDto): WidgetCatalogItem {
  return {
    key: dto.key,
    category: dto.category,
    displayName: dto.displayName,
    kind: toWidgetKind(dto.kind),
    defaultWidth: dto.defaultWidth,
    defaultHeight: dto.defaultHeight,
    dataEndpoint: dto.dataEndpoint ?? null,
    requiredPermissions: dto.requiredPermissions,
  };
}
