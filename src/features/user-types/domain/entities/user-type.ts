/** Row-level data-access scope a user gets from a type. Mirrors the backend `DataAccessScope`. */
export type DataAccessScope = 0 | 5 | 10 | 15; // 0 Self · 5 Team · 10 BranchAll · 15 FullAccess

export interface UserTypeRoleRef {
  readonly roleId: string;
  readonly roleName: string | null;
}

export interface UserTypeProps {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly isAdmin: boolean;
  readonly displayOrder: number;
  readonly hierarchyLevel: number;
  readonly dataAccessScope: DataAccessScope;
  readonly isDefault: boolean;
  readonly refId: string | null;
  readonly createdAt: Date;
  readonly roles: readonly UserTypeRoleRef[];
}

/**
 * A per-tenant role-catalogue entry. Immutable: mutations return a new instance so the presentation
 * layer can rely on reference equality. `isDefault` marks the seeded portal types, which the backend
 * blocks from edit/delete/role-changes (reorder is still allowed).
 */
export class UserType {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly isActive: boolean;
  public readonly isAdmin: boolean;
  public readonly displayOrder: number;
  public readonly hierarchyLevel: number;
  public readonly dataAccessScope: DataAccessScope;
  public readonly isDefault: boolean;
  public readonly refId: string | null;
  public readonly createdAt: Date;
  public readonly roles: readonly UserTypeRoleRef[];

  public constructor(props: UserTypeProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.isActive = props.isActive;
    this.isAdmin = props.isAdmin;
    this.displayOrder = props.displayOrder;
    this.hierarchyLevel = props.hierarchyLevel;
    this.dataAccessScope = props.dataAccessScope;
    this.isDefault = props.isDefault;
    this.refId = props.refId;
    this.createdAt = props.createdAt;
    this.roles = props.roles;
  }

  /** Seeded portal type — the backend rejects edit/delete/role changes (reorder is still allowed). */
  public get isSeeded(): boolean {
    return this.isDefault;
  }

  /** In the seniority chain (rank ≥ 1) rather than unconfigured (rank 0). */
  public get isRanked(): boolean {
    return this.hierarchyLevel > 0;
  }
}
