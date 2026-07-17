/** Widget render kind, normalized from the backend `WidgetKind` enum. */
export type WidgetKind = 'kpi' | 'series' | 'table' | 'funnel' | 'report';

/** A widget placed on a dashboard, with its catalog descriptor denormalized in. */
export interface WidgetInstance {
  readonly id: string;
  readonly widgetKey: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly order: number;
  readonly config: unknown;
  readonly kind: WidgetKind;
  readonly displayName: string;
  readonly category: string;
  readonly dataEndpoint: string | null;
  readonly requiredPermissions: readonly string[];
}

/** A resolved dashboard (personal → user-type template → tenant default). */
export interface DashboardView {
  readonly id: string;
  readonly name: string;
  readonly userTypeId: string | null;
  readonly isDefault: boolean;
  readonly widgets: readonly WidgetInstance[];
}
