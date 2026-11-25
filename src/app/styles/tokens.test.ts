/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = join(process.cwd(), 'src');
const SOURCE_FILE = /\.(css|tsx?)$/;
const TEST_FILE = /\.test\.tsx?$/;

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(full);
    }
    return SOURCE_FILE.test(entry.name) && !TEST_FILE.test(entry.name) ? [full] : [];
  });

/** Every non-test source file as raw text, keyed by path relative to the repo root. */
const ENTRIES: readonly (readonly [string, string])[] = walk(SRC_ROOT).map((file) => [
  file.slice(SRC_ROOT.length - 3),
  readFileSync(file, 'utf8'),
]);
const GLOBAL_CSS =
  ENTRIES.find(([file]) =>
    file.replaceAll('\\', '/').endsWith('app/styles/global.css'),
  )?.[1] ?? '';

/**
 * Guards the dark-mode contract: a `var(--color-*)` with no fallback and no definition is silently
 * dropped by the browser, so that surface renders unthemed in BOTH light and dark.
 */
describe('colour design tokens', () => {
  const defined = new Set<string>();
  for (const [, text] of ENTRIES) {
    for (const match of text.matchAll(/(--color-[\w-]+)\s*:/g)) {
      defined.add(match[1] ?? '');
    }
  }

  it('scans the source tree', () => {
    expect(ENTRIES.length).toBeGreaterThan(100);
    expect(GLOBAL_CSS).toContain('--color-surface:');
  });

  it('defines every --color-* custom property that is used without a fallback', () => {
    const undefinedUses: string[] = [];
    for (const [file, text] of ENTRIES) {
      for (const match of text.matchAll(/var\((--color-[\w-]+)\s*\)/g)) {
        const name = match[1] ?? '';
        if (!defined.has(name)) {
          undefinedUses.push(`${file}: ${name}`);
        }
      }
    }
    expect(undefinedUses).toEqual([]);
  });

  it('lifts every *-strong status text token for the dark theme', () => {
    const dark = GLOBAL_CSS.slice(GLOBAL_CSS.indexOf("[data-theme='dark']"));
    for (const token of ['danger', 'success', 'warning', 'info']) {
      expect(dark).toContain(`--color-${token}-strong:`);
    }
  });
});
