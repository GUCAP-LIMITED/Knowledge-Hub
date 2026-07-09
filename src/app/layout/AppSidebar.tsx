import type { ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlayCircle,
  Lightbulb,
  FolderOpen,
  Award,
  BookOpen,
  Star,
  FileCheck,
  ClipboardList,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@shared/utils';
import type { AuthenticatedUser } from '@features/auth';
import styles from './AppLayout.module.css';

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
    };

const NAV: readonly NavEntry[] = [
  { kind: 'section', label: 'Learn' },
  { kind: 'link', to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { kind: 'link', to: '/my-learning', label: 'My Learning', icon: BookOpen },
  { kind: 'link', to: '/courses', label: 'Courses', icon: PlayCircle },
  { kind: 'link', to: '/tutorials', label: 'Tutorials', icon: Lightbulb },
  { kind: 'link', to: '/resources', label: 'Resources', icon: FolderOpen },
  { kind: 'link', to: '/certificates', label: 'Certificates', icon: Award },
  { kind: 'link', to: '/reviews', label: 'Reviews', icon: Star },
  { kind: 'section', label: 'Workspace', anyOf: ['admin', 'manager'] },
  {
    kind: 'link',
    to: '/submissions',
    label: 'My Submissions',
    icon: FileCheck,
    anyOf: ['admin', 'manager'],
  },
  { kind: 'section', label: 'Administration', anyOf: ['admin'] },
  {
    kind: 'link',
    to: '/approvals',
    label: 'Approvals',
    icon: ClipboardList,
    anyOf: ['admin'],
  },
  {
    kind: 'link',
    to: '/course-reviews',
    label: 'Review Moderation',
    icon: MessageSquare,
    anyOf: ['admin'],
  },
];

const NavItem = ({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
}): ReactElement => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
  >
    <Icon size={18} aria-hidden="true" />
    {label}
  </NavLink>
);

export interface AppSidebarProps {
  readonly user: AuthenticatedUser | null;
}

/** Brand + role-aware grouped navigation. */
export const AppSidebar = ({ user }: AppSidebarProps): ReactElement => {
  const visible = (anyOf: readonly string[] | undefined): boolean =>
    anyOf === undefined || (user?.hasAnyRole(anyOf) ?? false);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>UA</span>
        <span className={styles.brandText}>
          <strong>UAPP Academy</strong>
          <small>Knowledge Hub</small>
        </span>
      </div>
      <nav className={styles.nav}>
        {NAV.filter((entry) => visible(entry.anyOf)).map((entry) =>
          entry.kind === 'section' ? (
            <div key={`section-${entry.label}`} className={styles.section}>
              {entry.label}
            </div>
          ) : (
            <NavItem key={entry.to} to={entry.to} label={entry.label} icon={entry.icon} />
          ),
        )}
      </nav>
    </aside>
  );
};
