import type { Result } from '@core/result';
import type { DashboardError } from '../errors/dashboard-view-errors';
import type { DashboardView } from '../entities/dashboard-view';
import type { DashboardPeriod, WidgetData } from '../entities/widget-data';
import type { WidgetCatalogItem } from '../entities/widget-catalog-item';

/** A widget's placement + config to persist (from an edited layout). */
export interface SaveWidget {
  readonly widgetKey: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly order: number;
  readonly config: unknown;
}

/** Request for a single widget's data. */
export interface WidgetDataRequest {
  readonly widgetKey: string;
  readonly config: unknown;
  readonly period: DashboardPeriod;
}

/** Admin: create/replace a user-type template dashboard. */
export interface SaveTemplateInput {
  readonly name: string;
  readonly userTypeId: string | null;
  readonly isDefault: boolean;
  readonly widgets: readonly SaveWidget[];
}

/**
 * Port to the dashboard service. The domain states the contract in its own terms; HTTP details live
 * in the infrastructure implementation.
 */
export interface DashboardGateway {
  /** The caller's resolved dashboard (personal → type template → tenant default). */
  myDashboard(): Promise<Result<DashboardView | null, DashboardError>>;

  /** Data for one widget. */
  widgetData(request: WidgetDataRequest): Promise<Result<WidgetData, DashboardError>>;

  /** Widgets the caller may place. */
  catalog(): Promise<Result<readonly WidgetCatalogItem[], DashboardError>>;

  /** Save the caller's personal dashboard. */
  saveMine(
    widgets: readonly SaveWidget[],
  ): Promise<Result<DashboardView, DashboardError>>;

  /** Reset the caller's personal dashboard to the type template. */
  resetMine(): Promise<Result<void, DashboardError>>;

  // ── Admin ──────────────────────────────────────────────────────────────
  byUserType(userTypeId: string): Promise<Result<DashboardView | null, DashboardError>>;
  saveTemplate(input: SaveTemplateInput): Promise<Result<DashboardView, DashboardError>>;
  resetUser(userId: string): Promise<Result<void, DashboardError>>;
}
