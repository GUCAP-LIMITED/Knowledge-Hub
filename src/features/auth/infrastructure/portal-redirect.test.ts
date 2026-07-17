import { describe, expect, it } from 'vitest';
import { buildPortalLoginUrl } from './portal-redirect';

describe('buildPortalLoginUrl', () => {
  it('encodes redirect, logout, pathname and key', () => {
    const url = buildPortalLoginUrl(
      { loginUrl: 'https://portal.uapp.uk/login', key: 'abc123' },
      { origin: 'https://academy.uapp.uk', pathname: '/courses' },
    );
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://portal.uapp.uk/login');
    expect(parsed.searchParams.get('redirect')).toBe('https://academy.uapp.uk');
    expect(parsed.searchParams.get('logout')).toBe('false');
    expect(parsed.searchParams.get('pathname')).toBe('/courses');
    expect(parsed.searchParams.get('key')).toBe('abc123');
  });
});
