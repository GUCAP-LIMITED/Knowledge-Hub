/** A request as seen by a mock route handler: the matched path params, parsed query and JSON body. */
export interface MockRequest {
  readonly method: string;
  readonly path: string;
  readonly params: Readonly<Record<string, string>>;
  readonly query: Readonly<Record<string, string>>;
  readonly body: unknown;
  /** Id (JWT `sub`) of the signed-in demo user, or `null` for anonymous requests. */
  readonly userId: string | null;
}

export type MockHandler = (request: MockRequest) => unknown;

export interface MockRoute {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Path pattern relative to the API root, e.g. `/api/app/course/:id`. */
  readonly pattern: string;
  readonly handler: MockHandler;
}

/** Thrown by a handler to answer with a non-2xx status (translated to an `HttpError`). */
export class MockHttpFailure extends Error {
  public readonly status: number;
  public readonly body: unknown;

  public constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body ?? { error: { message } };
  }
}
