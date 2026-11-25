import { type Result, ok, err } from '@core/result';
import { Email } from '@core/domain';
import { formatDisplayName } from '@shared/utils';
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
  readonly team_ids?: string;
  readonly team_names?: string;
  readonly exp?: number;
}

/** Parse a CSV claim into a list of non-empty strings (e.g. branch ids, team names). */
function parseCsvClaim(claim: string | undefined): string[] {
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
  const rawName = claims.name ?? claims.preferred_username ?? input.displayEmail;
  const fullName = formatDisplayName(rawName);
  const user = new AuthenticatedUser({
    id: claims.sub ?? input.email.value,
    email: input.email,
    fullName: fullName.length > 0 ? fullName : input.email.value,
    userType: claims.active_user_type ?? null,
    branchIds: parseCsvClaim(claims.branch_ids),
    teamIds: parseCsvClaim(claims.team_ids),
    teamNames: parseCsvClaim(claims.team_names),
  });

  return new AuthSession({
    user,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    tokenType: 'Bearer',
    expiresAt: new Date(input.now.getTime() + input.expiresIn * 1000),
  });
}
