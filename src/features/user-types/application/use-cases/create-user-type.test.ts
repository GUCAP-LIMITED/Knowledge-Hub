import { beforeEach, describe, expect, it } from 'vitest';
import { isErr, isOk, ok } from '@core/result';
import { FakeUserTypeGateway, buildUserType, silentLogger } from '@testing';
import { type CreateUserTypeInput, InvalidUserTypeNameError } from '../../domain';
import { CreateUserTypeUseCase } from './create-user-type';

const baseInput = (name: string): CreateUserTypeInput => ({
  name,
  description: null,
  displayOrder: 0,
  isAdmin: false,
  hierarchyLevel: 0,
  dataAccessScope: 0,
});

describe('CreateUserTypeUseCase', () => {
  let gateway: FakeUserTypeGateway;
  let useCase: CreateUserTypeUseCase;

  beforeEach(() => {
    gateway = new FakeUserTypeGateway();
    useCase = new CreateUserTypeUseCase({
      userTypeGateway: gateway,
      logger: silentLogger(),
    });
  });

  it('rejects a blank name without calling the gateway', async () => {
    const result = await useCase.execute(baseInput('   '));

    expect(isErr(result) && result.error).toBeInstanceOf(InvalidUserTypeNameError);
    expect(gateway.lastCreateInput).toBeNull();
  });

  it('forwards a trimmed, valid name to the gateway', async () => {
    const created = buildUserType({ name: 'Sample name' });
    gateway.writeResult = ok(created);

    const result = await useCase.execute(baseInput('  Sample name  '));

    expect(isOk(result)).toBe(true);
    expect(gateway.lastCreateInput?.name).toBe('Sample name');
    if (isOk(result)) {
      expect(result.value).toBe(created);
    }
  });
});
