import type { KeyValueStorage } from './local-session-store';

const STORAGE_KEY = 'app.auth.sso-secret';

/** Port the auth store uses to keep the Portal SSO secret around after the `?token=` exchange. */
export interface SsoSecretStore {
  load(): string | null;
  save(secret: string): void;
  clear(): void;
}

/**
 * Keeps the raw Portal SSO secret (the `?token=` value) in Web Storage. The exchange only yields
 * Academy's own access token, but the embedded App Launcher widget lives on the SSO origin and,
 * under third-party storage partitioning, cannot read the SSO app's own storage — so the host must
 * hand it this secret via the iframe URL.
 */
export class LocalSsoSecretStore implements SsoSecretStore {
  private readonly storage: KeyValueStorage;

  public constructor(storage: KeyValueStorage) {
    this.storage = storage;
  }

  public load(): string | null {
    const value = this.storage.getItem(STORAGE_KEY);
    return value !== null && value.length > 0 ? value : null;
  }

  public save(secret: string): void {
    this.storage.setItem(STORAGE_KEY, secret);
  }

  public clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }
}
