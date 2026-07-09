import { describe, expect, it } from 'vitest';
import { buildUserAccount } from '@testing/builders/user-account.builder';

describe('UserAccount', () => {
  it('is active when its status is active', () => {
    expect(buildUserAccount({ status: 'active' }).isActive()).toBe(true);
  });

  it('is not active when its status is inactive', () => {
    expect(buildUserAccount({ status: 'inactive' }).isActive()).toBe(false);
  });
});
