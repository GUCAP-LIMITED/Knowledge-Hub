import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { silentLogger } from '@testing';
import { buildUserAccount } from '@testing/builders/user-account.builder';
import { FakeUserGateway } from '@testing/fakes/fake-user-gateway';
import { UsersUnavailableError } from '../../domain';
import { ListUsersUseCase } from './list-users';

const makeUseCase = (gateway: FakeUserGateway): ListUsersUseCase =>
  new ListUsersUseCase({ userGateway: gateway, logger: silentLogger() });

describe('ListUsersUseCase', () => {
  it('returns the directory from the gateway', async () => {
    const gateway = new FakeUserGateway();
    gateway.listResult = ok([buildUserAccount({ id: 'user-9' })]);

    const result = await makeUseCase(gateway).execute();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.id).toBe('user-9');
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeUserGateway();
    gateway.listResult = err(new UsersUnavailableError());

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
