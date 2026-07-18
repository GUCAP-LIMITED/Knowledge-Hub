import { type Result, ok, err } from '@core/result';
import { Email } from '@core/domain';
import {
  type AuthError,
  AuthServiceUnavailableError,
  AuthenticatedUser,
  AuthSession,
} from '../domain';

/** The subset of Academy JWT claims this app reads. All optional — tokens vary by grant/scope. */
export interface JwtClaims {
  readonly sub?: string;
  readonly name?: string;
  readonly preferred_username?: string;
  readonly email?: string;
  readonly is_global?: string;
  readonly active_user_type_id?: string;
  readonly active_user_type?: string;
  readonly data_scope?: string; // "0" Self · "5" Team · "10" BranchAll · "15" FullAccess
  readonly branch_ids?: string; // CSV of the branches this user is assigned to
  readonly exp?: number;
}

/** The branch ids the user can access (CSV claim → list; empty for host/global users). */
function parseBranchIds(claim: string | undefined): string[] {
  return (claim ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

function base64UrlDecode(input: string): string {
  const padded =
    input.length % 4 === 0 ? input : input + '='.repeat(4 - (input.length % 4));
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Decode a JWT's payload claims. Returns `{}` on any malformed input (never throws). */
export function decodeAccessToken(token: string): JwtClaims {
  const payload = token.split('.')[1];
  if (payload === undefined) {
    return {};
  }
  try {
    return JSON.parse(base64UrlDecode(payload)) as JwtClaims;
  } catch {
    return {};
  }
}

/**
 * Coarse frontend role derived from claims, so the role-gated routes keep working. Fine-grained
 * gating uses the permissions slice (`useHasPermission`), not these roles.
 */
export function deriveRoles(claims: JwtClaims): string[] {
  // FullAccess (15) and BranchAll (10) are admin-tier; Team (5) is manager; Self (0) is consultant.
  if (
    claims.is_global === 'true' ||
    claims.data_scope === '15' ||
    claims.data_scope === '10'
  ) {
    return ['admin'];
  }
  if (claims.data_scope === '5') {
    return ['manager'];
  }
  return ['consultant'];
}

/** Build a domain session from decoded claims + the raw tokens. */
export function toSessionFromClaims(input: {
  readonly claims: JwtClaims;
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresIn: number;
  readonly now: Date;
}): Result<AuthSession, AuthError> {
  const { claims } = input;
  const rawEmail = claims.email ?? claims.preferred_username ?? '';
  const email = Email.create(rawEmail);
  if (!email.ok) {
    // Fall back to a synthetic address so a token without an email claim still yields a session.
    const local = (claims.sub ?? 'user').replace(/[^a-z0-9._-]/gi, '');
    const synthetic = Email.create(`${local === '' ? 'user' : local}@uapp.local`);
    if (!synthetic.ok) {
      return err(new AuthServiceUnavailableError(synthetic.error));
    }
    return ok(buildSession({ ...input, email: synthetic.value, displayEmail: rawEmail }));
  }
  return ok(buildSession({ ...input, email: email.value, displayEmail: rawEmail }));
}

function buildSession(input: {
  readonly claims: JwtClaims;
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresIn: number;
  readonly now: Date;
  readonly email: Email;
  readonly displayEmail: string;
}): AuthSession {
  const { claims } = input;
  const fullName = claims.name ?? claims.preferred_username ?? input.displayEmail;
  const user = new AuthenticatedUser({
    id: claims.sub ?? input.email.value,
    email: input.email,
    fullName: fullName.trim().length > 0 ? fullName : input.email.value,
    roles: deriveRoles(claims),
    userType: claims.active_user_type ?? null,
    branchIds: parseBranchIds(claims.branch_ids),
  });

  return new AuthSession({
    user,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    tokenType: 'Bearer',
    expiresAt: new Date(input.now.getTime() + input.expiresIn * 1000),
  });
}
