import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from '@core/result';
import { FakeTutorialGateway, silentLogger, buildTutorial } from '@testing';
import { TutorialNotFoundError } from '../../domain';
import { MarkVideoCompleteUseCase } from './mark-video-complete';

const makeUseCase = (gateway: FakeTutorialGateway): MarkVideoCompleteUseCase =>
  new MarkVideoCompleteUseCase({ tutorialGateway: gateway, logger: silentLogger() });

describe('MarkVideoCompleteUseCase', () => {
  it('marks an individual tutorial video complete via the gateway', async () => {
    const gateway = new FakeTutorialGateway();
    gateway.markVideoCompleteResult = ok(
      buildTutorial({
        id: 'tutorial-1',
        videos: [
          {
            id: 'video-asset-1',
            originalFileName: 'video.mp4',
            isMediaCompleted: true,
          },
        ],
      }),
    );

    const result = await makeUseCase(gateway).execute('tutorial-1', 'video-asset-1');

    expect(gateway.lastRequestedId).toBe('tutorial-1');
    expect(gateway.lastRequestedMediaAssetId).toBe('video-asset-1');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.isVideoCompleted('video-asset-1')).toBe(true);
    }
  });

  it('propagates a gateway failure', async () => {
    const gateway = new FakeTutorialGateway();
    gateway.markVideoCompleteResult = err(new TutorialNotFoundError('not found'));

    const result = await makeUseCase(gateway).execute('missing', 'video-1');

    expect(isErr(result)).toBe(true);
  });
});
