import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { buildSubmission } from '@testing';
import { RejectionReason } from '../value-objects/rejection-reason';

describe('Submission transitions', () => {
  it('approves a submission awaiting decision', () => {
    const result = buildSubmission({ status: 'pending' }).approve();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.status).toBe('approved');
    }
  });

  it('flags only a pending submission for review', () => {
    expect(isOk(buildSubmission({ status: 'pending' }).flagForReview())).toBe(true);
    expect(isErr(buildSubmission({ status: 'approved' }).flagForReview())).toBe(true);
  });

  it('records the reason when rejecting', () => {
    const reason = RejectionReason.create('Superseded by the new template');
    expect(isOk(reason)).toBe(true);
    if (isOk(reason)) {
      const rejected = buildSubmission({ status: 'review' }).reject(reason.value);
      expect(isOk(rejected)).toBe(true);
      if (isOk(rejected)) {
        expect(rejected.value.status).toBe('rejected');
        expect(rejected.value.note).toBe('Superseded by the new template');
      }
    }
  });

  it('refuses illegal transitions', () => {
    expect(isErr(buildSubmission({ status: 'published' }).approve())).toBe(true);
    expect(isErr(buildSubmission({ status: 'pending' }).publish())).toBe(true);
    expect(isOk(buildSubmission({ status: 'approved' }).publish())).toBe(true);
  });
});
