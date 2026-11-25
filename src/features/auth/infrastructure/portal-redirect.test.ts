import { describe, expect, it } from 'vitest';
import { buildPortalLoginUrl, resolveReturnPath } from './portal-redirect';

describe('buildPortalLoginUrl', () => {
  it('encodes redirect, pathname and key (no logout)', () => {
    const url = buildPortalLoginUrl(
      { loginUrl: 'https://portal.uapp.uk/login', key: 'abc123' },
      { origin: 'https://academy.uapp.uk', pathname: '/courses' },
    );
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://portal.uapp.uk/login');
    expect(parsed.searchParams.get('redirect')).toBe('https://academy.uapp.uk');
    expect(parsed.searchParams.has('logout')).toBe(false);
    expect(parsed.searchParams.get('pathname')).toBe('/courses');
    expect(parsed.searchParams.get('key')).toBe('abc123');
  });
});

describe('resolveReturnPath', () => {
  it('uses the carried pathname, else the current one', () => {
    expect(resolveReturnPath('?pathname=%2Fcourses', '/login')).toBe('/courses');
    expect(resolveReturnPath('', '/login')).toBe('/login');
  });

  it('rejects unsafe carried paths', () => {
    expect(resolveReturnPath('?pathname=%2F%2Fevil.com', '/login')).toBe('/');
    expect(resolveReturnPath('?pathname=https%3A%2F%2Fevil.com', '/login')).toBe('/');
  });
});
