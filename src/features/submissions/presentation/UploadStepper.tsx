import type { ReactElement } from 'react';
import { Check, Lock } from 'lucide-react';
import { cn } from '@shared/utils';
import type { StepKey } from './upload-content-types';
import styles from './UploadPage.module.css';

const STEP_LABELS: Record<StepKey, string> = {
  type: 'Type',
  details: 'Details',
  file: 'Upload',
  curriculum: 'Review',
  preview: 'Publish',
  studio: 'Studio',
};

export interface UploadStepperProps {
  readonly steps: readonly StepKey[];
  readonly activeKey: StepKey;
  readonly done: boolean;
}

const activeStage = (
  steps: readonly StepKey[],
  activeKey: StepKey,
  done: boolean,
): number => (done ? steps.length : steps.indexOf(activeKey));

type StageState = 'complete' | 'active' | 'locked';

const stateFor = (index: number, current: number): StageState => {
  if (index < current) {
    return 'complete';
  }
  return index === current ? 'active' : 'locked';
};

export const UploadStepper = ({
  steps,
  activeKey,
  done,
}: UploadStepperProps): ReactElement => {
  const current = activeStage(steps, activeKey, done);
  return (
    <ol className={styles.stepper} aria-label="Upload progress">
      {steps.map((stageKey, index) => {
        const state = stateFor(index, current);
        return (
          <li
            key={stageKey}
            className={cn(styles.step, styles[`step_${state}`])}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            {index > 0 ? <span className={styles.stepLine} aria-hidden="true" /> : null}
            <span className={styles.stepDot}>
              {state === 'complete' ? <Check size={14} aria-hidden="true" /> : null}
              {state === 'active' ? index + 1 : null}
              {state === 'locked' ? <Lock size={11} aria-hidden="true" /> : null}
            </span>
            <span className={styles.stepText}>
              <span className={styles.stepIndex}>Step {index + 1}</span>
              <span className={styles.stepLabel}>{STEP_LABELS[stageKey]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};
