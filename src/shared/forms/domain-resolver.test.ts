import { describe, expect, it } from 'vitest';
import type { ResolverOptions, ResolverResult } from 'react-hook-form';
import { Email } from '@core/domain';
import { domainResolver } from './domain-resolver';

interface Form {
  email: string;
}

// The resolver ignores context + options, so a stub is fine for tests.
const noOptions = {} as ResolverOptions<Form>;
const run = async (values: Form): Promise<ResolverResult<Form>> =>
  domainResolver<Form>({ email: Email.create })(values, undefined, noOptions);

describe('domainResolver', () => {
  it('passes the values through unchanged when every field is valid', async () => {
    const result = await run({ email: 'user@example.com' });

    expect(result.errors).toEqual({});
    expect(result.values).toEqual({ email: 'user@example.com' });
  });

  it("surfaces the value object's error as the field message", async () => {
    const result = await run({ email: 'not-an-email' });

    const errors = result.errors as Record<string, { type?: string; message?: string }>;
    expect(result.values).toEqual({});
    expect(errors.email?.message).toContain('not a valid email');
    expect(errors.email?.type).toBe('INVALID_EMAIL');
  });

  it('skips fields with no validator', async () => {
    const result = await domainResolver<Form>({})(
      { email: 'whatever' },
      undefined,
      noOptions,
    );

    expect(result.errors).toEqual({});
    expect(result.values).toEqual({ email: 'whatever' });
  });
});
