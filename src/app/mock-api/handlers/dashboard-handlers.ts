import { grantsOf, requireUser } from '../mock-context';
import { buildWidgetData } from '../dashboard-data';
import type { MockState } from '../mock-state';
import type { MockRoute } from '../mock-types';
import type { MockUser } from '../seed/mock-users';
import {
  DEFAULT_LAYOUTS,
  WIDGET_CATALOG,
  findWidget,
  type WidgetDefinition,
} from '../seed/widget-catalog';

const BASE = '/api/app/dashboard';

interface SavedWidget {
  readonly widgetKey: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly order: number;
  readonly config?: unknown;
}

const catalogDto = (widget: WidgetDefinition): Record<string, unknown> => ({
  key: widget.key,
  category: widget.category,
  displayName: widget.displayName,
  kind: widget.kind,
  defaultWidth: widget.defaultWidth,
  defaultHeight: widget.defaultHeight,
  dataEndpoint: null,
  route: widget.route ?? null,
  requiredPermissions: widget.requiredPermissions,
  configSchema: widget.configSchema,
});

const instanceDto = (
  saved: SavedWidget,
  index: number,
): Record<string, unknown> | null => {
  const widget = findWidget(saved.widgetKey);
  if (widget === undefined) {
    return null;
  }
  return {
    id: `widget-${String(index)}-${saved.widgetKey}`,
    widgetKey: saved.widgetKey,
    x: saved.x,
    y: saved.y,
    width: saved.width,
    height: saved.height,
    order: saved.order,
    config: saved.config ?? null,
    kind: widget.kind,
    displayName: widget.displayName,
    category: widget.category,
    dataEndpoint: null,
    requiredPermissions: widget.requiredPermissions,
    configSchema: widget.configSchema,
  };
};

const defaultLayout = (user: MockUser): SavedWidget[] => {
  const rows = DEFAULT_LAYOUTS[user.userTypeId] ?? DEFAULT_LAYOUTS['ut-consultant'] ?? [];
  let order = 0;
  return rows.flatMap((row, y) => {
    let x = 0;
    return row.flatMap((key) => {
      const widget = findWidget(key);
      if (widget === undefined) {
        return [];
      }
      const placed: SavedWidget = {
        widgetKey: key,
        x,
        y: y * 3,
        width: row.length === 1 ? 12 : widget.defaultWidth,
        height: widget.defaultHeight,
        order,
      };
      x += placed.width;
      order += 1;
      return [placed];
    });
  });
};

const dashboardFor = (state: MockState, user: MockUser): Record<string, unknown> => {
  const saved =
    (state.dashboards.get(user.id) as SavedWidget[] | undefined) ?? defaultLayout(user);
  const grants = grantsOf(state, user);
  const widgets = saved
    .filter((w) =>
      (findWidget(w.widgetKey)?.requiredPermissions ?? []).every((p) => grants.has(p)),
    )
    .map(instanceDto)
    .filter((w) => w !== null);
  return {
    id: `dashboard-${user.id}`,
    name: state.dashboards.has(user.id)
      ? 'My dashboard'
      : `${user.userTypeName} dashboard`,
    userTypeId: user.userTypeId,
    isDefault: !state.dashboards.has(user.id),
    widgets,
  };
};

export const dashboardHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: `${BASE}/me`,
    handler: (request) => dashboardFor(state, requireUser(request)),
  },
  {
    method: 'GET',
    pattern: `${BASE}/widget-catalog`,
    handler: (request) => {
      const grants = grantsOf(state, requireUser(request));
      return WIDGET_CATALOG.filter((w) =>
        w.requiredPermissions.every((p) => grants.has(p)),
      ).map(catalogDto);
    },
  },
  {
    method: 'POST',
    pattern: `${BASE}/widget-data`,
    handler: (request) => {
      const body = request.body as {
        widgetKey: string;
        config?: Record<string, unknown>;
      };
      return buildWidgetData(
        state,
        requireUser(request),
        body.widgetKey,
        body.config ?? {},
      );
    },
  },
  {
    method: 'PUT',
    pattern: `${BASE}/my`,
    handler: (request) => {
      const user = requireUser(request);
      const body = request.body as { widgets: SavedWidget[] };
      state.dashboards.set(user.id, body.widgets);
      return dashboardFor(state, user);
    },
  },
  {
    method: 'DELETE',
    pattern: `${BASE}/my`,
    handler: (request) => {
      state.dashboards.delete(requireUser(request).id);
      return null;
    },
  },
];
