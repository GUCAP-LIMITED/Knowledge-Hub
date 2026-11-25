/* eslint-disable max-lines-per-function */
import { useState, type ReactElement } from 'react';
import { Alert, Select, useDeleteConfirm, type SelectOption } from '@shared/ui';
import { useAuth } from '@features/auth';
import { X, Sparkles } from 'lucide-react';
import type { SelectableContentItem } from '../domain';
import { WriteReviewForm, type ContentTypeFilter } from './WriteReviewForm';
import { ReviewsList } from './ReviewsList';
import { ReviewsPagination } from './ReviewsPagination';
import {
  useReviews,
  useMarkReviewHelpful,
  useSubmitReview,
  useDeleteReview,
} from './use-course-reviews';
import styles from './ReviewsPage.module.css';

interface ReviewFormValues {
  courseId: string;
  rating: number;
  feedback: string;
}

const PAGE_SIZE = 10;

const SORT_OPTIONS: readonly SelectOption[] = [
  { value: 'CreationTime desc', label: 'Most Recent' },
  { value: 'Rating desc', label: 'Highest Rated' },
  { value: 'Rating asc', label: 'Lowest Rated' },
  { value: 'HelpfulVotes desc', label: 'Most Helpful' },
];

const ReviewsHeader = (): ReactElement => (
  <header className={styles.header}>
    <h1 className={styles.title}>Reviews</h1>
    <p className={styles.subtitle}>
      Share your feedback and see what your colleagues think across courses, tutorials,
      and resources.
    </p>
  </header>
);

const getContentTypeName = (type: ContentTypeFilter): string => {
  switch (type) {
    case '0':
      return 'Courses';
    case '5':
      return 'Tutorials';
    case '10':
      return 'Resources';
    case 'all':
      return 'All Content';
  }
};

const ReviewsFeedHeader = ({
  totalCount,
  sorting,
  onSortChange,
}: {
  readonly totalCount: number;
  readonly sorting: string;
  readonly onSortChange: (val: string) => void;
}): ReactElement => (
  <div className={styles.feedHeader}>
    <div className={styles.feedTitleSection}>
      <h2 className={styles.feedTitle}>Community Reviews</h2>
      <span className={styles.feedCount}>
        ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
      </span>
    </div>

    <div className={styles.feedControls}>
      <div className={styles.sortSelect}>
        <Select
          label="Sort by"
          hideLabel
          value={sorting}
          onChange={onSortChange}
          options={SORT_OPTIONS}
        />
      </div>
    </div>
  </div>
);

const ReviewsFilterChipBar = ({
  contentType,
  selectedItemTitle,
  hasItemFilter,
  onClearItem,
}: {
  readonly contentType: ContentTypeFilter;
  readonly selectedItemTitle?: string | undefined;
  readonly hasItemFilter: boolean;
  readonly onClearItem: () => void;
}): ReactElement | null => {
  const hasTypeFilter = contentType !== 'all';
  if (!hasItemFilter && !hasTypeFilter) {
    return null;
  }

  return (
    <div className={styles.filterChipBar}>
      <span className={styles.filterChipLabel}>Active filters:</span>
      {hasTypeFilter ? (
        <span className={styles.filterChip}>
          <span>Type: {getContentTypeName(contentType)}</span>
        </span>
      ) : null}
      {hasItemFilter ? (
        <span className={styles.filterChip}>
          <Sparkles size={13} aria-hidden="true" />
          <span className={styles.chipTitle}>
            {selectedItemTitle ? `Item: "${selectedItemTitle}"` : 'Specific item'}
          </span>
          <button
            type="button"
            className={styles.chipRemoveBtn}
            onClick={onClearItem}
            title="Remove item filter"
            aria-label="Remove item filter"
          >
            <X size={13} aria-hidden="true" />
          </button>
        </span>
      ) : null}
    </div>
  );
};

/** Learner-facing reviews: write/edit your own and browse reviews with searchable combobox. */
export const ReviewsPage = (): ReactElement => {
  const { user } = useAuth();
  const [contentType, setContentType] = useState<ContentTypeFilter>('all');
  const [contentItemId, setContentItemId] = useState<string | undefined>(undefined);
  const [selectedItemTitle, setSelectedItemTitle] = useState<string | undefined>(
    undefined,
  );
  const [sorting, setSorting] = useState<string>('CreationTime desc');
  const [page, setPage] = useState<number>(1);

  const contentTypeNum = contentType === 'all' ? undefined : Number(contentType);
  const reviewsQuery = useReviews({
    contentType: contentTypeNum,
    contentItemId,
    sorting,
    skipCount: (page - 1) * PAGE_SIZE,
    maxResultCount: PAGE_SIZE,
  });

  const submit = useSubmitReview();
  const helpful = useMarkReviewHelpful();
  const del = useDeleteReview();

  const reviews = reviewsQuery.data?.items ?? [];
  const totalCount = reviewsQuery.data?.totalCount ?? 0;

  const deleteConfirm = useDeleteConfirm(
    reviews.map((r) => ({
      id: r.id,
      title: r.feedback ? `"${r.feedback.slice(0, 40)}..."` : `${r.userName}'s review`,
    })),
    'review',
    (id) => {
      del.mutate(id);
    },
    del.isPending,
  );

  const handleContentTypeChange = (type: ContentTypeFilter): void => {
    setContentType(type);
    setContentItemId(undefined);
    setSelectedItemTitle(undefined);
    setPage(1);
  };

  const handleContentItemChange = (
    id: string | undefined,
    item?: SelectableContentItem,
  ): void => {
    setContentItemId(id);
    setSelectedItemTitle(item?.title);
    setPage(1);
  };

  const handleClearItem = (): void => {
    setContentItemId(undefined);
    setSelectedItemTitle(undefined);
    setPage(1);
  };

  const handleSubmit = (values: ReviewFormValues): void => {
    submit.mutate({
      contentId: values.courseId,
      contentName: selectedItemTitle ?? values.courseId,
      userId: user?.id ?? 'anonymous',
      userName: user?.fullName ?? 'Anonymous',
      userRole: user?.userType ?? 'Learner',
      rating: values.rating,
      feedback: values.feedback,
    });
  };

  return (
    <section className={styles.screen}>
      <ReviewsHeader />

      <WriteReviewForm
        isSubmitting={submit.isPending}
        onSubmit={handleSubmit}
        contentType={contentType}
        contentItemId={contentItemId}
        selectedItemTitle={selectedItemTitle}
        onContentTypeChange={handleContentTypeChange}
        onContentItemChange={handleContentItemChange}
      />

      {submit.isError ? (
        <Alert tone="error" title="Could not submit your review">
          {submit.error.message}
        </Alert>
      ) : null}

      <ReviewsFeedHeader
        totalCount={totalCount}
        sorting={sorting}
        onSortChange={(val) => {
          setSorting(val);
          setPage(1);
        }}
      />

      <ReviewsFilterChipBar
        contentType={contentType}
        selectedItemTitle={selectedItemTitle}
        hasItemFilter={Boolean(contentItemId)}
        onClearItem={handleClearItem}
      />

      <ReviewsList
        query={reviewsQuery}
        currentUserId={user?.id}
        canVoteHelpful={user !== null}
        onHelpful={(id, isHelpful) => {
          helpful.mutate({ id, isHelpful });
        }}
        helpfulBusy={helpful.isPending}
        onDelete={deleteConfirm.request}
        deleteBusy={del.isPending}
      />

      <ReviewsPagination
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
        onPageChange={setPage}
        disabled={reviewsQuery.isLoading}
      />

      {deleteConfirm.dialog}
    </section>
  );
};
