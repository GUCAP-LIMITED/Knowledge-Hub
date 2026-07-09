import type { ReactElement } from 'react';
import { CheckCircle, CircleDashed, Eye, Send, X, type LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils';
import type { Submission } from '../domain';
import styles from './ReviewSubmissionModal.module.css';

interface Step {
  readonly label: string;
  readonly detail: string;
  readonly done: boolean;
  readonly icon: LucideIcon;
}

const decisionIcon = (submission: Submission): LucideIcon => {
  if (submission.status === 'rejected') {
    return X;
  }
  if (submission.status === 'approved' || submission.status === 'published') {
    return CheckCircle;
  }
  return CircleDashed;
};

const decisionLabel = (submission: Submission): string => {
  if (submission.status === 'approved') {
    return 'Approved';
  }
  if (submission.status === 'rejected') {
    return 'Rejected';
  }
  return submission.status === 'published' ? 'Published' : 'Decision';
};

const buildSteps = (submission: Submission): readonly Step[] => {
  const decided = submission.isFinal() || submission.status === 'approved';
  return [
    {
      label: 'Submitted',
      detail: submission.submittedAt.toLocaleDateString(),
      done: true,
      icon: Send,
    },
    {
      label: 'Under review',
      detail: submission.status === 'pending' ? 'Waiting' : 'In progress',
      done: submission.status !== 'pending',
      icon: Eye,
    },
    {
      label: decisionLabel(submission),
      detail: decided ? 'Complete' : 'Pending',
      done: decided,
      icon: decisionIcon(submission),
    },
  ];
};

export interface SubmissionTimelineProps {
  readonly submission: Submission;
}

/** Vertical Submitted → Under review → Decision timeline. */
export const SubmissionTimeline = ({
  submission,
}: SubmissionTimelineProps): ReactElement => (
  <div className={styles.timeline}>
    <h4 className={styles.timelineTitle}>Timeline</h4>
    <div className={styles.track}>
      {buildSteps(submission).map((step) => {
        const StepIcon = step.icon;
        return (
          <div key={step.label} className={styles.step}>
            <span className={cn(styles.stepDot, step.done && styles.stepDone)}>
              <StepIcon size={12} aria-hidden="true" />
            </span>
            <div>
              <div className={styles.stepLabel}>{step.label}</div>
              <div className={styles.stepDetail}>{step.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
