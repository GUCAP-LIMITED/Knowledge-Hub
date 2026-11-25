import type { Result } from '@core/result';
import type { SearchGateway } from '../domain/ports/search-gateway';
import type { GlobalSearchParams, GlobalSearchResult } from '../domain/types';

export interface SearchContentUseCaseDeps {
  readonly searchGateway: SearchGateway;
}

export class SearchContentUseCase {
  private readonly searchGateway: SearchGateway;

  public constructor(deps: SearchContentUseCaseDeps) {
    this.searchGateway = deps.searchGateway;
  }

  public async execute(params: GlobalSearchParams): Promise<Result<GlobalSearchResult>> {
    return this.searchGateway.search(params);
  }
}
