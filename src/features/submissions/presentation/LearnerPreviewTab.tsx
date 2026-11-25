/* eslint-disable max-lines-per-function, complexity */
import { useState, type ReactElement } from 'react';
import { Sparkles, LayoutGrid, Monitor } from 'lucide-react';
import { Button } from '@shared/ui';
import { useContentCategories } from '@features/content';
import { useDraftEditor } from './use-draft-editor';
import { CatalogCardPreview } from './CatalogCardPreview';
import { LandingPagePreview } from './LandingPagePreview';

export interface LearnerPreviewTabProps {
  readonly authorName?: string | undefined;
}

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return 'Self-paced';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${String(mins)} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0
    ? `${String(hours)} hr ${String(remainingMins)} min`
    : `${String(hours)} hr`;
};

const getDifficultyLabel = (diff: number): string => {
  switch (diff) {
    case 0:
      return 'Beginner';
    case 5:
      return 'Intermediate';
    case 10:
      return 'Advanced';
    default:
      return 'All Levels';
  }
};

export const LearnerPreviewTab = ({
  authorName,
}: LearnerPreviewTabProps): ReactElement => {
  const { contentTypeKey, draftState } = useDraftEditor();
  const { data: categories } = useContentCategories(contentTypeKey);
  const [viewMode, setViewMode] = useState<'both' | 'card' | 'landing'>('both');

  const d = draftState.details;
  const categoryName = categories?.find((c) => c.id === d.categoryId)?.name;
  const difficultyLabel = getDifficultyLabel(d.difficulty);
  const durationText = formatDuration(d.durationSeconds);
  const author = authorName ?? 'Content Author';
  const typeLabel =
    contentTypeKey === 'course'
      ? 'Course'
      : contentTypeKey === 'tutorial'
        ? 'Tutorial'
        : 'Resource';

  const sections = draftState.curriculum?.sections ?? [];
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header Bar with Mode Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <h3
            style={{
              margin: '0 0 0.35rem 0',
              fontSize: '1.25rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={20} style={{ color: 'var(--color-primary)' }} />
            Learner Experience Preview
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Inspect how learners will discover and view this {typeLabel.toLowerCase()}{' '}
            across the catalog and landing page.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            backgroundColor: 'var(--color-surface-hover)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Button
            size="sm"
            variant={viewMode === 'both' ? 'default' : 'ghost'}
            onClick={() => {
              setViewMode('both');
            }}
          >
            Dual View
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            onClick={() => {
              setViewMode('card');
            }}
          >
            <LayoutGrid size={14} style={{ marginRight: '0.25rem' }} /> Catalog Card
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'landing' ? 'default' : 'ghost'}
            onClick={() => {
              setViewMode('landing');
            }}
          >
            <Monitor size={14} style={{ marginRight: '0.25rem' }} /> Landing Page
          </Button>
        </div>
      </div>

      {/* Preview Presentation */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          alignItems: 'flex-start',
        }}
      >
        {(viewMode === 'both' || viewMode === 'card') && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              flex: viewMode === 'both' ? '0 1 380px' : '1 1 380px',
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)',
                minHeight: '2.4em',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              Catalog Card Presentation (Browse & Search)
            </h4>
            <CatalogCardPreview
              title={d.title}
              subtitle={d.subtitle}
              categoryName={categoryName}
              difficultyLabel={difficultyLabel}
              durationText={durationText}
              sectionsCount={sections.length}
              lessonsCount={totalLessons}
              author={author}
              contentType={typeLabel}
            />
          </div>
        )}

        {(viewMode === 'both' || viewMode === 'landing') && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              flex: '1 1 420px',
              minWidth: 0,
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)',
                minHeight: '2.4em',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              Course Landing & Overview Presentation (Learner Portal)
            </h4>
            <LandingPagePreview
              title={d.title}
              subtitle={d.subtitle}
              description={d.description}
              categoryName={categoryName}
              difficultyLabel={difficultyLabel}
              durationText={durationText}
              sections={sections}
              author={author}
              contentType={typeLabel}
              language={d.language}
            />
          </div>
        )}
      </div>
    </div>
  );
};
