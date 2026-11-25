import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserScopeData } from '../domain';
import {
  clearCachedUserScope,
  getCachedUserScope,
  setCachedUserScope,
} from './user-scope-cache';

const sampleScope: UserScopeData = {
  branches: [
    { id: 'b1', name: 'Branch 1', code: 'P1', isPrimary: true },
    { id: 'b2', name: 'Branch 2', isPrimary: false },
  ],
  teams: [
    { id: 't1', name: 'Sales' },
    { id: 't2', name: 'Marketing' },
  ],
};

describe('user-scope-cache', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when cache is empty', () => {
    expect(getCachedUserScope()).toBeNull();
    expect(getCachedUserScope('user-1')).toBeNull();
  });

  it('sets and retrieves cached scope data within TTL', () => {
    setCachedUserScope(sampleScope, 'user-1');
    const cached = getCachedUserScope('user-1');
    expect(cached).toEqual(sampleScope);
  });

  it('expires and removes cached scope data after 5 minutes TTL', () => {
    setCachedUserScope(sampleScope, 'user-1');
    expect(getCachedUserScope('user-1')).toEqual(sampleScope);

    // Fast-forward 5 minutes + 1 second
    vi.advanceTimersByTime(5 * 60 * 1000 + 1000);

    expect(getCachedUserScope('user-1')).toBeNull();
  });

  it('clears specific user cache when userId is provided', () => {
    setCachedUserScope(sampleScope, 'user-1');
    setCachedUserScope(sampleScope, 'user-2');

    clearCachedUserScope('user-1');

    expect(getCachedUserScope('user-1')).toBeNull();
    expect(getCachedUserScope('user-2')).toEqual(sampleScope);
  });

  it('clears all user-scope caches when clearCachedUserScope is called without arguments', () => {
    setCachedUserScope(sampleScope);
    setCachedUserScope(sampleScope, 'user-1');
    setCachedUserScope(sampleScope, 'user-2');

    clearCachedUserScope();

    expect(getCachedUserScope()).toBeNull();
    expect(getCachedUserScope('user-1')).toBeNull();
    expect(getCachedUserScope('user-2')).toBeNull();
  });

  it('discards malformed cache JSON or corrupted data structure gracefully', () => {
    localStorage.setItem('uapp_user_scope_data', '{ "invalid": json');
    expect(getCachedUserScope()).toBeNull();

    localStorage.setItem(
      'uapp_user_scope_data',
      JSON.stringify({ timestamp: Date.now(), data: { invalid: true } }),
    );
    expect(getCachedUserScope()).toBeNull();
  });
});
