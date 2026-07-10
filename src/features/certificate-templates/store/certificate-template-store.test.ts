import { describe, expect, it } from 'vitest';
import {
  type CertificateTemplate,
  DEFAULT_TEMPLATE,
  pickTemplate,
} from './certificate-template-store';

const make = (over: Partial<CertificateTemplate>): CertificateTemplate => ({
  id: 'x',
  name: 'x',
  userType: 'all',
  contentKind: 'all',
  accentColor: '#000',
  ...over,
});

describe('pickTemplate', () => {
  it('prefers an exact user-type and content-kind match', () => {
    const exact = make({ id: 'exact', userType: 'manager', contentKind: 'course' });
    const list = [DEFAULT_TEMPLATE, make({ id: 'generic', userType: 'manager' }), exact];
    expect(pickTemplate(list, ['manager'], 'course').id).toBe('exact');
  });

  it('falls back to a broader template when no exact match exists', () => {
    const list = [DEFAULT_TEMPLATE, make({ id: 'consultant', userType: 'consultant' })];
    expect(pickTemplate(list, ['manager'], 'course').id).toBe('default');
  });

  it('never returns a template targeting a different user type', () => {
    const list = [make({ id: 'admin-only', userType: 'admin', contentKind: 'course' })];
    expect(pickTemplate(list, ['consultant'], 'course').id).toBe('default');
  });
});
