import { describe, expect, it } from 'vitest';
import { isErr, isOk, ok } from '@core/result';
import { silentLogger } from '@testing';
import { FakeAssignmentGateway } from '@testing/fakes/fake-assignment-gateway';
import { buildAssignment } from '@testing/builders/assignment.builder';
import { CreateAssignmentUseCase } from './create-assignment';

const makeUseCase = (gateway: FakeAssignmentGateway): CreateAssignmentUseCase =>
  new CreateAssignmentUseCase({ assignmentGateway: gateway, logger: silentLogger() });

describe('CreateAssignmentUseCase', () => {
  it('creates an assignment from valid input', async () => {
    const gateway = new FakeAssignmentGateway();
    const created = buildAssignment({ id: 'as-9', assignee: 'All Consultants' });
    gateway.createResult = ok(created);

    const result = await makeUseCase(gateway).execute({
      course: 'Compliance & Legal Requirements',
      assignee: 'All Consultants',
      dueDate: new Date('2024-06-01T00:00:00.000Z'),
    });

    expect(isOk(result)).toBe(true);
    expect(gateway.lastCreated?.assignee).toBe('All Consultants');
    expect(gateway.lastCreated?.status).toBe('active');
  });

  it('rejects an empty assignee', async () => {
    const gateway = new FakeAssignmentGateway();

    const result = await makeUseCase(gateway).execute({
      course: 'Compliance & Legal Requirements',
      assignee: '   ',
      dueDate: new Date('2024-06-01T00:00:00.000Z'),
    });

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe('ASSIGNMENTS_INVALID_TARGET');
    }
    expect(gateway.lastCreated).toBeNull();
  });
});
