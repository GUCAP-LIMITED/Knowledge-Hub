import { describe, expect, it, vi } from 'vitest';
import {
  PERMISSION_QUERY_OPTIONS,
  invalidateAllPermissions,
  permissionKeys,
} from './use-permissions';

describe('use-permissions cache policy and invalidation', () => {
  it('enforces immediate refetching and zero-stale-time policy', () => {
    expect(PERMISSION_QUERY_OPTIONS.staleTime).toBe(0);
    expect(PERMISSION_QUERY_OPTIONS.refetchOnMount).toBe('always');
    expect(PERMISSION_QUERY_OPTIONS.refetchOnWindowFocus).toBe('always');
    expect(PERMISSION_QUERY_OPTIONS.refetchOnReconnect).toBe('always');
  });

  it('exposes hierarchical permission query keys', () => {
    expect(permissionKeys.all).toEqual(['permissions']);
    expect(permissionKeys.mine).toEqual(['permissions', 'me']);
    expect(permissionKeys.myModules).toEqual(['permissions', 'my-modules']);
    expect(permissionKeys.sets).toEqual(['permission-sets']);
    expect(permissionKeys.set('set-1')).toEqual(['permission-sets', 'set-1']);
    expect(permissionKeys.typeDefaults).toEqual(['permission-type-defaults']);
    expect(permissionKeys.users).toEqual(['user-permissions']);
    expect(permissionKeys.user('u-1')).toEqual(['user-permissions', 'u-1']);
  });

  it('invalidates all permission scopes when mutating general permissions', () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    const mockClient = { invalidateQueries };

    invalidateAllPermissions(mockClient);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['permissions'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['permission-sets'] });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['permission-type-defaults'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['user-permissions'] });
  });

  it('invalidates specific user and set scopes when provided', () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    const mockClient = { invalidateQueries };

    invalidateAllPermissions(mockClient, 'user-123', 'set-456');

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['permissions'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['permission-sets'] });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['permission-sets', 'set-456'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['permission-type-defaults'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['user-permissions'] });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['user-permissions', 'user-123'],
    });
  });
});
