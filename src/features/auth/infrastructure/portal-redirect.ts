/** Uapp Portal SSO configuration (from env, via the composition root). */
export interface PortalConfig {
  readonly loginUrl: string;
  readonly key: string;
}

/**
 * Build the Uapp Portal login URL. The Portal authenticates the user and redirects back to
 * `origin` with `?token=<secret>` (+ the echoed `pathname`). Pure — the presentation triggers the
 * actual `window.location.assign`.
 */
export function buildPortalLoginUrl(
  config: PortalConfig,
  opts: { readonly origin: string; readonly pathname: string; readonly logout?: boolean },
): string {
  const params = new URLSearchParams({
    redirect: opts.origin,
    logout: opts.logout === true ? 'true' : 'false',
    pathname: opts.pathname,
    key: config.key,
  });
  return `${config.loginUrl}?${params.toString()}`;
}
