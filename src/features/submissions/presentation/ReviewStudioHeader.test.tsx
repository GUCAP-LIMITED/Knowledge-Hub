import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ContentDetail } from '@features/content';
import type * as PermissionsFeature from '@features/permissions';
import { ReviewStudioHeader } from './ReviewStudioHeader';

const { useMyPermissions } = vi.hoisted(() => ({
  useMyPermissions: vi.fn(),
}));

vi.mock('@features/permissions', async (importOriginal) => {
  const actual = await importOriginal<typeof PermissionsFeature>();
  return { ...actual, useMyPermissions };
});

vi.mock('./use-draft-editor', () => ({
  useDraftEditor: () => ({
    contentTypeKey: 'course',
    draftState: {
      details: {
        title: 'Draft Title',
      },
    },
  }),
}));

const mockContent: ContentDetail = {
  id: 'c-1',
  type: 0,
  title: 'Test Course',
  subtitle: 'Subtitle',
  description: 'Desc',
  categoryId: 'cat-1',
  topic: 'Topic',
  difficulty: 0,
  language: 'English',
  durationSeconds: 120,
  visibility: 0,
  branchIds: [],
  teamIds: null,
  quizId: null,
  isQuizRequired: false,
  thumbnailAlt: null,
  keywords: null,
  slug: 'test-course',
  status: 5,
  ownerId: 'owner-1',
  ownerName: 'Alice',
  submittedById: 'sub-1',
  submittedByName: 'Alice',
  submittedAt: '2026-10-01T00:00:00Z',
  reviewNote: null,
  thumbnailUrl: null,
  canModify: true,
  media: [],
  sections: [],
  tags: [],
};

