import { beforeEach, describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { FakePermissionSetGateway, silentLogger } from '@testing';
import {
  type CreatePermissionSetInput,
  InvalidPermissionSetNameError,
} from '../../domain';
import { CreatePermissionSetUseCase } from './create-permission-set';

const input = (name: string): CreatePermissionSetInput => ({
  name,
  description: null,
  color: null,
  bgColor: null,
  permissions: { 'Dashboard.View': true },
});

describe('CreatePermissionSetUseCase', () => {
  let gateway: FakePermissionSetGateway;
  let useCase: CreatePermissionSetUseCase;

  beforeEach(() => {
    gateway = new FakePermissionSetGateway();
    useCase = new CreatePermissionSetUseCase({
      permissionsGateway: gateway,
      logger: silentLogger(),
    });
  });

  it('rejects a blank name without calling the gateway', async () => {
    const result = await useCase.execute(input('   '));

    expect(isErr(result) && result.error).toBeInstanceOf(InvalidPermissionSetNameError);
    expect(gateway.lastCreate).toBeNull();
  });

  it('forwards a trimmed, valid name to the gateway', async () => {
    const result = await useCase.execute(input('  Custom Access  '));

    expect(isOk(result)).toBe(true);
    expect(gateway.lastCreate?.name).toBe('Custom Access');
  });
});
