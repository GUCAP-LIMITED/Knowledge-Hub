import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { FakeTeamGateway, silentLogger, buildTeamMember } from '@testing';
import { TeamUnavailableError } from '../../domain';
import { ListTeamMembersUseCase } from './list-team-members';

const makeUseCase = (gateway: FakeTeamGateway): ListTeamMembersUseCase =>
  new ListTeamMembersUseCase({ teamGateway: gateway, logger: silentLogger() });

describe('ListTeamMembersUseCase', () => {
  it('returns the roster from the gateway', async () => {
    const gateway = new FakeTeamGateway();
    gateway.listResult = ok([buildTeamMember({ id: 'tm-9' })]);

    const result = await makeUseCase(gateway).execute();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.id).toBe('tm-9');
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeTeamGateway();
    gateway.listResult = err(new TeamUnavailableError());

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
