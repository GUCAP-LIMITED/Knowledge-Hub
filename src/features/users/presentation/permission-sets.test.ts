import { describe, expect, it } from 'vitest';
import {
  BASE_CAP,
  type PermissionGrid,
  countGrid,
  enforceModuleDeps,
} from './permission-catalog';
import {
  type PermissionSet,
  baseSetFor,
  buildDefaultSets,
  diffOverrides,
  effectiveGrid,
  effectiveValue,
  hasOverride,
} from './permission-sets';

const setById = (id: string): PermissionSet => {
  const set = buildDefaultSets().find((entry) => entry.id === id);
  if (set === undefined) {
    throw new Error(`missing set ${id}`);
  }
  return set;
};

describe('permission catalog', () => {
  it('seeds each set with a distinct, decreasing number of grants', () => {
    expect(countGrid(setById('full-access').grid)).toBe(41);
    expect(countGrid(setById('manager-access').grid)).toBe(34);
    expect(countGrid(setById('team-leader-access').grid)).toBe(13);
    expect(countGrid(setById('basic-access').grid)).toBe(11);
  });

  it('clears every dependent capability when the base View is off', () => {
    const grid: PermissionGrid = {
      courses: { view: false, create: true, edit: true },
    };
    const fixed = enforceModuleDeps(grid, 'courses');
    expect(fixed.courses?.create).toBe(false);
    expect(fixed.courses?.edit).toBe(false);
  });

  it('keeps dependents intact when View is on', () => {
    const grid: PermissionGrid = {
      courses: { view: true, create: true, edit: false },
    };
    const fixed = enforceModuleDeps(grid, 'courses');
    expect(fixed.courses?.create).toBe(true);
    expect(fixed.courses?.edit).toBe(false);
  });
});

describe('per-user overrides', () => {
  it('resolves the base set from the role when no set is assigned', () => {
    const sets = buildDefaultSets();
    expect(baseSetFor(sets, 'admin', null).id).toBe('full-access');
    expect(baseSetFor(sets, 'consultant', null).id).toBe('basic-access');
    expect(baseSetFor(sets, 'consultant', 'full-access').id).toBe('full-access');
  });

  it('records only the cells that differ from the base set', () => {
    const base = setById('basic-access');
    const effective = effectiveGrid(base, {});
    effective.courses = { ...effective.courses, [BASE_CAP]: true, create: true };
    const overrides = diffOverrides(base, effective);
    expect(hasOverride(overrides, 'courses', 'create')).toBe(true);
    expect(hasOverride(overrides, 'tutorials', 'view')).toBe(false);
    expect(effectiveValue(base, overrides, 'courses', 'create')).toBe(true);
  });

  it('round-trips an override back to the base value', () => {
    const base = setById('manager-access');
    const withOverride = effectiveGrid(base, { courses: { view: false } });
    const overrides = diffOverrides(base, withOverride);
    // manager has courses.view on by default, so turning it off is an override
    expect(hasOverride(overrides, 'courses', 'view')).toBe(true);
    expect(effectiveValue(base, overrides, 'courses', 'view')).toBe(false);
  });
});
