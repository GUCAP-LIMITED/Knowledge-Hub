/* eslint-disable max-lines, max-lines-per-function, complexity */
import { useState, useMemo, type ReactElement } from 'react';
import { Modal, Button, Spinner, Alert, Badge } from '@shared/ui';
import { MediaViewer } from '@shared/ui/MediaViewer/MediaViewer';
import { PlaybackMediaViewer } from '@features/playback/presentation/PlaybackMediaViewer';
import {
  LESSON_KIND,
  useGetMediaReadSas,
  useGetQuiz,
  formatDurationDisplay,
  type QuizDraftInput,
} from '@features/content';
import { QuizAnswerKeyViewer } from './QuizAnswerKeyViewer';
import type { EditableLesson } from './types';
import { useAssignmentBriefs } from '@features/courses';
import {
  type LucideIcon,
  ExternalLink,
  Film,
  FileText,
  CheckSquare,
  Globe,
  BookOpen,
  Clock,
  Eye,
  Lock,
  Folder,
  HardDrive,
  Link2,
  Copy,
  Check,
  Award,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { resolveDocumentMediaKind } from './EditLessonModal/forms/document-lesson-utils';
import styles from './LessonPreviewModal.module.css';

export interface LessonPreviewModalProps {
  readonly lesson: EditableLesson | null;
  readonly contentId: string;
  readonly sectionTitle?: string | undefined;
  readonly open: boolean;
  readonly onClose: () => void;
}

const getLessonIconComponent = (kind: number): LucideIcon => {
  switch (kind) {
    case LESSON_KIND.video:
      return Film;
    case LESSON_KIND.pdf:
      return FileText;
    case LESSON_KIND.quiz:
      return CheckSquare;
    case LESSON_KIND.assignment:
      return BookOpen;
    case LESSON_KIND.link:
      return Globe;
    default:
      return BookOpen;
  }
};

const getKindLabel = (kind: number): string => {
  switch (kind) {
    case LESSON_KIND.video:
      return 'Video Lesson';
    case LESSON_KIND.pdf:
      return 'Document / PDF';
    case LESSON_KIND.quiz:
      return 'Interactive Quiz';
    case LESSON_KIND.assignment:
      return 'Assignment';
    case LESSON_KIND.link:
      return 'External Link';
    default:
      return 'Lesson';
  }
};

const resolveLessonKind = (
  kind: number,
): { isVideo: boolean; isDoc: boolean; isQuiz: boolean; isAssignment: boolean } => ({
  isVideo: kind === LESSON_KIND.video || kind === 0,
  isDoc: kind === LESSON_KIND.pdf || kind === 5,
  isQuiz: kind === LESSON_KIND.quiz || kind === 10,
  isAssignment: kind === LESSON_KIND.assignment || kind === 15,
});

const getMediaKindString = (
  isVideo: boolean,
  isDoc: boolean,
  urlOrName?: string | null,
): 'video' | 'pdf' | 'doc' | 'link' => {
  if (isVideo) return 'video';
  if (isDoc) return resolveDocumentMediaKind(urlOrName);
  return 'link';
};

const getExternalProviderName = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube';
  if (lower.includes('vimeo.com')) return 'Vimeo';
  if (lower.includes('.m3u8')) return 'HLS Stream';
  if (lower.includes('.mp4')) return 'Direct MP4 Video';
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch {
    return 'External URL';
  }
};

const formatLessonDuration = (durationSeconds: number): string => {
  if (durationSeconds <= 0) return '0s (Not specified)';
  const formatted = formatDurationDisplay(durationSeconds);
  return `${formatted} (${String(durationSeconds)}s)`;
};

interface StagedMediaPreviewProps {
  readonly media: NonNullable<EditableLesson['media']>;
  readonly effectiveUrl: string | null;
  readonly isLoading: boolean;
  readonly isVideo: boolean;
}

const StagedMediaPreview = ({
  media,
  effectiveUrl,
  isLoading,
  isVideo,
}: StagedMediaPreviewProps): ReactElement => {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Spinner size="lg" label="Generating secure preview URL..." />
      </div>
    );
  }

  if (!effectiveUrl) {
    return (
      <Alert tone="warning" title="Storage Preview Unavailable">
        The media asset is staged in the draft, but direct storage preview is currently
        unavailable.
      </Alert>
    );
  }

  return (
    <MediaViewer
      asset={{
        kind: isVideo ? 'video' : resolveDocumentMediaKind(media.originalFileName),
        name: media.originalFileName,
        url: effectiveUrl,
      }}
    />
  );
};

