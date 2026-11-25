import { describe, expect, it } from 'vitest';
import type { HttpClient, RequestOptions } from '@core/http';
import { isOk } from '@core/result';
import { buildTutorial } from '@testing';
import { silentLogger } from '@testing/fakes/silent-logger';
import { HttpTutorialGateway } from './http-tutorial-gateway';

const notImplemented = (): never => {
  throw new Error('not used in this test');
};

interface RecordedPost {
  readonly path: string;
  readonly body: unknown;
  readonly options: RequestOptions | undefined;
}

const makeHttpClient = (
  respond: (path: string) => Promise<unknown>,
  postCalls: RecordedPost[] = [],
): HttpClient => ({
  get: <TResponse>(path: string): Promise<TResponse> =>
    respond(path) as Promise<TResponse>,
  post: <TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> => {
    postCalls.push({ path, body, options });
    return respond(path) as Promise<TResponse>;
  },
  put: notImplemented,
  patch: notImplemented,
  delete: notImplemented,
  postForm: notImplemented,
});

const makeGateway = (httpClient: HttpClient): HttpTutorialGateway =>
  new HttpTutorialGateway({ httpClient, logger: silentLogger() });

const TUTORIAL_ROW = {
  id: 'tutorial-1',
  title: 'AI in Education',
  isCompleted: true,
  completedAt: '2026-09-03T12:30:00Z',
  certificateId: 'cert-1',
  certificateUrl: 'https://blob.example.com/certificates/cert-1.png',
  primaryMedia: { id: 'media-1', url: null },
};

describe('HttpTutorialGateway.markComplete', () => {
  it('posts to /{id}/mark-complete with no body and no query', async () => {
    const postCalls: RecordedPost[] = [];
    const httpClient = makeHttpClient(() => Promise.resolve(TUTORIAL_ROW), postCalls);
    await makeGateway(httpClient).markComplete('tutorial-1');

    expect(postCalls).toEqual([
      {
        path: '/api/app/tutorial/tutorial-1/mark-complete',
        body: undefined,
        options: undefined,
      },
    ]);
  });

  it('maps server completion + certificate fields onto the domain Tutorial', async () => {
    const httpClient = makeHttpClient(() => Promise.resolve(TUTORIAL_ROW));
    const result = await makeGateway(httpClient).markComplete('tutorial-1');

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.isCompleted()).toBe(true);
      expect(result.value.completedAt).toBe('2026-09-03T12:30:00Z');
      expect(result.value.certificateId).toBe('cert-1');
      expect(result.value.certificateUrl).toBe(
        'https://blob.example.com/certificates/cert-1.png',
      );
    }
  });
});

describe('HttpTutorialGateway.save', () => {
  it('sends updated category, difficulty, durationSeconds, and description', async () => {
    let capturedPath = '';
    let capturedBody: unknown;

    const httpClient: HttpClient = {
      get: notImplemented,
      post: notImplemented,
      put: <TResponse>(path: string, body?: unknown): Promise<TResponse> => {
        capturedPath = path;
        capturedBody = body;
        return Promise.resolve({
          ...TUTORIAL_ROW,
          title: 'Advanced React',
          description: 'Deep dive into hooks',
          categoryId: 'cat-123',
          categoryName: 'Frontend',
          durationSeconds: 900,
          difficulty: 10,
          difficultyName: 'Advanced',
        } as unknown as TResponse);
      },
      patch: notImplemented,
      delete: notImplemented,
      postForm: notImplemented,
    };

    const gateway = makeGateway(httpClient);
    const tutorial = buildTutorial({ id: 'tutorial-1' });
    const updated = tutorial.withDetails({
      title: 'Advanced React',
      category: 'Frontend',
      categoryId: 'cat-123',
      duration: '15m',
      durationSeconds: 900,
      difficulty: 'Advanced',
      description: 'Deep dive into hooks',
    });

    const result = await gateway.save(updated);

    expect(capturedPath).toBe('/api/app/tutorial/tutorial-1');
    expect(capturedBody).toEqual({
      title: 'Advanced React',
      description: 'Deep dive into hooks',
      slug: 'advanced-react',
      categoryId: 'cat-123',
      category: 'Frontend',
      difficulty: 10,
      durationSeconds: 900,
      status: 0,
    });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.difficulty).toBe('Advanced');
      expect(result.value.duration).toBe('15m');
      expect(result.value.category).toBe('Frontend');
    }
  });
});

describe('HttpTutorialGateway.getEnum', () => {
  it('queries /api/app/enum/{enumName} and returns parsed EnumValues', async () => {
    const enumData = [
      { value: 0, name: 'Beginner', description: 'Beginner' },
      { value: 5, name: 'Intermediate', description: 'Intermediate' },
      { value: 10, name: 'Advanced', description: 'Advanced' },
    ];

    const httpClient: HttpClient = {
      get: <TResponse>(path: string): Promise<TResponse> => {
        expect(path).toBe('/api/app/enum/ContentDifficulty');
        return Promise.resolve(enumData as unknown as TResponse);
      },
      post: notImplemented,
      put: notImplemented,
      patch: notImplemented,
      delete: notImplemented,
      postForm: notImplemented,
    };

    const result = await makeGateway(httpClient).getEnum('ContentDifficulty');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual(enumData);
    }
  });
});

describe('HttpTutorialGateway.list', () => {
  it('maps canModify correctly and defaults to false when omitted', async () => {
    const rawResponse = {
      items: [
        { ...TUTORIAL_ROW, id: 'tut-1', canModify: true },
        { ...TUTORIAL_ROW, id: 'tut-2' },
      ],
      totalCount: 2,
    };

    const httpClient = makeHttpClient(() => Promise.resolve(rawResponse));
    const result = await makeGateway(httpClient).list();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.items[0]?.canModify).toBe(true);
      expect(result.value.items[1]?.canModify).toBe(false);
    }
  });

  it('correctly maps Private (10), Team (5), and Public (0) visibility', async () => {
    const rawResponse = {
      items: [
        { ...TUTORIAL_ROW, id: 'tut-priv', visibility: 10 },
        { ...TUTORIAL_ROW, id: 'tut-team', visibility: 5 },
        { ...TUTORIAL_ROW, id: 'tut-pub', visibility: 0 },
      ],
      totalCount: 3,
    };

    const httpClient = makeHttpClient(() => Promise.resolve(rawResponse));
    const result = await makeGateway(httpClient).list();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.items[0]?.visibility).toBe('Private');
      expect(result.value.items[1]?.visibility).toBe('Team');
      expect(result.value.items[2]?.visibility).toBe('Public');
    }
  });
});
