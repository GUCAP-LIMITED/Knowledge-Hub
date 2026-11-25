import { useState, type ReactElement } from 'react';
import { NavLink, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils';
import { AcademyLogo, DropdownMenu, Skeleton, Tooltip } from '@shared/ui';
import {
  iconFor,
  useMyPermissionModules,
  type SidebarModule,
} from '@features/permissions';
import styles from './AppLayout.module.css';

interface SubLink {
  readonly to: string;
  readonly label: string;
}

/**
 * Active state is computed here (via useMatch) rather than NavLink's function-typed `className`
 * prop: Radix's Slot (used by <Tooltip asChild> in the collapsed rail) joins className values with
 * `Array.prototype.join`, which stringifies a function instead of calling it — corrupting the class
 * and silently dropping all our styling. A plain string className sidesteps that.
 */
const NavItem = ({
  to,
  label,
  icon: Icon,
  count,
  collapsed,
  onNavigate,
}: {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly count: number | null;
  readonly collapsed: boolean;
  readonly onNavigate: () => void;
}): ReactElement => {
  const isDashboardLink = to === '/' || to === '/dashboard';
  const isRootMatch = useMatch({ path: '/', end: true }) !== null;
  const isDashboardMatch = useMatch({ path: '/dashboard', end: true }) !== null;
  const isDirectMatch = useMatch({ path: to, end: to === '/' }) !== null;
  const isActive = isDashboardLink ? isRootMatch || isDashboardMatch : isDirectMatch;
  const link = (
    <NavLink
      to={to}
      end={to === '/' || to === '/dashboard'}
      onClick={onNavigate}
      className={cn(styles.navLink, isActive && styles.navLinkActive)}
    >
      <Icon size={16} aria-hidden="true" />
      <span className={styles.navLabel}>{label}</span>
      {count !== null && count > 0 ? (
        <span className={styles.navBadge} aria-label={`${String(count)} new`}>
          {count}
        </span>
      ) : null}
    </NavLink>
  );
  const tooltipLabel =
    count !== null && count > 0 ? `${label} (${String(count)})` : label;
  return collapsed ? (
    <Tooltip label={tooltipLabel} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
};

/** Collapsed rail: a click-to-open flyout listing the group's children next to the icon. */
const CollapsedNavGroup = ({
  label,
  icon: Icon,
  items,
  onSection,
  onNavigate,
}: {
  readonly label: string;
  readonly icon: LucideIcon;
  readonly items: readonly SubLink[];
  readonly onSection: boolean;
  readonly onNavigate: () => void;
}): ReactElement => {
  const navigate = useNavigate();
  return (
    <DropdownMenu
      side="right"
      align="start"
      trigger={
        <button
          type="button"
          aria-label={label}
          className={cn(
            styles.navLink,
            styles.navGroupToggle,
            onSection && styles.navLinkActive,
          )}
        >
          <Icon size={16} aria-hidden="true" />
        </button>
      }
      items={items.map((child) => ({
        label: child.label,
        onSelect: () => {
          onNavigate();
          navigate(child.to);
        },
      }))}
    />
  );
};

const isGroupActive = (
  base: string,
  items: readonly SubLink[],
  pathname: string,
): boolean =>
  pathname.startsWith(base) ||
  items.some(
    (item) => pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to)),
  );

