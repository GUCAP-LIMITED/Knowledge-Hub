/** A selectable swatch for a permission set (matches the Lead's palette). */
export interface PermissionSetColor {
  readonly name: string;
  readonly color: string;
  readonly bgColor: string;
}

export const PERMISSION_SET_COLORS: readonly PermissionSetColor[] = [
  { name: 'Teal', color: '#045D5E', bgColor: '#E8F5F5' },
  { name: 'Green', color: '#059669', bgColor: '#D1FAE5' },
  { name: 'Blue', color: '#2563EB', bgColor: '#DBEAFE' },
  { name: 'Purple', color: '#7C3AED', bgColor: '#EDE9FE' },
  { name: 'Orange', color: '#D97706', bgColor: '#FEF3C7' },
  { name: 'Gray', color: '#6B7280', bgColor: '#F3F4F6' },
];

/** Fallback swatch used when a set has no colour of its own. */
export const DEFAULT_PERMISSION_SET_COLOR: PermissionSetColor = {
  name: 'Gray',
  color: '#6B7280',
  bgColor: '#F3F4F6',
};

/** Canonical action ordering for the granular editor (unknown actions sort last, alphabetically). */
export const ACTION_ORDER: readonly string[] = [
  'View',
  'Create',
  'Edit',
  'Delete',
  'Publish',
  'Assign',
  'Approve',
  'Reject',
  'Moderate',
  'Manage',
  'Issue',
  'Revoke',
  'Invite',
  'Deactivate',
];

/** The action segment of a dot-notation key: `"Courses.Create" → "Create"`. */
export const actionOf = (permissionName: string): string => {
  const dot = permissionName.indexOf('.');
  return dot >= 0 ? permissionName.slice(dot + 1) : permissionName;
};

/** Sort dot-notation permission keys by {@link ACTION_ORDER}, then alphabetically. */
export const byActionOrder = (a: string, b: string): number => {
  const ia = ACTION_ORDER.indexOf(actionOf(a));
  const ib = ACTION_ORDER.indexOf(actionOf(b));
  const ra = ia === -1 ? ACTION_ORDER.length : ia;
  const rb = ib === -1 ? ACTION_ORDER.length : ib;
  return ra === rb ? actionOf(a).localeCompare(actionOf(b)) : ra - rb;
};
