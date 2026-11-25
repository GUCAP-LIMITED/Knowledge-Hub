/* eslint-disable max-lines-per-function */
import { useState, useEffect, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Edit2, Eye, Gauge, Hash } from 'lucide-react';
import {
  Badge,
  CategoryBadge,
  Celebration,
  IconButton,
  StatusBadge,
  Tooltip,
} from '@shared/ui';
import { cn, sanitizeRichText } from '@shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  type Tutorial,
  useMarkTutorialComplete,
  useUpdateTutorial,
  TutorialEditModal,
  tutorialsQueryKey,
  tutorialQueryKey,
} from '@features/tutorials';
import { useMyCapabilities } from '@features/users';
import { useContentTypes } from '@features/content-types';
import { CertificateModal } from '@features/certificates';
import { TutorialWatchContent } from './TutorialWatch';
import styles from './TutorialDetailPage.module.css';

const TutorialBreadcrumb = ({ title }: { readonly title: string }): ReactElement => (
  <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <Link to="/tutorials" className={styles.breadcrumbLink}>
      <ArrowLeft size={14} aria-hidden="true" /> Tutorials
    </Link>
    <span aria-hidden="true">/</span>
    <span className={cn(styles.breadcrumbCurrent, styles.breadcrumbTruncate)}>
      {title}
    </span>
  </nav>
);

const TutorialHeader = ({
  tutorial,
  canEdit,
  onEditContent,
}: {
  readonly tutorial: Tutorial;
  readonly canEdit?: boolean;
  readonly onEditContent?: () => void;
}): ReactElement => (
  <section className={styles.card}>
    <div className={styles.cardHead}>
      <div className={styles.cardHeadMain}>
        <h1 className={styles.pageTitle}>{tutorial.title}</h1>
        <div className={styles.badgeRow}>
          <CategoryBadge category={tutorial.category} />
          {tutorial.isCompleted() ? (
            <StatusBadge tone="success" label="Completed" />
          ) : null}
          {tutorial.quizId ? (
            <Badge tone={tutorial.isQuizRequired ? 'primary' : 'neutral'} size="sm">
              {tutorial.isQuizRequired ? 'Quiz Required' : 'Quiz Included'}
            </Badge>
          ) : null}
          {tutorial.visibility === 'Team' ? (
            <Badge size="sm" tone="info">
              Team
            </Badge>
          ) : null}
          {tutorial.visibility === 'Private' ? (
            <Badge size="sm" tone="warning">
              Private
            </Badge>
          ) : null}
        </div>
      </div>
      {canEdit && onEditContent && (
        <div className={styles.cardHeadActions}>
          <Tooltip label="Edit tutorial content">
            <IconButton label="Edit tutorial content" onClick={onEditContent}>
              <Edit2 size={14} aria-hidden="true" />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
    <p
      className={styles.description}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(tutorial.description) }}
    />
  </section>
);

const TutorialDetailsSidebar = ({
  tutorial,
  canEdit,
  onEditDetails,
}: {
  readonly tutorial: Tutorial;
  readonly canEdit?: boolean;
  readonly onEditDetails?: () => void;
}): ReactElement => {
  const rows = [
    { label: 'Category', value: tutorial.category, icon: Hash },
    { label: 'Duration', value: tutorial.duration, icon: Clock },
    { label: 'Difficulty', value: tutorial.difficulty, icon: Gauge },
    tutorial.views > 0
      ? { label: 'Views', value: tutorial.views.toLocaleString(), icon: Eye }
      : null,
    { label: 'Updated', value: tutorial.updatedAt.toLocaleDateString(), icon: Calendar },
  ].filter((row) => row !== null);

  return (
    <aside className={cn(styles.card, styles.detailsSidebar)}>
      <div className={styles.sidebarHead}>
        <h2 className={styles.sidebarTitle}>Tutorial details</h2>
        {canEdit && onEditDetails && (
          <Tooltip label="Edit tutorial details">
            <IconButton label="Edit tutorial details" onClick={onEditDetails}>
              <Edit2 size={14} aria-hidden="true" />
            </IconButton>
          </Tooltip>
        )}
      </div>
      {rows.map((row) => (
        <div key={row.label} className={styles.detailRow}>
          <row.icon size={16} aria-hidden="true" className={styles.detailIcon} />
          <div>
            <div className={styles.detailLabel}>{row.label}</div>
            <div className={styles.detailValue}>{row.value}</div>
          </div>
        </div>
      ))}
    </aside>
  );
};

const resolveCertificateId = (id: string | null, url: string | null): string | null => {
  if (id) return id;
  if (!url) return null;
  const match = /\/certificate\/([0-9a-fA-F-]+)\/file/.exec(url);
  return match?.[1] ?? null;
};

