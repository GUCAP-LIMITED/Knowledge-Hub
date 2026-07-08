import type { KeyValueStorage } from '@features/auth';

/** Deterministic, DOM-free `KeyValueStorage` for tests. */
export class InMemoryStorage implements KeyValueStorage {
  private readonly map = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  public removeItem(key: string): void {
    this.map.delete(key);
  }
}
