import { describe, expect, it } from 'vitest';
import { toPermissionName } from './capability-permission-map';

describe('toPermissionName', () => {
  it('maps a client (module, cap) pair to the PascalCase backend key', () => {
    expect(toPermissionName('courses', 'edit')).toBe('Courses.Edit');
    expect(toPermissionName('courses', 'delete')).toBe('Courses.Delete');
    expect(toPermissionName('tutorials', 'edit')).toBe('Tutorials.Edit');
    expect(toPermissionName('resources', 'delete')).toBe('Resources.Delete');
    expect(toPermissionName('submissions', 'view')).toBe('MySubmissions.View');
    expect(toPermissionName('submissions', 'edit')).toBe('MySubmissions.Edit');
    expect(toPermissionName('submissions', 'delete')).toBe('MySubmissions.Delete');
    expect(toPermissionName('upload', 'view')).toBe('Submissions.View');
    expect(toPermissionName('upload', 'create')).toBe('Submissions.Create');
    expect(toPermissionName('approvals', 'view')).toBe('Approvals.View');
    expect(toPermissionName('course-reviews', 'view')).toBe('CourseReviews.View');
    expect(toPermissionName('reviews', 'delete')).toBe('Reviews.Delete');
    expect(toPermissionName('certificates', 'issue')).toBe('Certificates.Issue');
  });

  it('maps the team module to its backend Team.* group', () => {
    expect(toPermissionName('team', 'view')).toBe('Team.View');
    expect(toPermissionName('team', 'manage')).toBe('Team.Manage');
  });

  it('maps decoupled assign and team-progress modules to their respective backend groups', () => {
    expect(toPermissionName('assign', 'view')).toBe('Assignments.View');
    expect(toPermissionName('assign', 'create')).toBe('Assignments.Create');
    expect(toPermissionName('assign', 'edit')).toBe('Assignments.Edit');
    expect(toPermissionName('assign', 'delete')).toBe('Assignments.Delete');
    expect(toPermissionName('team-progress', 'view')).toBe('TeamProgress.View');
  });

  it('applies the settings/manage override to Settings.Edit', () => {
    expect(toPermissionName('settings', 'manage')).toBe('Settings.Edit');
    expect(toPermissionName('settings', 'view')).toBe('Settings.View');
  });
});
