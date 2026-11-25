import { useMemo, type ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@shared/utils';
import { useMyPermissionModules, type SidebarModule } from '@features/permissions';
import styles from './AppBottomNav.module.css';

interface BottomNavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

/** App-level pages every authenticated role can reach — not backend permission modules. */
const ALWAYS_AVAILABLE: readonly BottomNavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/my-learning', label: 'My Learning', icon: GraduationCap },
];

/** Backend permission modules — shown only when the signed-in user's registry includes them,
 * so the bottom nav never offers a destination the sidebar itself would hide for that role. */
const PERMISSION_GATED: readonly BottomNavItem[] = [
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/tutorials', label: 'Tutorials', icon: PlayCircle },
  { to: '/resources', label: 'Resources', icon: FolderOpen },
];

const collectHrefs = (modules: readonly SidebarModule[], hrefs: Set<string>): void => {
  for (const module of modules) {
    hrefs.add(module.href);
    collectHrefs(module.children, hrefs);
  }
};

/** Icon-only quick-access tab bar shown in place of the sidebar on narrow (mobile) viewports. */
export const AppBottomNav = (): ReactElement => {
  const { data: groups } = useMyPermissionModules();

  const items = useMemo(() => {
    const accessibleHrefs = new Set<string>();
    for (const group of groups ?? []) {
      collectHrefs(group.items, accessibleHrefs);
    }
    return [
      ...ALWAYS_AVAILABLE,
      ...PERMISSION_GATED.filter((item) => accessibleHrefs.has(item.to)),
    ];
  }, [groups]);

  return (
    <nav className={styles.bottomNav} aria-label="Primary">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => cn(styles.item, isActive && styles.itemActive)}
        >
          <span className={styles.iconWrap}>
            <Icon size={20} aria-hidden="true" />
          </span>
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
