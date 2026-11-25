/**
 * Public API of the dashboard feature. Other features and the app shell import ONLY from here.
 */
export {
  createDashboardModule,
  type DashboardModule,
  type DashboardModuleDeps,
} from './dashboard-module';
export {
  DashboardModuleProvider,
  useMyDashboard,
  useByUserTypeDashboard,
  useWidgetData,
  useWidgetCatalog,
  useSaveMyDashboard,
  useSaveDashboardTemplate,
  useResetMyDashboard,
  dashboardKeys,
  DynamicDashboard,
  type DynamicDashboardProps,
  ConfigureDashboardPage,
  type ConfigureDashboardPageProps,
} from './presentation';
export type {
  DashboardView,
  WidgetInstance,
  WidgetData,
  WidgetCatalogItem,
  DashboardPeriod,
  WidgetConfigField,
  ConfigFieldType,
} from './domain';

// NOTE: DashboardPage is intentionally NOT re-exported — the router lazy-loads it from its module path
// so it can be code-split into its own chunk.
