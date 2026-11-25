import { describe, expect, it } from 'vitest';
import type { PermissionModule } from '../domain';
import {
  flattenModules,
  toGrantMap,
  getEditableModules,
  hasPermissionChanges,
} from './permission-tree';

const createModule = (overrides: Partial<PermissionModule> = {}): PermissionModule => ({
  moduleId: 'test-module',
  moduleName: 'Test Module',
  icon: null,
  href: '/test',
  basePermission: 'Test.View',
  isEnabled: true,
  permissions: { 'Test.View': true },
  children: [],
  ...overrides,
});

describe('permission-tree utilities', () => {
  describe('flattenModules', () => {
    it('flattens a nested module hierarchy in preorder', () => {
      const child = createModule({ moduleId: 'child', moduleName: 'Child' });
      const parent = createModule({
        moduleId: 'parent',
        moduleName: 'Parent',
        children: [child],
      });

      const result = flattenModules([parent]);

      expect(result.map((m) => m.moduleId)).toEqual(['parent', 'child']);
    });
  });

  describe('toGrantMap', () => {
    it('seeds a flat grant map from all permissions across modules', () => {
      const mod1 = createModule({
        moduleId: 'm1',
        permissions: { 'Perm.A': true, 'Perm.B': false },
      });
      const mod2 = createModule({
        moduleId: 'm2',
        permissions: { 'Perm.C': true },
      });

      const grantMap = toGrantMap([mod1, mod2]);

      expect(grantMap).toEqual({
        'Perm.A': true,
        'Perm.B': false,
        'Perm.C': true,
      });
    });
  });

  describe('getEditableModules', () => {
    it('filters out modules with no permissions', () => {
      const emptyMod = createModule({ moduleId: 'empty', permissions: {} });
      const normalMod = createModule({
        moduleId: 'normal',
        permissions: { 'Normal.View': true },
      });

      const result = getEditableModules([emptyMod, normalMod]);

      expect(result.map((m) => m.moduleId)).toEqual(['normal']);
    });

    it('retains both reviews and course-reviews modules without filtering', () => {
      const courseReviews = createModule({
        moduleId: 'course-reviews',
        moduleName: 'Course Reviews',
        permissions: {
          'CourseReviews.View': true,
        },
      });
      const reviews = createModule({
        moduleId: 'reviews',
        moduleName: 'Reviews',
        permissions: {
          'Reviews.View': true,
          'Reviews.Delete': false,
        },
      });

      const result = getEditableModules([courseReviews, reviews]);

      expect(result.some((m) => m.moduleId === 'course-reviews')).toBe(true);
      expect(result.some((m) => m.moduleId === 'reviews')).toBe(true);
    });

    it('preserves reviews moduleName as Reviews', () => {
      const reviews = createModule({
        moduleId: 'reviews',
        moduleName: 'Reviews',
        permissions: {
          'Reviews.View': true,
          'Reviews.Delete': false,
        },
      });

      const result = getEditableModules([reviews]);

      expect(result).toHaveLength(1);
      const first = result[0];
      expect(first?.moduleId).toBe('reviews');
      expect(first?.moduleName).toBe('Reviews');
    });

    it('preserves other modules unchanged', () => {
      const courses = createModule({
        moduleId: 'courses',
        moduleName: 'Courses',
        permissions: { 'Courses.View': true },
      });

      const result = getEditableModules([courses]);

      expect(result).toHaveLength(1);
      const first = result[0];
      expect(first?.moduleId).toBe('courses');
      expect(first?.moduleName).toBe('Courses');
    });
  });

  describe('hasPermissionChanges', () => {
    it('returns false when initial and current grants are identical', () => {
      const initial = { 'Courses.View': true, 'Courses.Create': false };
      const current = { 'Courses.View': true, 'Courses.Create': false };

      expect(hasPermissionChanges(initial, current)).toBe(false);
    });

    it('returns true when a grant value is changed', () => {
      const initial = { 'Courses.View': true, 'Courses.Create': false };
      const current = { 'Courses.View': true, 'Courses.Create': true };

      expect(hasPermissionChanges(initial, current)).toBe(true);
    });

    it('returns false when a changed grant is reverted back to initial value', () => {
      const initial = { 'Courses.View': true, 'Courses.Create': false };
      const changed = { 'Courses.View': true, 'Courses.Create': true };
      const reverted = { 'Courses.View': true, 'Courses.Create': false };

      expect(hasPermissionChanges(initial, changed)).toBe(true);
      expect(hasPermissionChanges(initial, reverted)).toBe(false);
    });

    it('returns true when keys count differs', () => {
      const initial = { 'Courses.View': true };
      const current = { 'Courses.View': true, 'Courses.Create': false };

      expect(hasPermissionChanges(initial, current)).toBe(true);
    });
  });
});
