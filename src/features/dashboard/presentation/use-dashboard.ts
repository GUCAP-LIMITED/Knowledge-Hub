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
  byUserType: (userTypeId: string | null) =>
    ['dashboard', 'by-user-type', userTypeId] as const,
  widget: (widgetKey: string, period: DashboardPeriod, configHash?: string) =>
    ['dashboard', 'widget', widgetKey, period, configHash ?? ''] as const,
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

export const useByUserTypeDashboard = (
  userTypeId: string | null,
): UseQueryResult<DashboardView | null> => {
  const { getByUserTypeDashboard } = useDashboardModule();
  return useQuery({
    queryKey: dashboardKeys.byUserType(userTypeId),
    enabled: userTypeId !== null && userTypeId.length > 0,
    queryFn: async (): Promise<DashboardView | null> => {
      if (userTypeId === null || userTypeId.length === 0) return null;
      const result = await getByUserTypeDashboard.execute(userTypeId);
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
  const configHash = widget.config ? JSON.stringify(widget.config) : '';
  return useQuery({
    queryKey: dashboardKeys.widget(widget.widgetKey, period, configHash),
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

export const useWidgetCatalog = (
  enabled = true,
): UseQueryResult<readonly WidgetCatalogItem[]> => {
  const { getWidgetCatalog } = useDashboardModule();
  return useQuery({
    queryKey: dashboardKeys.catalog,
    enabled,
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

export interface SaveDashboardTemplateArgs {
  readonly id?: string | null | undefined;
  readonly name: string;
  readonly userTypeId: string | null;
  readonly isDefault: boolean;
  readonly widgets: readonly SaveWidget[];
}

export const useSaveDashboardTemplate = (): UseMutationResult<
  DashboardView,
  Error,
  SaveDashboardTemplateArgs
> => {
  const { saveDashboardTemplate } = useDashboardModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: SaveDashboardTemplateArgs): Promise<DashboardView> => {
      const result = await saveDashboardTemplate.execute({
        id: args.id,
        input: {
          name: args.name,
          userTypeId: args.userTypeId,
          isDefault: args.isDefault,
          widgets: args.widgets,
        },
      });
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: (_, vars) => {
      if (vars.userTypeId) {
        void queryClient.invalidateQueries({
          queryKey: dashboardKeys.byUserType(vars.userTypeId),
        });
      }
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
