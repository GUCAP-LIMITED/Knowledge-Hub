import type { WidgetKind } from './dashboard-view';

/** One point in a series/table widget. */
export interface WidgetPoint {
  readonly label: string;
  readonly value: number;
  readonly meta: string | null;
}

/** A widget's rendered data for a period. */
export interface WidgetData {
  readonly widgetKey: string;
  readonly kind: WidgetKind;
  readonly title: string | null;
  readonly value: number | null;
  readonly delta: number | null;
  readonly series: readonly WidgetPoint[];
  readonly summary: string | null;
}

/** Period presets, mirroring the backend `DashboardPeriod` (step-of-5). */
export type DashboardPeriod =
  | 'today'
  | 'thisWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear';
