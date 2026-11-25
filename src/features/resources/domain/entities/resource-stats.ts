/** Category-level article count returned by the resource statistics endpoint. */
export interface ResourceCategoryStat {
  readonly categoryId: string | null;
  readonly name: string;
  readonly slug: string | null;
  readonly count: number;
}

/** Aggregate statistics across the knowledge base catalog. */
export interface ResourceStats {
  readonly totalCount: number;
  readonly categories: readonly ResourceCategoryStat[];
}
