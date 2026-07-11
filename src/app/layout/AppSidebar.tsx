import { useState, type ReactElement } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlayCircle,
  Lightbulb,
  FolderOpen,
  Award,
  BookOpen,
  Star,
  ChevronDown,
  FileCheck,
  ClipboardList,
  MessageSquare,
  BarChart3,
  CalendarCheck,
  Upload,
  type LucideIcon,
  Settings,
} from 'lucide-react';
import { cn } from '@shared/utils';
import type { AuthenticatedUser } from '@features/auth';
import { SETTINGS_SECTIONS, useMyCapabilities, type CapId } from '@features/users';
import styles from './AppLayout.module.css';

interface SubLink {
  readonly to: string;
  readonly label: string;
}

/** A capability that must be held for a nav entry to show (in addition to its role gate). */
interface NavCap {
  readonly module: string;
  readonly cap: CapId;
}

type NavEntry =
  | {
      readonly kind: 'section';
      readonly label: string;
      readonly anyOf?: readonly string[];
    }
  | {
      readonly kind: 'link';
      readonly to: string;
      readonly label: string;
      readonly icon: LucideIcon;
      readonly anyOf?: readonly string[];
      readonly cap?: NavCap;
      readonly children?: readonly SubLink[];
    };

const SETTINGS_CHILDREN: readonly SubLink[] = SETTINGS_SECTIONS.map((section) => ({
  to: `/settings/${section.key}`,
  label: section.label,
}));

const NAV: readonly NavEntry[] = [
  { kind: 'section', label: 'Learn' },
  { kind: 'link', to: '/', label: 'Dashboard', icon: LayoutDashboard },
  {
    kind: 'link',
    to: '/my-learning',
    label: 'My Learning',
    icon: BookOpen,
    anyOf: ['manager', 'consultant'],
  },
  { kind: 'link', to: '/courses', label: 'Courses', icon: PlayCircle },
  { kind: 'link', to: '/tutorials', label: 'Tutorials', icon: Lightbulb },
  { kind: 'link', to: '/resources', label: 'Resources', icon: FolderOpen },
  { kind: 'link', to: '/certificates', label: 'Certificates', icon: Award },
  { kind: 'link', to: '/reviews', label: 'Reviews', icon: Star },
  { kind: 'section', label: 'Workspace', anyOf: ['admin', 'manager'] },
  {
    kind: 'link',
    to: '/upload',
    label: 'Upload Document',
    icon: Upload,
    anyOf: ['admin', 'manager'],
    cap: { module: 'submissions', cap: 'create' },
  },
  {
    kind: 'link',
    to: '/submissions',
    label: 'My Submissions',
    icon: FileCheck,
    anyOf: ['admin', 'manager'],
    cap: { module: 'submissions', cap: 'view' },
  },
  { kind: 'section', label: 'Team', anyOf: ['admin'] },
  {
    kind: 'link',
    to: '/team-progress',
    label: 'Team Progress',
    icon: BarChart3,
    anyOf: ['admin'],
    cap: { module: 'team', cap: 'view' },
  },
  {
    kind: 'link',
    to: '/assign',
    label: 'Assign Training',
    icon: CalendarCheck,
    anyOf: ['admin'],
    cap: { module: 'team', cap: 'assign' },
  },
  { kind: 'section', label: 'Administration', anyOf: ['admin'] },
  {
    kind: 'link',
    to: '/approvals',
    label: 'Approvals',
    icon: ClipboardList,
    anyOf: ['admin'],
    cap: { module: 'approvals', cap: 'view' },
  },
  {
    kind: 'link',
    to: '/course-reviews',
    label: 'Course Reviews',
    icon: MessageSquare,
    anyOf: ['admin'],
    cap: { module: 'reviews', cap: 'moderate' },
  },
  {
    kind: 'link',
    to: '/settings/platform',
    label: 'Settings',
    icon: Settings,
    anyOf: ['admin'],
    cap: { module: 'settings', cap: 'manage' },
    children: SETTINGS_CHILDREN,
  },
];

const NavItem = ({
  to,
  label,
  icon: Icon,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  onNavigate: () => void;
}): ReactElement => (
  <NavLink
    to={to}
    end={to === '/'}
    onClick={onNavigate}
    className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
  >
    <Icon size={18} aria-hidden="true" />
    {label}
  </NavLink>
);

const NavGroup = ({
  to,
  label,
  icon: Icon,
  items,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  items: readonly SubLink[];
  onNavigate: () => void;
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

const renderEntry = (entry: NavEntry, onNavigate: () => void): ReactElement => {
  if (entry.kind === 'section') {
    return (
      <div key={`section-${entry.label}`} className={styles.section}>
        {entry.label}
      </div>
    );
  }
  if (entry.children !== undefined) {
    return (
      <NavGroup
        key={entry.to}
        to={entry.to}
        label={entry.label}
        icon={entry.icon}
        items={entry.children}
        onNavigate={onNavigate}
      />
    );
  }
  return (
    <NavItem
      key={entry.to}
      to={entry.to}
      label={entry.label}
      icon={entry.icon}
      onNavigate={onNavigate}
    />
  );
};

export interface AppSidebarProps {
  readonly user: AuthenticatedUser | null;
  /** Whether the mobile drawer is open (ignored on desktop, where it is always visible). */
  readonly open: boolean;
  /** Called when a nav item is chosen, to dismiss the mobile drawer. */
  readonly onNavigate: () => void;
}

/** Brand + role-aware grouped navigation. Acts as a fixed sidebar on desktop, a drawer on mobile. */
export const AppSidebar = ({ user, open, onNavigate }: AppSidebarProps): ReactElement => {
  const { can } = useMyCapabilities();

  // Role is the outer backstop; a capability (when present) refines visibility within it.
  const visible = (entry: NavEntry): boolean => {
    const roleOk = entry.anyOf === undefined || (user?.hasAnyRole(entry.anyOf) ?? false);
    if (!roleOk) return false;
    return entry.kind === 'link' && entry.cap !== undefined
      ? can(entry.cap.module, entry.cap.cap)
      : true;
  };

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
        {NAV.filter(visible).map((entry) => renderEntry(entry, onNavigate))}
      </nav>
    </aside>
  );
};
