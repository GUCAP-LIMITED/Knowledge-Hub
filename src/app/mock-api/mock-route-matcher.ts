import type { MockRoute } from './mock-types';

export interface RouteMatch {
  readonly route: MockRoute;
  readonly params: Readonly<Record<string, string>>;
}

const escapeSegment = (segment: string): string =>
  segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const compile = (pattern: string): RegExp => {
  const source = pattern
    .split('/')
    .map((segment) =>
      segment.startsWith(':') ? `(?<${segment.slice(1)}>[^/]+)` : escapeSegment(segment),
    )
    .join('/');
  return new RegExp(`^${source}/?$`);
};

/**
 * Resolves a request to a route. Literal routes outrank parameterised ones, so
 * `/course/lesson` is never swallowed by `/course/:id`.
 */
export class MockRouteMatcher {
  private readonly entries: readonly {
    readonly route: MockRoute;
    readonly regex: RegExp;
    readonly literalSegments: number;
  }[];

  public constructor(routes: readonly MockRoute[]) {
    this.entries = routes
      .map((route) => ({
        route,
        regex: compile(route.pattern),
        literalSegments: route.pattern.split('/').filter((s) => !s.startsWith(':'))
          .length,
      }))
      .sort((a, b) => b.literalSegments - a.literalSegments);
  }

  public match(method: string, path: string): RouteMatch | null {
    for (const entry of this.entries) {
      if (entry.route.method !== method) {
        continue;
      }
      const result = entry.regex.exec(path);
      if (result !== null) {
        const params = Object.fromEntries(
          Object.entries(result.groups ?? {}).map(([key, value]) => [
            key,
            decodeURIComponent(value),
          ]),
        );
        return { route: entry.route, params };
      }
    }
    return null;
  }
}
