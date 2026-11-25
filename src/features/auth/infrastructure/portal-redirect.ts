/** Uapp Portal SSO configuration (from env, via the composition root). */
export interface PortalConfig {
  readonly loginUrl: string;
  readonly key: string;
}

interface PortalRedirectOptions {
  readonly origin: string;
  readonly pathname: string;
}

/** The SSO query params: where to return (`redirect` + `pathname`) and the app `key`. */
export function buildPortalParams(
  config: PortalConfig,
  opts: PortalRedirectOptions,
): URLSearchParams {
  return new URLSearchParams({
    redirect: opts.origin,
    pathname: opts.pathname,
    key: config.key,
  });
}

/**
 * Build the Uapp Portal login URL. The Portal authenticates the user and redirects back to
 * `origin` with `?token=<secret>` (+ the echoed `pathname`). Pure — the presentation triggers the
 * actual `window.location.assign`.
 */
export function buildPortalLoginUrl(
  config: PortalConfig,
  opts: PortalRedirectOptions,
): string {
  return `${config.loginUrl}?${buildPortalParams(config, opts).toString()}`;
}

/** Only same-origin absolute paths are safe post-login redirect targets. */
export function safeReturnPath(raw: string | null): string {
  if (raw === null || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/';
  }
  return raw;
}

/** The page to return to after SSO: a `pathname` carried in the URL (sign-out), else the current one. */
export function resolveReturnPath(search: string, currentPathname: string): string {
  const carried = new URLSearchParams(search).get('pathname');
  return carried === null ? currentPathname : safeReturnPath(carried);
}
