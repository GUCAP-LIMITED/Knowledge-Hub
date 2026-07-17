import { z } from 'zod';

/**
 * Wire contract for the `/api/app/dashboard` endpoints. Enums (`kind`) arrive as integers and are
 * normalized in the mapper. Every response is validated with Zod at the boundary.
 */

export const WidgetInstanceDtoSchema = z.object({
  id: z.string(),
  widgetKey: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  order: z.number(),
  config: z.unknown().nullish(),
  kind: z.number(),
  displayName: z.string(),
  category: z.string(),
  dataEndpoint: z.string().nullish(),
  requiredPermissions: z.array(z.string()),
});

export const DashboardDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  userTypeId: z.string().nullish(),
  isDefault: z.boolean(),
  widgets: z.array(WidgetInstanceDtoSchema),
});

/** `GET /api/app/dashboard/me` may return `null` when nothing is configured. */
export const DashboardOrNullDtoSchema = DashboardDtoSchema.nullable();

export const WidgetPointDtoSchema = z.object({
  label: z.string(),
  value: z.number(),
  meta: z.string().nullish(),
});

export const WidgetDataDtoSchema = z.object({
  widgetKey: z.string(),
  kind: z.number(),
  title: z.string().nullish(),
  value: z.union([z.number(), z.string()]).nullish(),
  delta: z.number().nullish(),
  series: z.array(WidgetPointDtoSchema),
  summary: z.string().nullish(),
});

export const WidgetCatalogItemDtoSchema = z.object({
  key: z.string(),
  category: z.string(),
  displayName: z.string(),
  kind: z.number(),
  defaultWidth: z.number(),
  defaultHeight: z.number(),
  dataEndpoint: z.string().nullish(),
  requiredPermissions: z.array(z.string()),
});

export const WidgetCatalogDtoSchema = z.array(WidgetCatalogItemDtoSchema);

export type DashboardDto = z.infer<typeof DashboardDtoSchema>;
export type WidgetInstanceDto = z.infer<typeof WidgetInstanceDtoSchema>;
export type WidgetDataDto = z.infer<typeof WidgetDataDtoSchema>;
export type WidgetCatalogItemDto = z.infer<typeof WidgetCatalogItemDtoSchema>;
