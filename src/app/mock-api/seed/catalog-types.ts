export interface CatalogModule {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly sidebarMenu: string;
  readonly description: string;
  readonly href: string;
  readonly basePermission: string;
  /** Extra action keys under this module (the base permission is always included). */
  readonly actions: readonly string[];
  readonly group: 'learning' | 'contribute' | 'team' | 'admin';
  readonly children?: readonly CatalogModule[];
}

export const mod = (m: CatalogModule): CatalogModule => m;
