import type { ReactElement } from 'react';
import { Check, Lock } from 'lucide-react';
import { cn } from '@shared/utils';
import type { StepKey } from './upload-content-types';
import styles from './UploadPage.module.css';

interface JourneyStage {
  readonly key: StepKey;
  readonly label: string;
}

/** The canonical five-stage journey shown on every step so the full flow is always visible. */
const JOURNEY: readonly JourneyStage[] = [
  { key: 'type', label: 'Type' },
  { key: 'details', label: 'Details' },
  { key: 'file', label: 'Upload' },
  { key: 'curriculum', label: 'Review' },
  { key: 'preview', label: 'Publish' },
];

export interface UploadStepperProps {
  readonly activeKey: StepKey;
  readonly done: boolean;
}

const activeStage = (activeKey: StepKey, done: boolean): number =>
  done ? JOURNEY.length : JOURNEY.findIndex((stage) => stage.key === activeKey);

type StageState = 'complete' | 'active' | 'locked';

const stateFor = (index: number, current: number): StageState => {
  if (index < current) {
    return 'complete';
  }
  return index === current ? 'active' : 'locked';
};

/** A polished, always-visible progress journey with completed / current / locked stages. */
export const UploadStepper = ({ activeKey, done }: UploadStepperProps): ReactElement => {
  const current = activeStage(activeKey, done);
  return (
    <ol className={styles.stepper} aria-label="Upload progress">
      {JOURNEY.map((stage, index) => {
        const state = stateFor(index, current);
        return (
          <li
            key={stage.key}
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
              <span className={styles.stepLabel}>{stage.label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};
