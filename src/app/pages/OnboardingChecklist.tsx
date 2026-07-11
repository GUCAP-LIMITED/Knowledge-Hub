import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Circle, Compass, GraduationCap, X } from 'lucide-react';
import { cn, useLocalStorage } from '@shared/utils';
import styles from './DashboardPage.module.css';

export interface OnboardingChecklistProps {
  readonly userId: string;
  /** Has started at least one course. */
  readonly started: boolean;
  /** Has completed at least one course. */
  readonly completed: boolean;
  /** Has earned at least one certificate. */
  readonly certified: boolean;
}

const buildSteps = (
  props: OnboardingChecklistProps,
): { readonly label: string; readonly to: string; readonly done: boolean }[] => [
  { label: 'Browse the catalog and start a course', to: '/courses', done: props.started },
  { label: 'Complete a course you started', to: '/my-learning', done: props.completed },
  {
    label: 'Pass the quiz to earn a certificate',
    to: '/certificates',
    done: props.certified,
  },
];

const ICONS = [Compass, GraduationCap, Award];

/** First-run guidance for learners: a dismissible checklist that ticks off as they progress. */
export const OnboardingChecklist = (
  props: OnboardingChecklistProps,
): ReactElement | null => {
  const [dismissed, setDismissed] = useLocalStorage<boolean>(
    `uapp:onboarding-dismissed:${props.userId}`,
    false,
  );
  const steps = buildSteps(props);
  const doneCount = steps.filter((step) => step.done).length;

  if (dismissed || doneCount === steps.length) {
    return null;
  }

  return (
    <div className={styles.onboard}>
      <div className={styles.onboardHead}>
        <div>
          <h2 className={styles.onboardTitle}>Getting started</h2>
          <p className={styles.onboardSub}>
            {doneCount} of {steps.length} done — you’re on your way.
          </p>
        </div>
        <button
          type="button"
          className={styles.onboardClose}
          aria-label="Dismiss getting started"
          onClick={() => {
            setDismissed(true);
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <ol className={styles.onboardSteps}>
        {steps.map((step, index) => {
          const StepIcon = ICONS[index] ?? Compass;
          return (
            <li
              key={step.to}
              className={cn(styles.onboardStep, step.done && styles.onboardStepDone)}
            >
              {step.done ? (
                <CheckCircle2
                  size={18}
                  aria-hidden="true"
                  className={styles.onboardCheck}
                />
              ) : (
                <Circle size={18} aria-hidden="true" className={styles.onboardCircle} />
              )}
              <StepIcon size={16} aria-hidden="true" className={styles.onboardStepIcon} />
              <span className={styles.onboardLabel}>{step.label}</span>
              {step.done ? null : (
                <Link to={step.to} className={styles.onboardLink}>
                  Go
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
