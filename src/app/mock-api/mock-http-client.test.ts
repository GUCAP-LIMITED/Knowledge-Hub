import { describe, expect, it } from 'vitest';
import { HttpError } from '@core/http';
import { SystemClock } from '@core/time';
import { silentLogger } from '@testing';
import { MockHttpClient } from './mock-http-client';
import { buildMockRoutes } from './mock-routes';
import { createMockState } from './mock-state';

const createClient = (): { client: MockHttpClient; setToken: (t: string) => void } => {
  let token: string | undefined;
  const client = new MockHttpClient({
    routes: buildMockRoutes({ state: createMockState(), clock: new SystemClock() }),
    logger: silentLogger(),
    getAuthToken: () => token,
    latencyMs: 0,
  });
  return {
    client,
    setToken: (t) => {
      token = t;
    },
  };
};

const signIn = async (
  userId: string,
): Promise<{ client: MockHttpClient; token: string }> => {
  const { client, setToken } = createClient();
  const res = await client.postForm<{ access_token: string }>(
    '/connect/token',
    { grant_type: 'SsoSecret', secret: userId },
    { anonymous: true },
  );
  setToken(res.access_token);
  return { client, token: res.access_token };
};

describe('MockHttpClient', () => {
  it('rejects an unknown SSO secret with a 400', async () => {
    const { client } = createClient();
    await expect(
      client.postForm('/connect/token', { grant_type: 'SsoSecret', secret: 'nope' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('answers unmapped routes with a 404 HttpError', async () => {
    const { client } = createClient();
    await expect(client.get('/api/app/unknown')).rejects.toBeInstanceOf(HttpError);
  });

  it('grants the admin every permission and the consultant a learner subset', async () => {
    const admin = await signIn('user-admin');
    const consultant = await signIn('user-consultant');
    const adminPerms = await admin.client.get<Record<string, boolean>>(
      '/api/app/my/permissions',
    );
    const consultantPerms = await consultant.client.get<Record<string, boolean>>(
      '/api/app/my/permissions',
    );
    expect(adminPerms['Approvals.Approve']).toBe(true);
    expect(consultantPerms['Courses.View']).toBe(true);
    expect(consultantPerms['Approvals.Approve']).toBeUndefined();
  });

  it('builds a sidebar only from modules the user may open', async () => {
    const { client } = await signIn('user-consultant');
    const groups = await client.get<{ items: { href: string }[] }[]>(
      '/api/app/my/permission-modules',
    );
    const hrefs = groups.flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).toContain('/courses');
    expect(hrefs).not.toContain('/approvals');
  });
});
