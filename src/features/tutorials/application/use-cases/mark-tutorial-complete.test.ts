import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { FakeTutorialGateway, silentLogger, buildTutorial } from '@testing';
import { TutorialNotFoundError } from '../../domain';
import { MarkTutorialCompleteUseCase } from './mark-tutorial-complete';

const makeUseCase = (gateway: FakeTutorialGateway): MarkTutorialCompleteUseCase =>
  new MarkTutorialCompleteUseCase({ tutorialGateway: gateway, logger: silentLogger() });

describe('MarkTutorialCompleteUseCase', () => {
  it('marks the tutorial complete via the gateway', async () => {
    const gateway = new FakeTutorialGateway();
    gateway.markCompleteResult = ok(buildTutorial({ id: 'tutorial-1', completed: true }));

    const result = await makeUseCase(gateway).execute('tutorial-1');

    expect(gateway.lastRequestedId).toBe('tutorial-1');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.isCompleted()).toBe(true);
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeTutorialGateway();
    gateway.markCompleteResult = err(new TutorialNotFoundError('not found'));

    const result = await makeUseCase(gateway).execute('missing');

    expect(isErr(result)).toBe(true);
  });
});