interface TutorialCertificatePreview {
  readonly certificateUrl: string | null;
  readonly viewingCertificateId: string | null;
  readonly hasCertificate: boolean;
  readonly onCompleteUpdated: (updated: Tutorial) => void;
  readonly handleViewCertificate: () => void;
  readonly handleCloseCertificate: () => void;
}

const useTutorialCertificatePreview = (
  tutorial: Tutorial,
): TutorialCertificatePreview => {
  const [certificateUrl, setCertificateUrl] = useState<string | null>(
    tutorial.certificateUrl,
  );
  const [certificateId, setCertificateId] = useState<string | null>(
    tutorial.certificateId ?? null,
  );
  const [viewingCertificateId, setViewingCertificateId] = useState<string | null>(null);

  useEffect(() => {
    setCertificateUrl(tutorial.certificateUrl);
    setCertificateId(tutorial.certificateId ?? null);
  }, [tutorial.id, tutorial.certificateUrl, tutorial.certificateId]);

  const onCompleteUpdated = (updated: Tutorial): void => {
    setCertificateUrl(updated.certificateUrl);
    setCertificateId(updated.certificateId ?? null);
  };

  const handleViewCertificate = (): void => {
    const targetId = resolveCertificateId(
      certificateId ?? tutorial.certificateId,
      certificateUrl ?? tutorial.certificateUrl,
    );
    if (targetId) {
      setViewingCertificateId(targetId);
    }
  };

  const handleCloseCertificate = (): void => {
    setViewingCertificateId(null);
  };

  const hasCertificate =
    certificateId !== null || certificateUrl !== null || tutorial.isCompleted();

  return {
    certificateUrl,
    viewingCertificateId,
    hasCertificate,
    onCompleteUpdated,
    handleViewCertificate,
    handleCloseCertificate,
  };
};

/** The loaded tutorial detail: header, video/quiz content, reviews, and a details sidebar. */
export const TutorialDetailView = ({
  tutorial,
}: {
  readonly tutorial: Tutorial;
}): ReactElement => {
  const { can } = useMyCapabilities();
  const canEdit = can('tutorials', 'edit') && tutorial.canModify;
  const navigate = useNavigate();
  const updateTutorial = useUpdateTutorial();
  const categories = useContentTypes('tutorial');
  const [editingMetadata, setEditingMetadata] = useState<Tutorial | null>(null);

  const [activeTab, setActiveTab] = useState<'video' | 'quiz'>('video');
  const [celebrate, setCelebrate] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(() => tutorial.isCompleted());
  const markComplete = useMarkTutorialComplete();
  const certPreview = useTutorialCertificatePreview(tutorial);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!wasCompleted && tutorial.isCompleted()) {
      setCelebrate(true);
      setWasCompleted(true);
    }
  }, [tutorial, wasCompleted]);

  const handleEnded = (): void => {
    if (tutorial.isCompleted()) return;
    const hasMultiple = tutorial.videos.length > 1;
    if (!hasMultiple) {
      markComplete.mutate(tutorial.id, {
        onSuccess: (updated) => {
          if (updated.isCompleted()) {
            setCelebrate(true);
          }
          certPreview.onCompleteUpdated(updated);
        },
      });
    }
  };

  const handleQuizPassed = (): void => {
    setCelebrate(true);
    void queryClient.invalidateQueries({
      queryKey: tutorialQueryKey(tutorial.id),
    });
    void queryClient.invalidateQueries({
      queryKey: tutorialsQueryKey,
    });
    setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: tutorialQueryKey(tutorial.id),
      });
    }, 800);
  };

  const handleEditContent = (): void => {
    navigate(`/submissions/${tutorial.id}/edit?tab=tutorial-content`);
  };

  const handleOpenEditDetails = (): void => {
    setEditingMetadata(tutorial);
  };

  return (
    <>
      <Celebration show={celebrate} />
      <TutorialBreadcrumb title={tutorial.title} />
      <div className={styles.layout}>
        <div className={styles.main}>
          <TutorialHeader
            tutorial={tutorial}
            canEdit={canEdit}
            onEditContent={handleEditContent}
          />
          <section className={styles.card}>
            <TutorialWatchContent
              tutorial={tutorial}
              activeTab={activeTab}
              hasCertificate={certPreview.hasCertificate}
              certificateUrl={certPreview.certificateUrl}
              onViewCertificate={certPreview.handleViewCertificate}
              onTabChange={setActiveTab}
              onEnded={handleEnded}
              onQuizPassed={handleQuizPassed}
            />
          </section>
        </div>
        <TutorialDetailsSidebar
          tutorial={tutorial}
          canEdit={canEdit}
          onEditDetails={handleOpenEditDetails}
        />
      </div>

      <TutorialEditModal
        editing={editingMetadata}
        categories={categories}
        update={updateTutorial}
        onClose={() => {
          setEditingMetadata(null);
        }}
      />

      <CertificateModal
        certificateId={certPreview.viewingCertificateId}
        onClose={certPreview.handleCloseCertificate}
      />
    </>
  );
};
