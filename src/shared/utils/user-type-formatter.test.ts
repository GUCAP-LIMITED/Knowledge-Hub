import { describe, expect, it } from 'vitest';
import { formatUserType } from './user-type-formatter';

describe('formatUserType', () => {
  describe('CamelCase and PascalCase transformation', () => {
    it('splits PascalCase words with spaces and capitalizes them', () => {
      expect(formatUserType('BranchManager')).toBe('Branch Manager');
      expect(formatUserType('SystemAdmin')).toBe('System Admin');
      expect(formatUserType('SuperAdmin')).toBe('Super Admin');
      expect(formatUserType('CourseInstructor')).toBe('Course Instructor');
    });

    it('splits camelCase words with spaces and capitalizes the leading word', () => {
      expect(formatUserType('salesTeamLeader')).toBe('Sales Team Leader');
      expect(formatUserType('leadConsultant')).toBe('Lead Consultant');
    });

    it('handles alphanumeric boundaries cleanly', () => {
      expect(formatUserType('Tier1Support')).toBe('Tier1 Support');
      expect(formatUserType('Level2Admin')).toBe('Level2 Admin');
    });
  });

  describe('delimiter normalization and trimming', () => {
    it('replaces single underscores and hyphens with spaces', () => {
      expect(formatUserType('sales_team_leader')).toBe('Sales Team Leader');
      expect(formatUserType('regional-lead')).toBe('Regional Lead');
      expect(formatUserType('branch-manager')).toBe('Branch Manager');
    });

    it('collapses multiple consecutive delimiters and whitespace', () => {
      expect(formatUserType('  super---admin___lead   ')).toBe('Super Admin Lead');
      expect(formatUserType('guest__user--role')).toBe('Guest User Role');
      expect(formatUserType('multiple   spaces   between')).toBe(
        'Multiple Spaces Between',
      );
    });

    it('trims leading and trailing spaces', () => {
      expect(formatUserType('   BranchManager   ')).toBe('Branch Manager');
      expect(formatUserType('  super_admin  ')).toBe('Super Admin');
    });
  });

  describe('ALL-CAPS normalization and acronym preservation', () => {
    it('converts ALL-CAPS words (>= 4 chars) to Title Case', () => {
      expect(formatUserType('BRANCH_MANAGER')).toBe('Branch Manager');
      expect(formatUserType('SALES_TEAM_LEADER')).toBe('Sales Team Leader');
      expect(formatUserType('ADMINISTRATOR')).toBe('Administrator');
    });

    it('preserves short acronyms (<= 3 letters)', () => {
      expect(formatUserType('CRM')).toBe('CRM');
      expect(formatUserType('IT')).toBe('IT');
      expect(formatUserType('HR')).toBe('HR');
      expect(formatUserType('VP')).toBe('VP');
      expect(formatUserType('CEO')).toBe('CEO');
    });

    it('handles mixed acronyms and words correctly', () => {
      expect(formatUserType('CRM_ADMIN')).toBe('CRM Admin');
      expect(formatUserType('ITAdmin')).toBe('IT Admin');
      expect(formatUserType('HR_MANAGER')).toBe('HR Manager');
      expect(formatUserType('lead_QA_engineer')).toBe('Lead QA Engineer');
      expect(formatUserType('lead_qa_engineer')).toBe('Lead Qa Engineer');
    });
  });

  describe('edge cases and nullish safety', () => {
    it('returns empty string for null, undefined, or empty values', () => {
      expect(formatUserType(null)).toBe('');
      expect(formatUserType(undefined)).toBe('');
      expect(formatUserType('')).toBe('');
      expect(formatUserType('   ')).toBe('');
    });

    it('handles single word inputs in lowercase or uppercase', () => {
      expect(formatUserType('learner')).toBe('Learner');
      expect(formatUserType('ADMIN')).toBe('Admin');
      expect(formatUserType('admin')).toBe('Admin');
    });

    it('leaves already formatted Title Case strings clean', () => {
      expect(formatUserType('Branch Manager')).toBe('Branch Manager');
      expect(formatUserType('Sales Team Leader')).toBe('Sales Team Leader');
    });
  });
});
