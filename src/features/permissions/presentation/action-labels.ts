import { actionOf } from './permission-set-colors';

/** Overrides for action verbs whose PascalCase segment doesn't read well on its own. */
const ACTION_LABEL: Readonly<Record<string, string>> = {
  PublishWithoutReview: 'Publish without review',
  ChangePermissions: 'Change permissions',
  ManageRoles: 'Manage roles',
  ManageUsers: 'Manage users',
};

/** Human description per action verb (the segment after the dot), mirroring the old CAP_DESC. */
const ACTION_DESC: Readonly<Record<string, string>> = {
  View: 'Access and read this module',
  Create: 'Add new items',
  PublishWithoutReview: "Skip the review queue — this user's uploads publish immediately",
  Edit: 'Change existing items',
  Delete: 'Remove items permanently',
  Publish: 'Make items live for learners',
  Assign: 'Assign items to people',
  Approve: 'Approve items in the queue',
  Reject: 'Send items back for changes',
  Moderate: 'Moderate learner content',
  Manage: 'Manage members and settings',
  Issue: 'Issue certificates',
  Revoke: 'Revoke issued certificates',
  ChangePermissions: 'Change per-user permissions',
  ManageRoles: 'Manage user-type roles',
  ManageUsers: 'Manage branch users',
  Integrations: 'Manage integrations',
};

/** The display label for a dot-notation permission key: `"Courses.Create" → "Create"`. */
export const actionLabel = (permissionName: string): string => {
  const action = actionOf(permissionName);
  return ACTION_LABEL[action] ?? action;
};

/** A short description for a dot-notation permission key (falls back to the action verb). */
export const actionDescription = (permissionName: string): string => {
  const action = actionOf(permissionName);
  return ACTION_DESC[action] ?? action;
};
