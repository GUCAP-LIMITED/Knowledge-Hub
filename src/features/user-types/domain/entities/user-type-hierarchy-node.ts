export interface UserTypeHierarchyNode {
  readonly userTypeId: string;
  readonly userTypeName: string;
  readonly hierarchyLevel: number;
  readonly canLogin: boolean;
  readonly isDefault?: boolean;
  readonly reportsTo?: string | null;
  readonly reports: readonly UserTypeHierarchyNode[];
}
