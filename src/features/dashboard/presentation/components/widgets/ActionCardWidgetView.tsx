import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle, LayoutGrid, Star, type LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils';
import type { WidgetData } from '../../../domain';
import styles from './WidgetViews.module.css';

interface ActionMeta {
  readonly icon: LucideIcon;
  readonly toneClass?: string | undefined;
  readonly defaultLabel: string;
  readonly defaultDesc: string;
}

const ACTION_MAP: Record<string, ActionMeta> = {
  'action.review-queue': {
    icon: CheckCircle,
    toneClass: styles.actionIconWarning,
    defaultLabel: 'Review Queue',
    defaultDesc: 'Waiting for review',
  },
  'action.manage-content': {
    icon: LayoutGrid,
    toneClass: styles.actionIconInfo,
    defaultLabel: 'Manage Content',
    defaultDesc: 'Edit and publish',
  },
  'action.team-progress': {
    icon: BarChart3,
    toneClass: styles.actionIconPrimary,
    defaultLabel: 'Team Progress',
    defaultDesc: 'View team analytics',
  },
  'action.course-reviews': {
    icon: Star,
    toneClass: styles.actionIconSecondary,
    defaultLabel: 'Course Reviews',
    defaultDesc: 'See all feedback',
  },
};

export interface ActionCardWidgetViewProps {
  readonly data: WidgetData;
  readonly isEditMode?: boolean;
}

interface ActionCardContentProps {
  readonly icon: LucideIcon;
  readonly toneClass?: string | undefined;
  readonly label: string;
  readonly desc: string;
}

const ActionCardContent = ({
  icon: Icon,
  toneClass,
  label,
  desc,
}: ActionCardContentProps): ReactElement => (
  <>
    <span className={cn(styles.actionIcon, toneClass)}>
      <Icon size={18} aria-hidden="true" />
    </span>
    <span className={styles.actionDetails}>
      <span className={styles.actionLabel}>{label}</span>
      <span className={styles.actionDesc}>{desc}</span>
    </span>
  </>
);

const resolveActionMeta = (data: WidgetData): ActionMeta =>
  ACTION_MAP[data.widgetKey] ?? {
    icon: LayoutGrid,
    toneClass: styles.actionIconPrimary,
    defaultLabel: data.title ?? 'Quick Action',
    defaultDesc: 'Open view',
  };

const isExternalUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://');

export const ActionCardWidgetView = ({
  data,
  isEditMode = false,
}: ActionCardWidgetViewProps): ReactElement => {
  const meta = resolveActionMeta(data);
  const label = data.title ?? meta.defaultLabel;
  const desc = data.description ?? meta.defaultDesc;
  const targetRoute = data.route?.trim();
  const accessibleLabel = `${label}: ${desc}`;

  const content = (
    <ActionCardContent
      icon={meta.icon}
      toneClass={meta.toneClass}
      label={label}
      desc={desc}
    />
  );

  if (isEditMode || !targetRoute) {
    return (
      <div
        className={cn(styles.actionCard, isEditMode && styles.actionCardEditing)}
        aria-label={accessibleLabel}
        role={isEditMode ? undefined : 'group'}
      >
        {content}
      </div>
    );
  }

  if (isExternalUrl(targetRoute)) {
    return (
      <a
        href={targetRoute}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.actionCard}
        aria-label={accessibleLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={targetRoute}
      state={{ fromDashboardAction: true }}
      className={styles.actionCard}
      aria-label={accessibleLabel}
    >
      {content}
    </Link>
  );
};
