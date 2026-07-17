import type { CapId } from './permission-catalog';

/**
 * Overrides for the few client capabilities whose verb has no identically-named backend action.
 * Keyed by `"<moduleId>.<cap>"`. Everything else maps by the PascalCase convention below.
 */
const OVERRIDES: Readonly<Record<string, string>> = {
  // The client `settings/manage` capability is gated on the backend `Settings.Edit` permission.
  'settings.manage': 'Settings.Edit',
};

const pascal = (value: string): string =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Maps a client capability `(moduleId, cap)` to its backend dot-notation permission key
 * (e.g. `('courses', 'edit') → 'Courses.Edit'`), matching the ABP permission catalog. The default is
 * a deterministic PascalCase transform; `OVERRIDES` covers the cases where the verbs don't line up.
 * An unmapped key simply resolves to a permission that isn't granted (fail-closed).
 */
export const toPermissionName = (moduleId: string, cap: CapId): string =>
  OVERRIDES[`${moduleId}.${cap}`] ?? `${pascal(moduleId)}.${pascal(cap)}`;