interface QuizLessonPreviewProps {
  readonly quiz: QuizDraftInput | null | undefined;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

const QuizLessonPreview = ({
  quiz,
  isLoading,
  error,
}: QuizLessonPreviewProps): ReactElement => {
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
        }}
      >
        <Spinner size="lg" label="Loading quiz questions & answer key..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert tone="error" title="Failed to load quiz details">
        {error.message}
      </Alert>
    );
  }

  return <QuizAnswerKeyViewer quiz={quiz} />;
};

interface ExternalUrlCardProps {
  readonly url: string;
  readonly providerName: string;
}

const ExternalUrlCard = ({ url, providerName }: ExternalUrlCardProps): ReactElement => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className={styles.sourceDetailsCard}>
      <div className={styles.sourceDetailsLeft}>
        <div className={styles.sourceTitleRow}>
          <Link2 size={15} style={{ color: 'var(--color-primary)' }} />
          <span>Source Stream: {providerName}</span>
        </div>
        <span className={styles.sourceUrlBox}>{url}</span>
      </div>
      <div className={styles.sourceActions}>
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy URL'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            window.open(url, '_blank', 'noreferrer');
          }}
        >
          <ExternalLink size={13} /> Open Link
        </Button>
      </div>
    </div>
  );
};

interface StagedMediaCardProps {
  readonly media: NonNullable<EditableLesson['media']>;
  readonly effectiveUrl: string | null;
}

const StagedMediaCard = ({ media, effectiveUrl }: StagedMediaCardProps): ReactElement => {
  const fileSizeMb = (media.sizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className={styles.sourceDetailsCard}>
      <div className={styles.sourceDetailsLeft}>
        <div className={styles.sourceTitleRow}>
          <HardDrive size={15} style={{ color: 'var(--color-primary)' }} />
          <span>Uploaded Staged File</span>
        </div>
        <span className={styles.sourceUrlBox}>
          {media.originalFileName} ({fileSizeMb} MB) • Blob: {media.azureBlobName}
        </span>
      </div>
      {effectiveUrl && (
        <div className={styles.sourceActions}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              window.open(effectiveUrl, '_blank', 'noreferrer');
            }}
          >
            <ExternalLink size={13} /> Raw File
          </Button>
        </div>
      )}
    </div>
  );
};

interface InspectorBarProps {
  readonly lesson: EditableLesson;
  readonly sectionTitle?: string | undefined;
  readonly effectiveSasUrl?: string | null | undefined;
  readonly quiz?: QuizDraftInput | null | undefined;
}