describe('ReviewStudioHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMyPermissions.mockReturnValue({
      data: {
        'Approvals.Approve': true,
        'Approvals.Reject': true,
        'Approvals.Publish': true,
      },
      isPending: false,
    });
  });

  it('renders Approve & Publish button with Rocket icon for unapproved new submission', () => {
    render(
      <MemoryRouter>
        <ReviewStudioHeader
          content={mockContent}
          status={5}
          isRevision={false}
          isReviewable={true}
          isNewSubmission={true}
          isApproving={false}
          isPublishing={false}
          isFlagging={false}
          isRejecting={false}
          onApprove={vi.fn()}
          onApproveAndPublish={vi.fn()}
          onPublish={vi.fn()}
          onReject={vi.fn()}
        />
      </MemoryRouter>,
    );

    const approveAndPublishBtn = screen.getByRole('button', {
      name: /Approve & Publish/i,
    });
    expect(approveAndPublishBtn).toBeInTheDocument();

    const svg = approveAndPublishBtn.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-rocket');
  });

  it('renders Publish Now button with Rocket icon when status is approved (15)', () => {
    render(
      <MemoryRouter>
        <ReviewStudioHeader
          content={{ ...mockContent, status: 15 }}
          status={15}
          isRevision={false}
          isReviewable={true}
          isNewSubmission={true}
          isApproving={false}
          isPublishing={false}
          isFlagging={false}
          isRejecting={false}
          onApprove={vi.fn()}
          onPublish={vi.fn()}
          onReject={vi.fn()}
        />
      </MemoryRouter>,
    );

    const publishNowBtn = screen.getByRole('button', {
      name: /Publish Now/i,
    });
    expect(publishNowBtn).toBeInTheDocument();

    const svg = publishNowBtn.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-rocket');
  });

  it('renders Approve & Publish button with Rocket icon for revisions', () => {
    render(
      <MemoryRouter>
        <ReviewStudioHeader
          content={mockContent}
          status={5}
          isRevision={true}
          isReviewable={true}
          isNewSubmission={false}
          isApproving={false}
          isPublishing={false}
          isFlagging={false}
          isRejecting={false}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />
      </MemoryRouter>,
    );

    const revisionPublishBtn = screen.getByRole('button', {
      name: /Approve & Publish/i,
    });
    expect(revisionPublishBtn).toBeInTheDocument();

    const svg = revisionPublishBtn.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-rocket');
  });

  it('renders Approve button with CheckCircle2 icon', () => {
    render(
      <MemoryRouter>
        <ReviewStudioHeader
          content={mockContent}
          status={5}
          isRevision={false}
          isReviewable={true}
          isNewSubmission={true}
          isApproving={false}
          isPublishing={false}
          isFlagging={false}
          isRejecting={false}
          onApprove={vi.fn()}
          onApproveAndPublish={vi.fn()}
          onPublish={vi.fn()}
          onReject={vi.fn()}
        />
      </MemoryRouter>,
    );

    const approveBtn = screen.getByRole('button', { name: /^Approve$/i });
    expect(approveBtn).toBeInTheDocument();

    const svg = approveBtn.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-circle-check');
  });

  it('renders "Approved by <reviewedByName>" when reviewNote is "Approved by reviewer" and reviewedByName is provided', () => {
    render(
      <MemoryRouter>
        <ReviewStudioHeader
          content={{ ...mockContent, reviewedByName: 'Andreea Cimpoi' }}
          status={15}
          reviewNote="Approved by reviewer"
          isRevision={false}
          isReviewable={false}
          isNewSubmission={true}
          isApproving={false}
          isPublishing={false}
          isFlagging={false}
          isRejecting={false}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Previous Feedback:')).toBeInTheDocument();
    expect(screen.getByText('Approved by Andreea Cimpoi')).toBeInTheDocument();
  });

  it('renders "Approved by <reviewedByName>" when reviewNote is null but reviewedByName exists', () => {
    render(
      <MemoryRouter>
        <ReviewStudioHeader
          content={{ ...mockContent, reviewedByName: 'John Doe' }}
          status={15}
          reviewNote={null}
          isRevision={false}
          isReviewable={false}
          isNewSubmission={true}
          isApproving={false}
          isPublishing={false}
          isFlagging={false}
          isRejecting={false}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Previous Feedback:')).toBeInTheDocument();
    expect(screen.getByText('Approved by John Doe')).toBeInTheDocument();
  });

  it('renders custom feedback with approver attribution when both note and reviewedByName exist', () => {
    render(
      <MemoryRouter>
        <ReviewStudioHeader
          content={{ ...mockContent, reviewedByName: 'Alice Smith' }}
          status={15}
          reviewNote="Great work on curriculum"
          isRevision={false}
          isReviewable={false}
          isNewSubmission={true}
          isApproving={false}
          isPublishing={false}
          isFlagging={false}
          isRejecting={false}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Previous Feedback:')).toBeInTheDocument();
    expect(
      screen.getByText('Great work on curriculum (by Alice Smith)'),
    ).toBeInTheDocument();
  });

  describe('permission gating', () => {
    it('renders "Move to In Review" only when Approvals.Approve is granted', () => {
      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Approve': true },
        isPending: false,
      });

      const { rerender } = render(
        <MemoryRouter>
          <ReviewStudioHeader
            content={mockContent}
            status={5}
            isRevision={false}
            isReviewable={true}
            isNewSubmission={true}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onFlag={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole('button', { name: /Move to In Review/i }),
      ).toBeInTheDocument();

      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Approve': false },
        isPending: false,
      });

      rerender(
        <MemoryRouter>
          <ReviewStudioHeader
            content={mockContent}
            status={5}
            isRevision={false}
            isReviewable={true}
            isNewSubmission={true}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onFlag={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(
        screen.queryByRole('button', { name: /Move to In Review/i }),
      ).not.toBeInTheDocument();
    });

    it('renders "Reject" only when Approvals.Reject is granted', () => {
      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Reject': false },
        isPending: false,
      });

      const { rerender } = render(
        <MemoryRouter>
          <ReviewStudioHeader
            content={mockContent}
            status={5}
            isRevision={false}
            isReviewable={true}
            isNewSubmission={true}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(screen.queryByRole('button', { name: /Reject/i })).not.toBeInTheDocument();

      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Reject': true },
        isPending: false,
      });

      rerender(
        <MemoryRouter>
          <ReviewStudioHeader
            content={mockContent}
            status={5}
            isRevision={false}
            isReviewable={true}
            isNewSubmission={true}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
    });

    it('renders "Approve" only when Approvals.Approve is granted', () => {
      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Approve': false },
        isPending: false,
      });

      const { rerender } = render(
        <MemoryRouter>
          <ReviewStudioHeader
            content={mockContent}
            status={5}
            isRevision={false}
            isReviewable={true}
            isNewSubmission={true}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(
        screen.queryByRole('button', { name: /^Approve$/i }),
      ).not.toBeInTheDocument();

      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Approve': true },
        isPending: false,
      });

      rerender(
        <MemoryRouter>
          <ReviewStudioHeader
            content={mockContent}
            status={5}
            isRevision={false}
            isReviewable={true}
            isNewSubmission={true}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(screen.getByRole('button', { name: /^Approve$/i })).toBeInTheDocument();
    });

    it('renders "Approve & Publish" for new submission only when both Approvals.Approve and Approvals.Publish are granted', () => {
      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Approve': true, 'Approvals.Publish': false },
        isPending: false,
      });

      const { rerender } = render(
        <MemoryRouter>
          <ReviewStudioHeader
            content={mockContent}
            status={5}
            isRevision={false}
            isReviewable={true}
            isNewSubmission={true}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onApproveAndPublish={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(screen.getByRole('button', { name: /^Approve$/i })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Approve & Publish/i }),
      ).not.toBeInTheDocument();

      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Approve': true, 'Approvals.Publish': true },
        isPending: false,
      });

      rerender(
        <MemoryRouter>
          <ReviewStudioHeader
            content={mockContent}
            status={5}
            isRevision={false}
            isReviewable={true}
            isNewSubmission={true}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onApproveAndPublish={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole('button', { name: /Approve & Publish/i }),
      ).toBeInTheDocument();
    });

    it('renders "Publish Now" on status 15 only when Approvals.Publish is granted', () => {
      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Publish': false },
        isPending: false,
      });

      const { rerender } = render(
        <MemoryRouter>
          <ReviewStudioHeader
            content={{ ...mockContent, status: 15 }}
            status={15}
            isRevision={false}
            isReviewable={true}
            isNewSubmission={true}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onPublish={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(
        screen.queryByRole('button', { name: /Publish Now/i }),
      ).not.toBeInTheDocument();

      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Publish': true },
        isPending: false,
      });

      rerender(
        <MemoryRouter>
          <ReviewStudioHeader
            content={{ ...mockContent, status: 15 }}
            status={15}
            isRevision={false}
            isReviewable={true}
            isNewSubmission={true}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onPublish={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(screen.getByRole('button', { name: /Publish Now/i })).toBeInTheDocument();
    });

    it('renders "Approve & Publish" for revisions only when both Approvals.Approve and Approvals.Publish are granted', () => {
      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Approve': true, 'Approvals.Publish': false },
        isPending: false,
      });

      const { rerender } = render(
        <MemoryRouter>
          <ReviewStudioHeader
            content={mockContent}
            status={5}
            isRevision={true}
            isReviewable={true}
            isNewSubmission={false}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(
        screen.queryByRole('button', { name: /Approve & Publish/i }),
      ).not.toBeInTheDocument();

      useMyPermissions.mockReturnValue({
        data: { 'Approvals.Approve': true, 'Approvals.Publish': true },
        isPending: false,
      });

      rerender(
        <MemoryRouter>
          <ReviewStudioHeader
            content={mockContent}
            status={5}
            isRevision={true}
            isReviewable={true}
            isNewSubmission={false}
            isApproving={false}
            isPublishing={false}
            isFlagging={false}
            isRejecting={false}
            onApprove={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole('button', { name: /Approve & Publish/i }),
      ).toBeInTheDocument();
    });
  });
});
