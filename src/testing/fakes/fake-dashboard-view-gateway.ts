import { type Result, ok } from '@core/result';
import type {
  DashboardError,
  DashboardGateway,
  DashboardView,
  SaveWidget,
  WidgetCatalogItem,
  WidgetData,
  WidgetDataRequest,
} from '@features/dashboard/domain';
import { buildDashboardView } from '../builders/dashboard-view.builder';

const widgetData: WidgetData = {
  widgetKey: 'courses.total',
  kind: 'kpi',
  title: 'Total courses',
  value: 42,
  delta: null,
  series: [],
  summary: null,
};

/** Hand-written, fully-typed fake of the {@link DashboardGateway} port. */
export class FakeDashboardViewGateway implements DashboardGateway {
  public myResult: Result<DashboardView | null, DashboardError> =
    ok(buildDashboardView());
  public widgetDataResult: Result<WidgetData, DashboardError> = ok(widgetData);
  public catalogResult: Result<readonly WidgetCatalogItem[], DashboardError> = ok([]);
  public saveResult: Result<DashboardView, DashboardError> = ok(buildDashboardView());
  public voidResult: Result<void, DashboardError> = ok(undefined);

  public lastSavedWidgets: readonly SaveWidget[] | null = null;
  public lastWidgetRequest: WidgetDataRequest | null = null;

  public myDashboard(): Promise<Result<DashboardView | null, DashboardError>> {
    return Promise.resolve(this.myResult);
  }

  public widgetData(
    request: WidgetDataRequest,
  ): Promise<Result<WidgetData, DashboardError>> {
    this.lastWidgetRequest = request;
    return Promise.resolve(this.widgetDataResult);
  }

  public catalog(): Promise<Result<readonly WidgetCatalogItem[], DashboardError>> {
    return Promise.resolve(this.catalogResult);
  }

  public saveMine(
    widgets: readonly SaveWidget[],
  ): Promise<Result<DashboardView, DashboardError>> {
    this.lastSavedWidgets = widgets;
    return Promise.resolve(this.saveResult);
  }

  public resetMine(): Promise<Result<void, DashboardError>> {
    return Promise.resolve(this.voidResult);
  }

  public byUserType(): Promise<Result<DashboardView | null, DashboardError>> {
    return Promise.resolve(this.myResult);
  }

  public saveTemplate(): Promise<Result<DashboardView, DashboardError>> {
    return Promise.resolve(this.saveResult);
  }

  public resetUser(): Promise<Result<void, DashboardError>> {
    return Promise.resolve(this.voidResult);
  }
}
