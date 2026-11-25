import type { Result } from '@core/result';
import type { GlobalSearchParams, GlobalSearchResult } from '../types';

export interface SearchGateway {
  search(params: GlobalSearchParams): Promise<Result<GlobalSearchResult>>;
}
