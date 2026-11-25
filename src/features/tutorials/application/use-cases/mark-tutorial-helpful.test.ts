import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { FakeTutorialGateway, silentLogger, buildTutorial } from '@testing';
import { TutorialNotFoundError } from '../../domain';
import { MarkTutorialHelpfulUseCase } from './mark-tutorial-helpful';

const makeUseCase = (gateway: FakeTutorialGateway): MarkTutorialHelpfulUseCase =>
  new MarkTutorialHelpfulUseCase({ tutorialGateway: gateway, logger: silentLogger() });

describe('MarkTutorialHelpfulUseCase', () => {
  it('marks the tutorial helpful via the gateway', async () => {
    const gateway = new FakeTutorialGateway();
    gateway.markHelpfulResult = ok(
      buildTutorial({ id: 'tutorial-1', helpfulCount: 5, isHelpful: true }),
    );

    const result = await makeUseCase(gateway).execute('tutorial-1');

    expect(gateway.lastRequestedId).toBe('tutorial-1');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.helpfulCount).toBe(5);
      expect(result.value.isHelpful).toBe(true);
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeTutorialGateway();
    gateway.markHelpfulResult = err(new TutorialNotFoundError('not found'));

    const result = await makeUseCase(gateway).execute('missing');

    expect(isErr(result)).toBe(true);
  });
});