const InspectorBar = ({
  lesson,
  sectionTitle,
  effectiveSasUrl,
  quiz,
}: InspectorBarProps): ReactElement => {
  const durationText = formatLessonDuration(lesson.durationSeconds);
  const provider = lesson.externalUrl
    ? getExternalProviderName(lesson.externalUrl)
    : null;
  const isQuiz = lesson.kind === LESSON_KIND.quiz;

  return (
    <div className={styles.inspectorBar}>
      <div className={styles.contextRow}>
        {sectionTitle ? (
          <span className={styles.sectionBadge}>
            <Folder size={14} style={{ color: 'var(--color-primary)' }} />
            Section: {sectionTitle}
          </span>
        ) : (
          <span className={styles.sectionBadge}>
            <Film size={14} style={{ color: 'var(--color-primary)' }} />
            Curriculum Lesson
          </span>
        )}

        <div className={styles.badgeGroup}>
          <Badge tone="primary" icon={getLessonIconComponent(lesson.kind)}>
            {getKindLabel(lesson.kind)}
          </Badge>

          {isQuiz ? (
            <>
              <Badge tone="info" icon={Award}>
                Passing Score: {String(quiz?.passingPercentage ?? 80)}%
              </Badge>
              <Badge tone="neutral" icon={RotateCcw}>
                {(quiz?.isMultipleAttemptAllowed ?? true)
                  ? 'Multiple Attempts Allowed'
                  : 'Single Attempt Only'}
              </Badge>
              {quiz?.questions ? (
                <Badge tone="neutral" icon={HelpCircle}>
                  {String(quiz.questions.length)} Question
                  {quiz.questions.length === 1 ? '' : 's'}
                </Badge>
              ) : null}
              {quiz ? (
                (quiz.upgradeQuiz ?? true) ? (
                  <Badge
                    tone="warning"
                    icon={RotateCcw}
                    title="Creates a new version on approval. Learners will receive a fresh attempt."
                  >
                    Version Upgrade: v{String(quiz.version ?? 1)} → v
                    {String((quiz.version ?? 1) + 1)}
                  </Badge>
                ) : (
                  <Badge
                    tone="neutral"
                    icon={CheckSquare}
                    title="In-place edit without version increment. Existing learner attempts and scores are preserved."
                  >
                    In-Place Edit: v{String(quiz.version ?? 1)}
                  </Badge>
                )
              ) : null}
            </>
          ) : (
            <Badge tone="neutral" icon={Clock}>
              {durationText}
            </Badge>
          )}

          {lesson.isPreview ? (
            <Badge tone="success" icon={Eye}>
              Free Preview Available
            </Badge>
          ) : (
            <Badge tone="neutral" icon={Lock}>
              Enrolled Only
            </Badge>
          )}
        </div>
      </div>

      {lesson.externalUrl && (
        <ExternalUrlCard
          url={lesson.externalUrl}
          providerName={provider ?? 'External URL'}
        />
      )}

      {lesson.media && (
        <StagedMediaCard
          media={lesson.media}
          effectiveUrl={lesson.media.previewUrl ?? effectiveSasUrl ?? null}
        />
      )}
    </div>
  );
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface AssignmentLessonPreviewProps {
  readonly lesson: EditableLesson;
  readonly contentId: string;
}

interface AssignmentBriefDisplayFile {
  readonly id: string;
  readonly name: string;
  readonly sizeBytes?: number | undefined;
  readonly url?: string | null | undefined;
  readonly azureBlobName?: string | null | undefined;
}

interface AssignmentBriefRowProps {
  readonly file: AssignmentBriefDisplayFile;
  readonly contentId: string;
}

const AssignmentBriefRow = ({
  file,
  contentId,
}: AssignmentBriefRowProps): ReactElement => {
  const hasDirectUrl = Boolean(file.url);
  const shouldFetchSas = !hasDirectUrl && Boolean(file.azureBlobName);

  const { data: stagedSasUrl, isLoading: isSasLoading } = useGetMediaReadSas(
    contentId,
    shouldFetchSas ? file.azureBlobName : undefined,
  );

  const effectiveUrl = file.url ?? stagedSasUrl ?? null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        gap: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(30, 115, 115, 0.08)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FileText size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={file.name}
          >
            {file.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {formatFileSize(file.sizeBytes)}
          </div>
        </div>
      </div>

      {isSasLoading ? (
        <Button variant="outline" size="sm" disabled>
          <Spinner size="sm" />
          <span>Loading URL...</span>
        </Button>
      ) : effectiveUrl ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
          }}
          title="Open brief file in new tab"
        >
          <ExternalLink size={15} />
          <span>Open in new tab</span>
        </Button>
      ) : (
        <Badge tone="neutral">No direct URL</Badge>
      )}
    </div>
  );
};

const AssignmentLessonPreview = ({
  lesson,
  contentId,
}: AssignmentLessonPreviewProps): ReactElement => {
  const { data: serverBriefs = [], isLoading } = useAssignmentBriefs(
    contentId,
    lesson.id,
  );

  const displayFiles = useMemo<readonly AssignmentBriefDisplayFile[]>(() => {
    const map = new Map<string, AssignmentBriefDisplayFile>();
    if (lesson.assignmentFiles) {
      for (const f of lesson.assignmentFiles) {
        const key =
          f.id ?? (f.azureBlobName !== '' ? f.azureBlobName : f.originalFileName);
        map.set(key, {
          id: key,
          name: f.originalFileName !== '' ? f.originalFileName : 'Brief Document',
          sizeBytes: f.sizeBytes,
          url: f.previewUrl ?? null,
          azureBlobName: f.azureBlobName || null,
        });
      }
    }
    for (const b of serverBriefs) {
      map.set(b.id, {
        id: b.id,
        name: b.originalFileName ?? 'Brief Document',
        sizeBytes: b.sizeBytes,
        url: b.url ?? null,
        azureBlobName: null,
      });
    }
    return Array.from(map.values());
  }, [lesson.assignmentFiles, serverBriefs]);

  if (isLoading && displayFiles.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-hover, rgba(0,0,0,0.02))',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Folder size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            Assignment Brief Files & Instructions
          </span>
        </div>
        <Badge tone={displayFiles.length > 0 ? 'primary' : 'neutral'}>
          {displayFiles.length} file{displayFiles.length === 1 ? '' : 's'} attached
        </Badge>
      </div>

      {displayFiles.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <FileText
            size={32}
            style={{ margin: '0 auto 0.75rem auto', opacity: 0.5, display: 'block' }}
          />
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            No brief files attached yet
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            This assignment currently does not have any attached instructions, rubrics, or
            starter kits.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {displayFiles.map((file) => (
            <AssignmentBriefRow key={file.id} file={file} contentId={contentId} />
          ))}
        </div>
      )}
    </div>
  );
};

