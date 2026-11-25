import { describe, expect, it } from 'vitest';
import { hasPermissionGrant } from './permission-grant';

describe('hasPermissionGrant', () => {
  it('is false while the permission map is not loaded', () => {
    expect(hasPermissionGrant(undefined, 'Courses.View')).toBe(false);
  });

  it('matches an exact granted key', () => {
    expect(hasPermissionGrant({ 'Courses.View': true }, 'Courses.View')).toBe(true);
  });

  it('matches ignoring case and separators', () => {
    expect(hasPermissionGrant({ courses_view: true }, 'Courses.View')).toBe(true);
  });

  it('is false for a denied or missing key', () => {
    expect(hasPermissionGrant({ 'Courses.View': false }, 'Courses.View')).toBe(false);
    expect(hasPermissionGrant({}, 'Courses.View')).toBe(false);
  });
});
