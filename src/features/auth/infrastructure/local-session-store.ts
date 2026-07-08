import { z } from 'zod';
import type { Logger } from '@core/logger';
import { isErr } from '@core/result';
import { AuthSession, type SessionStore } from '../domain';

const STORAGE_KEY = 'app.auth.session';

const SnapshotSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
    roles: z.array(z.string()),
    userType: z.string().nullable(),
  }),
  accessToken: z.string(),
  refreshToken: z.string().nullable(),
  tokenType: z.string(),
  expiresAtIso: z.string(),
});

/** Abstraction over Web Storage so the store is unit-testable without a DOM. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Persists the session in Web Storage so a reload keeps the user signed in.
 *
 * Trade-off: tokens in `localStorage` are readable by any script in this origin, so XSS hygiene
 * (strict CSP, no `dangerouslySetInnerHTML` with untrusted input) is the mitigation. An
 * httpOnly-cookie BFF would be stronger; this implementation can be swapped without touching the
 * domain because callers depend on the `SessionStore` port, not on this class.
 */
export class LocalSessionStore implements SessionStore {
  private readonly storage: KeyValueStorage;
  private readonly logger: Logger;

  public constructor(storage: KeyValueStorage, logger: Logger) {
    this.storage = storage;
    this.logger = logger.child('session-store');
  }

  public load(): AuthSession | null {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    const parsed = SnapshotSchema.safeParse(this.tryParseJson(raw));
    if (!parsed.success) {
      this.logger.warn('Discarding corrupt persisted session');
      this.clear();
      return null;
    }

    const restored = AuthSession.restore(parsed.data);
    if (isErr(restored)) {
      this.logger.warn('Discarding unrestorable persisted session');
      this.clear();
      return null;
    }

    return restored.value;
  }

  public save(session: AuthSession): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(session.snapshot()));
  }

  public clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }

  private tryParseJson(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
