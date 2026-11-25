import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import type { ContentGateway } from './domain';
import { ContentHttpGateway } from './infrastructure';

export interface ContentModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export interface ContentModule {
  readonly gateway: ContentGateway;
}

/** Composition root for the content feature. Wires the HTTP gateway to the port. */
export const createContentModule = (deps: ContentModuleDeps): ContentModule => ({
  gateway: new ContentHttpGateway({ httpClient: deps.httpClient, logger: deps.logger }),
});
