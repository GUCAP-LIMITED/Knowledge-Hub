import type { AuthSession, SessionStore } from '@features/auth/domain';

/** In-memory {@link SessionStore} that records calls for assertions. */
export class FakeSessionStore implements SessionStore {
  public current: AuthSession | null = null;
  public saveCalls = 0;
  public clearCalls = 0;

  public constructor(initial: AuthSession | null = null) {
    this.current = initial;
  }

  public load(): AuthSession | null {
    return this.current;
  }

  public save(session: AuthSession): void {
    this.saveCalls += 1;
    this.current = session;
  }

  public clear(): void {
    this.clearCalls += 1;
    this.current = null;
  }
}
