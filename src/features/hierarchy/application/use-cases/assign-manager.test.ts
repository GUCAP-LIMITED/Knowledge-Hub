import { beforeEach, describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { FakeHierarchyEdgeGateway, silentLogger } from '@testing';
import { type AssignManagerInput, HierarchyRuleError } from '../../domain';
import { AssignManagerUseCase } from './assign-manager';

const input = (over: Partial<AssignManagerInput> = {}): AssignManagerInput => ({
  subordinateId: 'sub-1',
  subordinateUserTypeId: 'type-1',
  managerId: 'mgr-1',
  managerUserTypeId: 'type-2',
  branchId: 'branch-1',
  ...over,
});

describe('AssignManagerUseCase', () => {
  let gateway: FakeHierarchyEdgeGateway;
  let useCase: AssignManagerUseCase;

  beforeEach(() => {
    gateway = new FakeHierarchyEdgeGateway();
    useCase = new AssignManagerUseCase({
      hierarchyGateway: gateway,
      logger: silentLogger(),
    });
  });

  it('rejects a self-manager without calling the gateway', async () => {
    const result = await useCase.execute(input({ managerId: 'sub-1' }));

    expect(isErr(result) && result.error).toBeInstanceOf(HierarchyRuleError);
    expect(gateway.lastAssign).toBeNull();
  });

  it('forwards a valid assignment to the gateway', async () => {
    const result = await useCase.execute(input());

    expect(isOk(result)).toBe(true);
    expect(gateway.lastAssign?.managerId).toBe('mgr-1');
  });
});