interface LessonPreviewContentProps {
  readonly lesson: EditableLesson;
  readonly contentId: string;
  readonly stagedSasUrl?: string | null | undefined;
  readonly isSasLoading: boolean;
  readonly effectiveQuiz?: QuizDraftInput | null | undefined;
  readonly isQuizLoading?: boolean | undefined;
  readonly quizError?: Error | null | undefined;
}

const LessonPreviewContent = ({
  lesson,
  contentId,
  stagedSasUrl,
  isSasLoading,
  effectiveQuiz,
  isQuizLoading,
  quizError,
}: LessonPreviewContentProps): ReactElement => {
  const { isVideo, isDoc, isQuiz, isAssignment } = resolveLessonKind(lesson.kind);

  if (isAssignment) {
    return <AssignmentLessonPreview lesson={lesson} contentId={contentId} />;
  }

  if (lesson.media?.azureBlobName) {
    const effectiveUrl = lesson.media.previewUrl ?? stagedSasUrl ?? null;
    return (
      <StagedMediaPreview
        media={lesson.media}
        effectiveUrl={effectiveUrl}
        isLoading={isSasLoading}
        isVideo={isVideo}
      />
    );
  }

  if (lesson.mediaAssetId) {
    return (
      <PlaybackMediaViewer
        mediaAssetId={lesson.mediaAssetId}
        externalUrl={lesson.externalUrl}
        kind={getMediaKindString(isVideo, isDoc, lesson.externalUrl ?? lesson.title)}
        title={lesson.title}
      />
    );
  }

  if (isQuiz) {
    return (
      <QuizLessonPreview
        quiz={effectiveQuiz}
        isLoading={isQuizLoading ?? false}
        error={quizError ?? null}
      />
    );
  }

  if (lesson.externalUrl) {
    if (isVideo) {
      return (
        <MediaViewer
          asset={{ kind: 'video', name: lesson.title, url: lesson.externalUrl }}
        />
      );
    }
    if (isDoc) {
      return (
        <MediaViewer
          asset={{
            kind: resolveDocumentMediaKind(lesson.externalUrl),
            name: lesson.title,
            url: lesson.externalUrl,
          }}
        />
      );
    }
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)' }}>
          External Web Resource: <strong>{lesson.externalUrl}</strong>
        </p>
        <Button
          onClick={() => {
            window.open(lesson.externalUrl ?? '', '_blank', 'noreferrer');
          }}
        >
          <ExternalLink size={15} /> Visit Web Resource
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        color: 'var(--color-text-muted)',
      }}
    >
      No media or content source attached to this lesson yet.
    </div>
  );
};

export const LessonPreviewModal = ({
  lesson,
  contentId,
  sectionTitle,
  open,
  onClose,
}: LessonPreviewModalProps): ReactElement | null => {
  const stagedBlobName = lesson?.media?.azureBlobName;
  const { data: stagedSasUrl, isLoading: isSasLoading } = useGetMediaReadSas(
    contentId,
    stagedBlobName,
  );
  const isQuiz = lesson?.kind === LESSON_KIND.quiz;
  const hasDraftQuiz = (lesson?.quiz?.questions.length ?? 0) > 0;
  const {
    data: fetchedQuiz,
    isLoading: isQuizLoading,
    error: quizError,
  } = useGetQuiz(
    isQuiz && Boolean(lesson.quizId) ? (lesson.quizId ?? undefined) : undefined,
    {
      enabled: isQuiz && Boolean(lesson.quizId),
      includeAnswers: !hasDraftQuiz,
    },
  );
  const effectiveQuiz = useMemo(() => {
    if (!lesson) return null;
    if (lesson.quiz) {
      return {
        ...lesson.quiz,
        version: lesson.quiz.version ?? fetchedQuiz?.version,
      };
    }
    return fetchedQuiz ?? null;
  }, [lesson, fetchedQuiz]);

  if (!lesson) return null;

  return (
    <Modal
      open={open}
      size="xl"
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
      title={lesson.title}
      description="Lesson Preview & Content Inspection"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close Preview
        </Button>
      }
    >
      <div className={styles.modalContainer}>
        <InspectorBar
          lesson={lesson}
          sectionTitle={sectionTitle}
          effectiveSasUrl={stagedSasUrl}
          quiz={effectiveQuiz}
        />

        <div className={isQuiz ? styles.quizWrapper : styles.playerWrapper}>
          <LessonPreviewContent
            lesson={lesson}
            contentId={contentId}
            stagedSasUrl={stagedSasUrl}
            isSasLoading={isSasLoading}
            effectiveQuiz={effectiveQuiz}
            isQuizLoading={!hasDraftQuiz && isQuizLoading}
            quizError={quizError ?? null}
          />
        </div>
      </div>
    </Modal>
  );
};
