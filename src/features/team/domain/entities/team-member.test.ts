import { describe, expect, it } from 'vitest';
import { buildTeamMember } from '@testing';

describe('TeamMember', () => {
  it('is on-track at or above 75% progress', () => {
    expect(buildTeamMember({ progress: 75 }).bucket()).toBe('on-track');
    expect(buildTeamMember({ progress: 100 }).bucket()).toBe('on-track');
  });

  it('is in-progress between 40% and 74% progress', () => {
    expect(buildTeamMember({ progress: 40 }).bucket()).toBe('in-progress');
    expect(buildTeamMember({ progress: 74 }).bucket()).toBe('in-progress');
  });

  it('is at-risk below 40% progress', () => {
    expect(buildTeamMember({ progress: 39 }).bucket()).toBe('at-risk');
    expect(buildTeamMember({ progress: 0 }).bucket()).toBe('at-risk');
  });

  it('clamps progress into 0..100', () => {
    expect(buildTeamMember({ progress: 150 }).progress).toBe(100);
    expect(buildTeamMember({ progress: -20 }).progress).toBe(0);
  });
});
