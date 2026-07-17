import { describe, expect, it } from 'vitest';
import { toPermissionName } from './capability-permission-map';

describe('toPermissionName', () => {
  it('maps a client (module, cap) pair to the PascalCase backend key', () => {
    expect(toPermissionName('courses', 'edit')).toBe('Courses.Edit');
    expect(toPermissionName('courses', 'delete')).toBe('Courses.Delete');
    expect(toPermissionName('tutorials', 'edit')).toBe('Tutorials.Edit');
    expect(toPermissionName('resources', 'delete')).toBe('Resources.Delete');
    expect(toPermissionName('submissions', 'create')).toBe('Submissions.Create');
    expect(toPermissionName('submissions', 'view')).toBe('Submissions.View');
    expect(toPermissionName('approvals', 'view')).toBe('Approvals.View');
    expect(toPermissionName('reviews', 'moderate')).toBe('Reviews.Moderate');
    expect(toPermissionName('certificates', 'issue')).toBe('Certificates.Issue');
  });

  it('maps the team module to its backend Team.* group', () => {
    expect(toPermissionName('team', 'view')).toBe('Team.View');
    expect(toPermissionName('team', 'assign')).toBe('Team.Assign');
    expect(toPermissionName('team', 'manage')).toBe('Team.Manage');
  });

  it('applies the settings/manage override to Settings.Edit', () => {
    expect(toPermissionName('settings', 'manage')).toBe('Settings.Edit');
    expect(toPermissionName('settings', 'view')).toBe('Settings.View');
  });
});
