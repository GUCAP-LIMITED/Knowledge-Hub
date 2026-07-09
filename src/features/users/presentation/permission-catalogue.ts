import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle,
  ClipboardList,
  FileCheck,
  FolderOpen,
  LayoutGrid,
  Lightbulb,
  PlayCircle,
  Settings,
  Upload,
  type LucideIcon,
} from 'lucide-react';

export interface Permission {
  readonly id: string;
  readonly label: string;
  readonly desc: string;
  readonly requires?: readonly string[];
}

export interface PermissionModule {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly base: Permission;
  readonly granular: readonly Permission[];
}

/** moduleId → permissionId → enabled. */
export type PermState = Record<string, Record<string, boolean>>;

export interface PermissionSet {
  readonly id: string;
  readonly label: string;
  readonly desc: string;
  readonly locked?: boolean;
  readonly perms: PermState;
}

const view = (desc: string): Permission => ({ id: 'view', label: 'View', desc });

/** The full catalogue of permission-controlled modules (mirrors the sidebar). */
export const PERMISSION_MODULES: readonly PermissionModule[] = [
  {
    id: 'courses',
    label: 'Course Catalog',
    icon: PlayCircle,
    base: view('Browse and open courses'),
    granular: [
      {
        id: 'start',
        label: 'Start course',
        desc: 'Enrol in and begin new courses',
        requires: ['view'],
      },
      {
        id: 'continue',
        label: 'Continue course',
        desc: 'Resume in-progress courses',
        requires: ['view'],
      },
      {
        id: 'review',
        label: 'Rate & review',
        desc: 'Submit ratings and written feedback',
        requires: ['view'],
      },
      {
        id: 'filter',
        label: 'Search & filter',
        desc: 'Use advanced search, filters and sort',
        requires: ['view'],
      },
    ],
  },
  {
    id: 'mylearning',
    label: 'My Learning',
    icon: BookOpen,
    base: view('Personal learning dashboard'),
    granular: [
      {
        id: 'track',
        label: 'Track progress',
        desc: 'View detailed completion stats',
        requires: ['view'],
      },
    ],
  },
  {
    id: 'tutorials',
    label: 'Tutorials',
    icon: Lightbulb,
    base: view('Browse tutorial library'),
    granular: [
      {
        id: 'watch',
        label: 'Watch tutorials',
        desc: 'Start and complete tutorials',
        requires: ['view'],
      },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: FolderOpen,
    base: view('Access knowledge base and articles'),
    granular: [
      {
        id: 'search',
        label: 'Search',
        desc: 'Search articles and guides',
        requires: ['view'],
      },
      {
        id: 'download',
        label: 'Download',
        desc: 'Download documents and files',
        requires: ['view'],
      },
    ],
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: Award,
    base: view('View earned certificates'),
    granular: [
      {
        id: 'download',
        label: 'Download',
        desc: 'Download certificate as HTML file',
        requires: ['view'],
      },
      {
        id: 'share',
        label: 'Share',
        desc: 'Copy credential ID and share link',
        requires: ['view'],
      },
    ],
  },
  {
    id: 'upload',
    label: 'Upload Document',
    icon: Upload,
    base: { id: 'access', label: 'Access', desc: 'Open the upload area' },
    granular: [
      {
        id: 'submit',
        label: 'Submit for review',
        desc: 'Upload files into admin review queue',
        requires: ['access'],
      },
      {
        id: 'publish',
        label: 'Publish directly',
        desc: 'Bypass review — publish immediately',
        requires: ['access'],
      },
    ],
  },
  {
    id: 'submissions',
    label: 'My Submissions',
    icon: FileCheck,
    base: view('View own submission history and status'),
    granular: [
      {
        id: 'track',
        label: 'Track status',
        desc: 'Monitor approval status in real time',
        requires: ['view'],
      },
    ],
  },
  {
    id: 'approvals',
    label: 'Approval Queue',
    icon: CheckCircle,
    base: view('See all pending submissions'),
    granular: [
      {
        id: 'approve',
        label: 'Approve',
        desc: 'Approve and publish submissions',
        requires: ['view'],
      },
      {
        id: 'reject',
        label: 'Reject',
        desc: 'Reject with a required reason note',
        requires: ['view'],
      },
      {
        id: 'flag',
        label: 'Flag for review',
        desc: 'Move submission to under-review status',
        requires: ['view'],
      },
    ],
  },
  {
    id: 'content',
    label: 'Content Management',
    icon: LayoutGrid,
    base: view('Browse all platform content'),
    granular: [
      {
        id: 'create',
        label: 'Create',
        desc: 'Add new courses, articles and tutorials',
        requires: ['view'],
      },
      { id: 'edit', label: 'Edit', desc: 'Modify existing content', requires: ['view'] },
      {
        id: 'delete',
        label: 'Delete',
        desc: 'Permanently remove content',
        requires: ['view'],
      },
      {
        id: 'publish',
        label: 'Publish / Unpublish',
        desc: 'Control content live visibility',
        requires: ['view'],
      },
    ],
  },
  {
    id: 'team',
    label: 'Team Progress',
    icon: BarChart3,
    base: view('Access team analytics dashboard'),
    granular: [
      {
        id: 'export',
        label: 'Export reports',
        desc: 'Download team progress reports',
        requires: ['view'],
      },
      {
        id: 'remind',
        label: 'Send reminders',
        desc: 'Notify non-completers via email',
        requires: ['view'],
      },
    ],
  },
  {
    id: 'assign',
    label: 'Assign Training',
    icon: ClipboardList,
    base: view('See all active training assignments'),
    granular: [
      {
        id: 'create',
        label: 'Create assignment',
        desc: 'Assign courses to users or groups',
        requires: ['view'],
      },
      {
        id: 'delete',
        label: 'Delete assignment',
        desc: 'Remove existing assignments',
        requires: ['view'],
      },
      {
        id: 'progress',
        label: 'Per-person detail',
        desc: 'Drill into individual completion rates',
        requires: ['view'],
      },
    ],
  },
  {
    id: 'settings',
    label: 'Platform Settings',
    icon: Settings,
    base: view('Access the settings area'),
    granular: [
      {
        id: 'platform',
        label: 'Edit platform config',
        desc: 'Toggle platform-wide feature flags',
        requires: ['view'],
      },
      {
        id: 'users',
        label: 'Manage users',
        desc: 'Activate, deactivate and edit roles',
        requires: ['view'],
      },
      {
        id: 'permissions',
        label: 'Edit permission sets',
        desc: 'Create and modify permission groups',
        requires: ['view'],
      },
    ],
  },
];
