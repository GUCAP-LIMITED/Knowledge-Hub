import type { ReactElement } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { Section, SlotFiles } from './upload-content-types';
import { studioIssues, type StudioIssueTarget } from './curriculum-validation';
import { useSubmitAttempt } from './submit-attempt-context';
import styles from './StudioIssueSummary.module.css';

export interface StudioIssueSummaryProps {
  readonly files: SlotFiles;
  readonly sections: readonly Section[];
  readonly onSelect: (target: StudioIssueTarget) => void;
}

/**
 * Shown under the studio after a blocked publish: lists everything still missing, each item a
 * button that jumps straight to where it is fixed (the offender is often in a panel that isn't
 * on screen). It disappears on its own once nothing is left.
 */
export const StudioIssueSummary = ({
  files,
  sections,
  onSelect,
}: StudioIssueSummaryProps): ReactElement | null => {
  const issues = studioIssues(files, sections);
  if (useSubmitAttempt() === 0 || issues.length === 0) return null;

  return (
    <section className={styles.summary} role="alert" aria-label="Items to fix">
      <header className={styles.header}>
        <span className={styles.icon}>
          <AlertTriangle size={18} aria-hidden="true" />
        </span>
        <div>
          <h3 className={styles.title}>
            {issues.length === 1
              ? '1 thing left before you can publish'
              : `${String(issues.length)} things left before you can publish`}
          </h3>
          <p className={styles.hint}>Select an item to jump to it.</p>
        </div>
      </header>
      <ul className={styles.list}>
        {issues.map((issue) => (
          <li key={`${issue.target.type}-${issue.label}`}>
            <button
              type="button"
              className={styles.item}
              onClick={() => {
                onSelect(issue.target);
              }}
            >
              <span>{issue.label}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
