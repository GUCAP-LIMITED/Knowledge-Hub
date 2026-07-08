import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import type { SubmissionStatus } from '../domain';
import styles from './StatusBadge.module.css';

const LABELS: Record<SubmissionStatus, string> = {
  pending: 'Pending',
  review: 'Under review',
  approved: 'Approved',
  published: 'Published',
  rejected: 'Rejected',
};

export interface StatusBadgeProps {
  readonly status: SubmissionStatus;
}

/** Coloured pill for a submission status. */
export const StatusBadge = ({ status }: StatusBadgeProps): ReactElement => (
  <span className={cn(styles.badge, styles[status])}>{LABELS[status]}</span>
);
