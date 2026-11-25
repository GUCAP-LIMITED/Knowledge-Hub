export interface SelectableContentItem {
  readonly id: string;
  readonly title: string;
  readonly slug?: string | undefined;
  readonly type: number; // 0 = Course, 5 = Tutorial, 10 = Resource
  readonly typeName: string;
}

export interface SelectableContentParams {
  readonly filter?: string | undefined;
  readonly type?: number | undefined;
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
}
