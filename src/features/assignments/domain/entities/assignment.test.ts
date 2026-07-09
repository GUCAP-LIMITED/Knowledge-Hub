import { describe, expect, it } from 'vitest';
import { buildAssignment } from '@testing/builders/assignment.builder';

describe('Assignment', () => {
  it('reports overdue when past due and not completed', () => {
    const assignment = buildAssignment({
      status: 'active',
      dueDate: new Date('2024-01-01T00:00:00.000Z'),
    });
    expect(assignment.isOverdue(new Date('2024-02-01T00:00:00.000Z'))).toBe(true);
  });

  it('is not overdue before the due date', () => {
    const assignment = buildAssignment({
      status: 'active',
      dueDate: new Date('2024-02-01T00:00:00.000Z'),
    });
    expect(assignment.isOverdue(new Date('2024-01-01T00:00:00.000Z'))).toBe(false);
  });

  it('is never overdue once completed', () => {
    const assignment = buildAssignment({
      status: 'completed',
      dueDate: new Date('2024-01-01T00:00:00.000Z'),
    });
    expect(assignment.isOverdue(new Date('2024-02-01T00:00:00.000Z'))).toBe(false);
  });
});
