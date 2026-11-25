import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import { SearchContentUseCase } from './application/search-content.use-case';
import { HttpSearchGateway } from './infrastructure/http-search-gateway';

export interface SearchModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export interface SearchModule {
  readonly searchContent: SearchContentUseCase;
}

export const createSearchModule = (deps: SearchModuleDeps): SearchModule => {
  const searchGateway = new HttpSearchGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });

  return {
    searchContent: new SearchContentUseCase({ searchGateway }),
  };
};
