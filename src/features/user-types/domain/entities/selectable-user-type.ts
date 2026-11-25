/** Lightweight user-type option for dropdowns (from `GET /api/app/user-type/selectable`). */
export interface SelectableUserType {
  readonly id: string;
  readonly name: string;
  readonly canLogin: boolean;
  readonly hierarchyLevel: number;
  readonly isDefault: boolean;
}
