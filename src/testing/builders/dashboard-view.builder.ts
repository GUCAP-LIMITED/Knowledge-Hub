import type { DashboardView, WidgetInstance } from '@features/dashboard/domain';

const widgetDefaults = {
  id: 'w1',
  widgetKey: 'courses.total',
  x: 0,
  y: 0,
  width: 3,
  height: 2,
  order: 0,
  config: null,
  kind: 'kpi',
  displayName: 'Total courses',
  category: 'Courses',
  dataEndpoint: null,
  requiredPermissions: ['Courses.View'],
} satisfies WidgetInstance;

export const buildWidgetInstance = (
  overrides: Partial<WidgetInstance> = {},
): WidgetInstance => ({
  ...widgetDefaults,
  ...overrides,
});

const dashboardDefaults = {
  id: 'dashboard-1',
  name: 'My dashboard',
  userTypeId: null,
  isDefault: false,
  widgets: [buildWidgetInstance()],
} satisfies DashboardView;

export interface DashboardViewOverrides {
  readonly id?: string;
  readonly name?: string;
  readonly userTypeId?: string | null;
  readonly isDefault?: boolean;
  readonly widgets?: readonly WidgetInstance[];
}

/** Construct a valid {@link DashboardView} for tests, overriding only what matters per case. */
export const buildDashboardView = (
  overrides: DashboardViewOverrides = {},
): DashboardView => ({
  ...dashboardDefaults,
  ...overrides,
});
