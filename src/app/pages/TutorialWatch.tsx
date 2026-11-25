import { useState, type ReactElement } from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { Alert, Tabs, TabsPanel } from '@shared/ui';
import { QuizRunner, useQuizLearnerStatus, type QuizResult } from '@features/quizzes';
import type { Tutorial } from '@features/tutorials';
import { TutorialVideoPanel } from './TutorialVideoPanel';
import styles from './TutorialDetailPage.module.css';

const TutorialQuizActivePanel = ({
  tutorial,
  onQuizPassed,
}: {
  readonly tutorial: Tutorial;
  readonly onQuizPassed?: (() => void) | undefined;
}): ReactElement => {
  const [activeResult, setActiveResult] = useState<QuizResult | null | undefined>(
    undefined,
  );
  const { data: learnerStatus, isLoading: isStatusLoading } = useQuizLearnerStatus(
    tutorial.quizId,
  );

  const handlePassed = (): void => {
    onQuizPassed?.();
  };

  const isPassed =
    activeResult !== undefined
      ? activeResult?.passed === true
      : learnerStatus?.latestResult?.passed === true;

  const showBanner = tutorial.isQuizRequired && !isPassed && !isStatusLoading;

  return (
    <div className={styles.quizPanel}>
      {showBanner ? (
        <Alert tone="info" title="Quiz Submission Required">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={15} style={{ color: 'var(--color-success)' }} />
            All tutorial videos completed! Submit and pass this quiz to complete the
            tutorial and receive your certificate.
          </span>
        </Alert>
      ) : null}
      {tutorial.quizId ? (
        <QuizRunner
          quizId={tutorial.quizId}
          lessonId={null}
          onPassed={handlePassed}
          onResultChange={setActiveResult}
        />
      ) : null}
    </div>
  );
};

const TutorialQuizPanel = ({
  tutorial,
  isLocked,
  onQuizPassed,
}: {
  readonly tutorial: Tutorial;
  readonly isLocked: boolean;
  readonly onQuizPassed?: (() => void) | undefined;
}): ReactElement => {
  if (isLocked) {
    const totalVideos = tutorial.videos.length;
    const completedVideos = tutorial.videos.filter((v) => v.isMediaCompleted).length;
    return (
      <div className={styles.quizPanel}>
        <div className={styles.quizLockedCard}>
          <Lock size={36} className={styles.quizLockedIcon} aria-hidden="true" />
          <h4 className={styles.quizLockedTitle}>Quiz Assessment</h4>
          <p className={styles.quizLockedText}>
            You must watch all video parts in this tutorial before unlocking the quiz
            assessment.
          </p>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
            }}
          >
            {completedVideos} of {totalVideos} videos watched
          </span>
        </div>
      </div>
    );
  }

  return <TutorialQuizActivePanel tutorial={tutorial} onQuizPassed={onQuizPassed} />;
};

export interface TutorialWatchContentProps {
  readonly tutorial: Tutorial;
  readonly activeTab: 'video' | 'quiz';
  readonly hasCertificate?: boolean;
  readonly certificateUrl?: string | null;
  readonly onViewCertificate?: (() => void) | undefined;
  readonly onTabChange: (tab: 'video' | 'quiz') => void;
  readonly onEnded: () => void;
  readonly onQuizPassed?: (() => void) | undefined;
}

/** The watchable tutorial content: video (+ playlist + helpful vote + reviews), and a dual-gated quiz tab. */
export const TutorialWatchContent = ({
  tutorial,
  activeTab,
  hasCertificate,
  certificateUrl,
  onViewCertificate,
  onTabChange,
  onEnded,
  onQuizPassed,
}: TutorialWatchContentProps): ReactElement => {
  const showCertificate =
    hasCertificate ?? (certificateUrl !== null && certificateUrl !== undefined);

  if (!tutorial.quizId) {
    return (
      <TutorialVideoPanel
        tutorial={tutorial}
        hasCertificate={showCertificate}
        onViewCertificate={onViewCertificate}
        onEnded={onEnded}
      />
    );
  }

  const hasVideos = tutorial.videos.length > 0;
  const allVideosWatched =
    !hasVideos || tutorial.allVideosCompleted || tutorial.isCompleted();

  const isQuizLocked = tutorial.isQuizRequired && !allVideosWatched;

  const tabs = [
    { value: 'video', label: 'Watch Video' },
    {
      value: 'quiz',
      label: 'Quiz Assessment',
    },
  ];

  return (
    <Tabs
      tabs={tabs}
      value={activeTab}
      onValueChange={(v) => {
        onTabChange(v as 'video' | 'quiz');
      }}
    >
      <TabsPanel value="video">
        <div className={styles.tabPanelSpacing}>
          <TutorialVideoPanel
            tutorial={tutorial}
            hasCertificate={showCertificate}
            onViewCertificate={onViewCertificate}
            onEnded={onEnded}
          />
        </div>
      </TabsPanel>
      <TabsPanel value="quiz">
        <TutorialQuizPanel
          tutorial={tutorial}
          isLocked={isQuizLocked}
          onQuizPassed={onQuizPassed}
        />
      </TabsPanel>
    </Tabs>
  );
};
