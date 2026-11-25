import type { MockUser } from './mock-users';

const encode = (value: unknown): string =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const decode = (segment: string): Record<string, unknown> => {
  try {
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    return JSON.parse(
      new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))),
    ) as Record<string, unknown>;
  } catch {
    return {};
  }
};

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 8;

/** An unsigned JWT carrying the claims `decode-jwt.ts` reads. Demo only — never a real credential. */
export const issueAccessToken = (user: MockUser, nowMs: number): string => {
  const claims = {
    sub: user.id,
    name: user.name,
    email: user.email,
    preferred_username: user.email,
    is_global: user.isGlobal ? 'True' : 'False',
    active_user_type_id: user.userTypeId,
    active_user_type: user.userTypeName,
    data_scope: String(user.dataScope),
    branch_ids: user.branchIds.join(','),
    team_ids: user.teamIds.join(','),
    team_names: user.teamNames.join(','),
    exp: Math.floor(nowMs / 1000) + ACCESS_TOKEN_TTL_SECONDS,
  };
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(claims)}.mock`;
};

export const userIdFromAccessToken = (token: string): string | null => {
  const sub = decode(token.split('.')[1] ?? '').sub;
  return typeof sub === 'string' ? sub : null;
};
