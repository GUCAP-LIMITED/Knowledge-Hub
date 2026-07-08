import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { FakeTutorialGateway, silentLogger, buildTutorial } from '@testing';
import { TutorialsUnavailableError } from '../../domain';
import { ListTutorialsUseCase } from './list-tutorials';

const makeUseCase = (gateway: FakeTutorialGateway): ListTutorialsUseCase =>
  new ListTutorialsUseCase({ tutorialGateway: gateway, logger: silentLogger() });

describe('ListTutorialsUseCase', () => {
  it('returns the library from the gateway', async () => {
    const gateway = new FakeTutorialGateway();
    gateway.listResult = ok([buildTutorial({ id: 'tutorial-9' })]);

    const result = await makeUseCase(gateway).execute();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.id).toBe('tutorial-9');
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeTutorialGateway();
    gateway.listResult = err(new TutorialsUnavailableError());

    const result = await makeUseCase(gateway).execute();

    expect(isErr(result)).toBe(true);
  });
});