const NavGroup = ({
  to,
  label,
  icon: Icon,
  items,
  collapsed,
  onNavigate,
}: {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly items: readonly SubLink[];
  readonly collapsed: boolean;
  readonly onNavigate: () => void;
}): ReactElement => {
  const location = useLocation();
  const base = `/${to.split('/')[1] ?? ''}`;
  const onSection = isGroupActive(base, items, location.pathname);
  const [open, setOpen] = useState(onSection);

  if (collapsed) {
    return (
      <CollapsedNavGroup
        label={label}
        icon={Icon}
        items={items}
        onSection={onSection}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className={styles.navGroup}>
      <button
        type="button"
        className={cn(
          styles.navLink,
          styles.navGroupToggle,
          onSection && styles.navLinkActive,
        )}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        <Icon size={16} aria-hidden="true" />
        <span className={styles.navLabel}>{label}</span>
        <ChevronRight
          size={16}
          aria-hidden="true"
          className={cn(styles.navChevron, open && styles.navChevronOpen)}
        />
      </button>
      {open ? (
        <div className={styles.subNav}>
          {items.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(styles.subLink, isActive && styles.subLinkActive)
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
};

/**
 * User Types now opens from a "Manage User Types" CTA inside Settings → Users
 * (see `UsersSection`) instead of its own sidebar entry; the standalone `/user-types`
 * route still exists for direct links, so it's filtered out here rather than dropped
 * from the backend registry.
 */
const HIDDEN_SETTINGS_CHILD_HREFS: readonly string[] = [
  '/user-types',
  '/settings/users/user-types',
];

/**
 * Sub-menu links for a module. Derived directly from the backend registry's permission-gated
 * `children` (e.g. Settings -> Platform, Content Types, Certificates, Users, Permissions,
 * Configure Dashboard).
 */
const childrenFor = (module: SidebarModule): readonly SubLink[] =>
  module.children
    .filter((child) => !HIDDEN_SETTINGS_CHILD_HREFS.includes(child.href))
    .map((child) => ({
      to: child.href,
      label: child.sidebarMenu.length > 0 ? child.sidebarMenu : child.name,
    }));

const renderModule = (
  module: SidebarModule,
  onNavigate: () => void,
  collapsed: boolean,
): ReactElement => {
  const Icon = iconFor(module.icon);
  const label = module.sidebarMenu.length > 0 ? module.sidebarMenu : module.name;
  const children = childrenFor(module);
  return children.length > 0 ? (
    <NavGroup
      key={module.id}
      to={module.href}
      label={label}
      icon={Icon}
      items={children}
      collapsed={collapsed}
      onNavigate={onNavigate}
    />
  ) : (
    <NavItem
      key={module.id}
      to={module.href}
      label={label}
      icon={Icon}
      count={module.count}
      collapsed={collapsed}
      onNavigate={onNavigate}
    />
  );
};

const SidebarSkeleton = (): ReactElement => (
  <div className={styles.navSkeleton}>
    {['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((key) => (
      <Skeleton key={key} height={32} />
    ))}
  </div>
);

export interface AppSidebarProps {
  /** Whether the mobile drawer is open (ignored on desktop, where it is always visible). */
  readonly open: boolean;
  /** Whether the desktop rail is collapsed to icon-only (ignored on mobile). */
  readonly collapsed: boolean;
  /** Called when a nav item is chosen, to dismiss the mobile drawer. */
  readonly onNavigate: () => void;
}

/**
 * Brand + permission-driven grouped navigation, rendered from `GET /api/app/my/permission-modules`
 * (the backend registry is the single source of truth). Fixed sidebar on desktop, drawer on mobile.
 */
export const AppSidebar = ({
  open,
  collapsed,
  onNavigate,
}: AppSidebarProps): ReactElement => {
  const { data: groups, isPending } = useMyPermissionModules();

  return (
    <aside className={cn(styles.sidebar, open && styles.sidebarOpen)}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>
          <AcademyLogo size={32} />
        </span>
        <span className={styles.brandText}>
          <strong>
            UAPP<sup className={styles.reg}>®</sup>
          </strong>
          <span className={styles.brandProduct}>Academy</span>
        </span>
      </div>
      <nav className={styles.nav}>
        {isPending ? (
          <SidebarSkeleton />
        ) : (
          (groups ?? []).map((group) => (
            <div key={group.id} className={styles.group}>
              <div className={styles.section}>{group.label}</div>
              <div className={styles.groupItems}>
                {group.items.map((module) => renderModule(module, onNavigate, collapsed))}
              </div>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
};
