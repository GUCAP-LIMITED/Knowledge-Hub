/** Flat map of dot-notation permission → granted. Matches the backend wire format. */
export type PermissionMap = Readonly<Record<string, boolean>>;

/** One module in the permission tree, with its per-capability grants. */
export interface PermissionModule {
  readonly moduleId: string;
  readonly moduleName: string;
  readonly icon: string | null;
  readonly href: string | null;
  readonly basePermission: string;
  readonly isEnabled: boolean;
  readonly permissions: PermissionMap;
  readonly children: readonly PermissionModule[];
}

/** A permission set (a tagged IdentityRole) in list form. */
export interface PermissionSetSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly color: string | null;
  readonly bgColor: string | null;
  readonly isSystemDefault: boolean;
  readonly enabledCount: number;
  readonly totalCount: number;
}

/** A permission set with its full module/permission tree. */
export interface PermissionSetDetail extends PermissionSetSummary {
  readonly permissionModules: readonly PermissionModule[];
}

/** A user type's bound default permission set. */
export interface UserTypeDefault {
  readonly userTypeId: string;
  readonly userTypeName: string;
  readonly permissionSetRoleId: string | null;
  readonly permissionSetName: string | null;
  readonly userCount: number;
}

/** A single user's effective permissions plus their direct grants and denies. */
export interface UserEffectivePermissions {
  readonly userId: string;
  readonly userName: string | null;
  readonly userTypeName: string | null;
  readonly permissionModules: readonly PermissionModule[];
  readonly directGrantedPermissions: readonly string[];
  readonly deniedPermissions: readonly string[];
}

/** Result of a grant/deny write. */
export interface PermissionUpdateResult {
  readonly added: readonly string[];
  readonly removed: readonly string[];
  readonly changedCount: number;
}

/** One nav item the caller can access — the sidebar's building block (from `my/permission-modules`). */
export interface SidebarModule {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
  readonly sidebarMenu: string;
  readonly href: string;
  /** "Created today" badge count, when the module carries one; otherwise null. */
  readonly count: number | null;
  readonly children: readonly SidebarModule[];
}

/** A top-level sidebar section wrapping the accessible modules within it. */
export interface SidebarGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly SidebarModule[];
}
