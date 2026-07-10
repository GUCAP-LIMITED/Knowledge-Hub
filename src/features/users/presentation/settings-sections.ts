import type { ToggleSetting } from './SettingsToggles';

export type SettingsSectionKey = 'platform' | 'content-types' | 'users' | 'permissions';

export interface SettingsSectionMeta {
  readonly key: SettingsSectionKey;
  readonly label: string;
  readonly title: string;
  readonly subtitle: string;
}

/** Ordered admin Settings sections — drive the sidebar submenu and the routed page header. */
export const SETTINGS_SECTIONS: readonly SettingsSectionMeta[] = [
  {
    key: 'platform',
    label: 'Platform',
    title: 'Platform Settings',
    subtitle: 'Toggle platform-wide behaviour for the academy.',
  },
  {
    key: 'content-types',
    label: 'Content Types',
    title: 'Content Types',
    subtitle: 'Manage the types available for courses, tutorials & resources.',
  },
  {
    key: 'users',
    label: 'Users',
    title: 'Users',
    subtitle: 'Review the directory and activate or suspend accounts.',
  },
  {
    key: 'permissions',
    label: 'Permissions',
    title: 'Permissions',
    subtitle: 'Configure what each access level can see and do.',
  },
];

export const isSettingsSection = (
  value: string | undefined,
): value is SettingsSectionKey =>
  SETTINGS_SECTIONS.some((section) => section.key === value);

export const PLATFORM_SETTINGS: readonly ToggleSetting[] = [
  {
    key: 'public-signup',
    label: 'Public sign-up',
    description: 'Let new people create an account without an invite',
    defaultOn: true,
  },
  {
    key: 'public-catalog',
    label: 'Public course catalog',
    description: 'Show courses, tutorials & resources to signed-out visitors',
    defaultOn: false,
  },
  {
    key: 'approval',
    label: 'Require review before publishing',
    description: 'Uploads enter the approval queue instead of going live',
    defaultOn: true,
  },
  {
    key: 'self-enrol',
    label: 'Allow self-enrolment',
    description: 'Let learners enrol in optional courses on their own',
    defaultOn: true,
  },
  {
    key: 'auto-certificates',
    label: 'Auto-issue certificates',
    description: 'Award a certificate automatically when a course is completed',
    defaultOn: true,
  },
  {
    key: 'ratings',
    label: 'Course ratings & reviews',
    description: 'Let learners rate courses and leave written feedback',
    defaultOn: true,
  },
  {
    key: 'reminders',
    label: 'Mandatory-training reminders',
    description: 'Email learners who have not finished required courses',
    defaultOn: true,
  },
  {
    key: 'email',
    label: 'Email notifications',
    description: 'Send platform updates and announcements by email',
    defaultOn: true,
  },
];
