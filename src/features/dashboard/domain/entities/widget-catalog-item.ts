import type { WidgetKind } from './dashboard-view';

/** A widget available to place, from `GET /api/app/dashboard/widget-catalog`. */
export interface WidgetCatalogItem {
  readonly key: string;
  readonly category: string;
  readonly displayName: string;
  readonly kind: WidgetKind;
  readonly defaultWidth: number;
  readonly defaultHeight: number;
  readonly dataEndpoint: string | null;
  readonly requiredPermissions: readonly string[];
}
