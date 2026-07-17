import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type {
  DashboardPeriod,
  DashboardView,
  SaveWidget,
  WidgetCatalogItem,
  WidgetData,
  WidgetInstance,
} from '../domain';
import { useDashboardModule } from './use-dashboard-module';

export const dashboardKeys = {
  mine: ['dashboard', 'me'] as const,
  catalog: ['dashboard', 'catalog'] as const,
  widget: (widgetKey: string, period: DashboardPeriod) =>
    ['dashboard', 'widget', widgetKey, period] as const,
};

export const useMyDashboard = (): UseQueryResult<DashboardView | null> => {
  const { getMyDashboard } = useDashboardModule();
  return useQuery({
    queryKey: dashboardKeys.mine,
    queryFn: async (): Promise<DashboardView | null> => {
      const result = await getMyDashboard.execute();
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

/** Data for one widget. Cached ~60s to mirror the server-side cache. */
export const useWidgetData = (
  widget: WidgetInstance,
  period: DashboardPeriod,
): UseQueryResult<WidgetData> => {
  const { getWidgetData } = useDashboardModule();
  return useQuery({
    queryKey: dashboardKeys.widget(widget.widgetKey, period),
    staleTime: 60_000,
    queryFn: async (): Promise<WidgetData> => {
      const result = await getWidgetData.execute({
        widgetKey: widget.widgetKey,
        config: widget.config,
        period,
      });
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export const useWidgetCatalog = (): UseQueryResult<readonly WidgetCatalogItem[]> => {
  const { getWidgetCatalog } = useDashboardModule();
  return useQuery({
    queryKey: dashboardKeys.catalog,
    queryFn: async (): Promise<readonly WidgetCatalogItem[]> => {
      const result = await getWidgetCatalog.execute();
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export const useSaveMyDashboard = (): UseMutationResult<
  DashboardView,
  Error,
  readonly SaveWidget[]
> => {
  const { saveMyDashboard } = useDashboardModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (widgets: readonly SaveWidget[]): Promise<DashboardView> => {
      const result = await saveMyDashboard.execute(widgets);
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.mine });
    },
  });
};

export const useResetMyDashboard = (): UseMutationResult<void, Error, void> => {
  const { resetMyDashboard } = useDashboardModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const result = await resetMyDashboard.execute();
      if (isErr(result)) throw result.error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.mine });
    },
  });
};
