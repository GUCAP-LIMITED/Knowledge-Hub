import { describe, expect, it } from 'vitest';
import type { UserTypeHierarchyNode } from '../domain';
import { computeHierarchyLevel } from './user-type-constants';

const sampleChain: UserTypeHierarchyNode[] = [
  {
    userTypeId: 'ut-1',
    userTypeName: 'System Admin',
    hierarchyLevel: 6,
    canLogin: true,
    reportsTo: 'Top of Hierarchy',
    reports: [],
  },
  {
    userTypeId: 'ut-2',
    userTypeName: 'Admin',
    hierarchyLevel: 5,
    canLogin: true,
    reportsTo: 'System Admin',
    reports: [],
  },
  {
    userTypeId: 'ut-3',
    userTypeName: 'Branch Manager',
    hierarchyLevel: 4,
    canLogin: true,
    reportsTo: 'Admin',
    reports: [],
  },
  {
    userTypeId: 'ut-4',
    userTypeName: 'Sales Manager',
    hierarchyLevel: 3,
    canLogin: true,
    reportsTo: 'Branch Manager',
    reports: [],
  },
  {
    userTypeId: 'ut-5',
    userTypeName: 'Sales Team Leader',
    hierarchyLevel: 2,
    canLogin: true,
    reportsTo: 'Sales Manager',
    reports: [],
  },
  {
    userTypeId: 'ut-6',
    userTypeName: 'Consultant',
    hierarchyLevel: 1,
    canLogin: true,
    reportsTo: 'Sales Team Leader',
    reports: [],
  },
];

describe('computeHierarchyLevel', () => {
  describe('Edit mode', () => {
    it('moving from level 4 to under System Admin (level 6) computes level 5', () => {
      // Branch Manager (ut-3, level 4) moved to slot 0 (under System Admin, ut-1, level 6)
      const level = computeHierarchyLevel(sampleChain, 0, 'ut-3');
      expect(level).toBe(5);
    });

    it('moving to under Sales Manager (level 3) computes level 3', () => {
      // Branch Manager (ut-3, level 4) moved to slot 3 (under Sales Manager, ut-4, level 3)
      const level = computeHierarchyLevel(sampleChain, 3, 'ut-3');
      expect(level).toBe(3);
    });

    it('moving to under Consultant (level 1) computes level 1', () => {
      // Branch Manager (ut-3, level 4) moved to slot 5 (under Consultant, ut-6, level 1)
      const level = computeHierarchyLevel(sampleChain, 5, 'ut-3');
      expect(level).toBe(1);
    });

    it('selecting slot immediately below target returns current level', () => {
      // Branch Manager (ut-3, slot 2)
      const level = computeHierarchyLevel(sampleChain, 2, 'ut-3');
      expect(level).toBe(4);
    });
  });

  describe('Create mode', () => {
    it('inserting under System Admin (level 6) computes level 6 for the new role', () => {
      const level = computeHierarchyLevel(sampleChain, 0);
      expect(level).toBe(6);
    });

    it('inserting under Consultant (level 1) computes level 1 for the new role', () => {
      const level = computeHierarchyLevel(sampleChain, 5);
      expect(level).toBe(1);
    });
  });
});
