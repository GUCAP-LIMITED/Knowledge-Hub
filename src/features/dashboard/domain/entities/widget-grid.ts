import type { ConfigFieldType, WidgetConfigField } from './dashboard-view';

/** Predefined width span options on a 12-column grid. */
export const WIDGET_WIDTH_OPTIONS = [
  { label: 'Quarter', value: 3 },
  { label: 'Third', value: 4 },
  { label: 'Half', value: 6 },
  { label: 'Two-thirds', value: 8 },
  { label: 'Full', value: 12 },
] as const;

/** Predefined height row span options. */
export const WIDGET_HEIGHT_OPTIONS = [
  { label: 'Compact', value: 1 },
  { label: 'Small', value: 2 },
  { label: 'Medium', value: 3 },
  { label: 'Large', value: 4 },
  { label: 'Extra Large', value: 5 },
] as const;

export type WidgetWidthValue = (typeof WIDGET_WIDTH_OPTIONS)[number]['value'];
export type WidgetHeightValue = (typeof WIDGET_HEIGHT_OPTIONS)[number]['value'];

/** Snap an arbitrary width to the nearest valid 12-column option. */
export function snapWidth(rawWidth: number): WidgetWidthValue {
  const widths: readonly WidgetWidthValue[] = WIDGET_WIDTH_OPTIONS.map(
    (opt) => opt.value,
  );
  return widths.reduce((prev, curr) =>
    Math.abs(curr - rawWidth) < Math.abs(prev - rawWidth) ? curr : prev,
  );
}

/** Snap an arbitrary height to the nearest valid row height option. */
export function snapHeight(rawHeight: number): WidgetHeightValue {
  const heights: readonly WidgetHeightValue[] = WIDGET_HEIGHT_OPTIONS.map(
    (opt) => opt.value,
  );
  return heights.reduce((prev, curr) =>
    Math.abs(curr - rawHeight) < Math.abs(prev - rawHeight) ? curr : prev,
  );
}

function coerceConfigValue(raw: unknown, fieldType: ConfigFieldType): unknown {
  if (raw === undefined || raw === null || raw === '') return raw;
  if (fieldType === 'boolean') {
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'string') return raw.toLowerCase() === 'true';
    return Boolean(raw);
  }
  if (fieldType === 'number') {
    if (typeof raw === 'number') return raw;
    const num = Number(raw);
    return Number.isFinite(num) ? num : raw;
  }
  return raw;
}

/**
 * Builds a sanitized, typed config object by applying schema defaults and coerced instance values.
 */
export function buildWidgetConfig(
  schema: readonly WidgetConfigField[],
  instanceConfig?: unknown,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const configMap =
    typeof instanceConfig === 'object' && instanceConfig !== null
      ? (instanceConfig as Record<string, unknown>)
      : {};

  for (const field of schema) {
    const raw =
      configMap[field.key] !== undefined ? configMap[field.key] : field.defaultValue;
    const coerced = coerceConfigValue(raw, field.type);
    if (coerced !== undefined && coerced !== null && coerced !== '') {
      result[field.key] = coerced;
    }
  }

  // Preserve non-schema extra keys
  const schemaKeys = new Set(schema.map((f) => f.key));
  for (const key of Object.keys(configMap)) {
    if (!schemaKeys.has(key) && !(key in result)) {
      result[key] = configMap[key];
    }
  }

  return result;
}
