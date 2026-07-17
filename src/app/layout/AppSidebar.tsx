import { Fragment, useState, type ReactElement } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils';
import { Skeleton } from '@shared/ui';
import {
  iconFor,
  useMyPermissionModules,
  type SidebarModule,
} from '@features/permissions';
import { SETTINGS_SECTIONS } from '@features/users';
import styles from './AppLayout.module.css';

interface SubLink {
  readonly to: string;
  readonly label: string;
}

const NavItem = ({
  to,
  label,
  icon: Icon,
  count,
  onNavigate,
}: {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly count: number | null;
  readonly onNavigate: () => void;
}): ReactElement => (
  <NavLink
    to={to}
    end={to === '/'}
    onClick={onNavigate}
    className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
  >
    <Icon size={18} aria-hidden="true" />
    {label}
    {count !== null && count > 0 ? (
      <span className={styles.navBadge}>{count}</span>
    ) : null}
  </NavLink>
);

const NavGroup = ({
  to,
  label,
  icon: Icon,
  items,
  onNavigate,
}: {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly items: readonly SubLink[];
  readonly onNavigate: () => void;
}): ReactElement => {
  const location = useLocation();
  const base = `/${to.split('/')[1] ?? ''}`;
  const onSection = location.pathname.startsWith(base);
  const [open, setOpen] = useState(onSection);

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
        <Icon size={18} aria-hidden="true" />
        {label}
        <ChevronDown
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
 * Sub-menu links for a module. Backend children (from the registry, e.g. User Types / Hierarchy under
 * Settings) always render; Settings additionally prepends its frontend sub-pages (`SETTINGS_SECTIONS`),
 * which aren't permission modules so can't come from the API.
 */
const childrenFor = (module: SidebarModule): readonly SubLink[] => {
  const fromModule = module.children.map((child) => ({
    to: child.href,
    label: child.sidebarMenu.length > 0 ? child.sidebarMenu : child.name,
  }));
  if (module.id === 'settings') {
    const sections = SETTINGS_SECTIONS.map((section) => ({
      to: `/settings/${section.key}`,
      label: section.label,
    }));
    return [...sections, ...fromModule];
  }
  return fromModule;
};

const renderModule = (module: SidebarModule, onNavigate: () => void): ReactElement => {
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
      onNavigate={onNavigate}
    />
  ) : (
    <NavItem
      key={module.id}
      to={module.href}
      label={label}
      icon={Icon}
      count={module.count}
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
  /** Called when a nav item is chosen, to dismiss the mobile drawer. */
  readonly onNavigate: () => void;
}

/**
 * Brand + permission-driven grouped navigation, rendered from `GET /api/app/my/permission-modules`
 * (the backend registry is the single source of truth). Fixed sidebar on desktop, drawer on mobile.
 */
export const AppSidebar = ({ open, onNavigate }: AppSidebarProps): ReactElement => {
  const { data: groups, isPending } = useMyPermissionModules();

  return (
    <aside className={cn(styles.sidebar, open && styles.sidebarOpen)}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>UA</span>
        <span className={styles.brandText}>
          <strong>UAPP Academy</strong>
          <small>Knowledge Hub</small>
        </span>
      </div>
      <nav className={styles.nav}>
        {isPending ? (
          <SidebarSkeleton />
        ) : (
          (groups ?? []).map((group) => (
            <Fragment key={group.id}>
              <div className={styles.section}>{group.label}</div>
              {group.items.map((module) => renderModule(module, onNavigate))}
            </Fragment>
          ))
        )}
      </nav>
    </aside>
  );
};
