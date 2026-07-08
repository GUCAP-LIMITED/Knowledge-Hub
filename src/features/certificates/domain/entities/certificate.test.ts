import { describe, expect, it } from 'vitest';
import { buildCertificate } from '@testing/builders/certificate.builder';

describe('Certificate', () => {
  it('matches the owning learner case-insensitively', () => {
    const certificate = buildCertificate({ userName: 'Simona' });
    expect(certificate.belongsTo('simona')).toBe(true);
    expect(certificate.belongsTo('SIMONA')).toBe(true);
    expect(certificate.belongsTo('Marcus')).toBe(false);
  });

  it('reports the year it was issued', () => {
    const certificate = buildCertificate({
      issuedDate: new Date('2026-01-10T00:00:00.000Z'),
    });
    expect(certificate.issuedYear()).toBe(2026);
  });
});
