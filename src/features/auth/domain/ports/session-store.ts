import type { AuthSession } from '../entities/auth-session';

/**
 * Port for persisting the active session across reloads. The domain only cares that a session can
 * be saved, loaded and cleared — *where* (localStorage, cookie, memory) is an infrastructure
 * decision. Implementations must return `null` (never throw) for missing or corrupt data.
 */
export interface SessionStore {
  load(): AuthSession | null;
  save(session: AuthSession): void;
  clear(): void;
}
