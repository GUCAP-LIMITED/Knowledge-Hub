import type { ReactElement } from 'react';
import { AlertTriangle, Calendar, Clock, Shield, User, Users } from 'lucide-react';
import { cn } from '@shared/utils';
import type { MyLearningItem } from '../domain/entities/my-learning-item';
import styles from './MyLearningCard.module.css';

export const CardOriginBadge = ({
  item,
}: {
  readonly item: MyLearningItem;
}): ReactElement => {
  if (item.isAssigned()) {
    let ScopeIcon = Calendar;
    if (item.assignedScope === 'me') ScopeIcon = User;
    else if (item.assignedScope === 'team') ScopeIcon = Users;
    else if (item.assignedScope === 'role') ScopeIcon = Shield;

    return (
      <span className={cn(styles.badgeTopLeft, styles.badgeAssigned)}>
        <ScopeIcon size={12} aria-hidden="true" />
        <span>{item.assignedScopeName ?? 'Assigned'}</span>
      </span>
    );
  }

  return (
    <span className={cn(styles.badgeTopLeft, styles.badgeSelf)}>
      <span>{item.isCourse() ? 'Self-Enrolled' : 'Self-Completed'}</span>
    </span>
  );
};

export const CardDueDate = ({
  item,
}: {
  readonly item: MyLearningItem;
}): ReactElement | null => {
  if (!item.isAssigned() || !item.dueDate || item.isCompleted()) {
    return null;
  }

  const formattedDate = item.dueDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  if (item.isOverdue) {
    const days = item.daysRemaining !== null ? Math.abs(item.daysRemaining) : 0;
    return (
      <div className={cn(styles.dueDateAlert, styles.dueDateOverdue)}>
        <AlertTriangle size={14} aria-hidden="true" />
        <span>
          Overdue by {String(days)} {days === 1 ? 'day' : 'days'} ({formattedDate})
        </span>
      </div>
    );
  }

  return (
    <div className={cn(styles.dueDateAlert, styles.dueDateUpcoming)}>
      <Clock size={14} aria-hidden="true" />
      <span>Due {formattedDate}</span>
    </div>
  );
};
