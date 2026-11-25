import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sanitizeRichText, cn } from '@shared/utils';
import { Celebration } from '@shared/ui';
import {
  type Resource,
  useMarkResourceComplete,
  useUpdateResource,
  ResourceEditModal,
} from '@features/resources';
import {
  CertificateModal,
  useCertificate,
  useCertificatesModule,
} from '@features/certificates';
import { useMyCapabilities } from '@features/users';
import { useContentCategories } from '@features/content';
import { ContentReviewsPanel } from '@features/course-reviews';
import { ResourceHero, ResourceSidebar } from './ResourceDetailParts';
import { AttachedFilesList } from './ResourceDetailFilesList';
import { LeaveWithoutCompletingModal, ResourceDocumentPanel } from './ResourceWatch';
import styles from './ResourceDetailPage.module.css';

const ResourceBreadcrumb = ({
  title,
  onBackClick,
}: {
  readonly title: string;
  readonly onBackClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}): ReactElement => (
  <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <Link to="/resources" className={styles.breadcrumbLink} onClick={onBackClick}>
      <ArrowLeft size={14} aria-hidden="true" /> Resources
    </Link>
    <span aria-hidden="true">/</span>
    <span className={cn(styles.breadcrumbCurrent, styles.breadcrumbTruncate)}>
      {title}
    </span>
  </nav>
);

export interface ResourceDetailViewProps {
  readonly resource: Resource;
}

/**
 * Premium detailed view for a Resource: hero banner, full overview,
 * an inline document viewer, mark-complete, reviews panel, and specs sidebar.
 */
// eslint-disable-next-line max-lines-per-function
export const ResourceDetailView = ({
  resource,
}: ResourceDetailViewProps): ReactElement => {
  const { can } = useMyCapabilities();
  const canEdit = can('resources', 'edit') && resource.canModify;
  const canViewReviews = can('reviews', 'view');
  const navigate = useNavigate();
  const updateResource = useUpdateResource();
  const categoriesQuery = useContentCategories('resource');
  const categories = categoriesQuery.data ?? [];
  const [editingMetadata, setEditingMetadata] = useState<Resource | null>(null);

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(
    resource.certificateUrl,
  );
  const [certificateId, setCertificateId] = useState<string | null>(
    resource.certificateId ?? null,
  );
  const [viewingCertificateId, setViewingCertificateId] = useState<string | null>(null);
  const { clock } = useCertificatesModule();
  const certificateQuery = useCertificate(viewingCertificateId);
  const markComplete = useMarkResourceComplete();
  const viewerPanelRef = useRef<HTMLDivElement | null>(null);
  const hasInteractedRef = useRef(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const isEffectivelyComplete = resource.isCompleted || certificateUrl !== null;

  useEffect(() => {
    setCertificateUrl(resource.certificateUrl);
    setCertificateId(resource.certificateId ?? null);
  }, [resource.id, resource.certificateUrl, resource.certificateId]);

  // The viewer starts closed on every resource — including navigating between resources —
  // and only opens when the visitor clicks a Preview/Read CTA.
  useEffect(() => {
    hasInteractedRef.current = false;
    setSelectedDocId(null);
  }, [resource.id]);

  useEffect(() => {
    if (selectedDocId !== null && hasInteractedRef.current) {
      viewerPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDocId]);

  const totalFiles = useMemo(
    () => (resource.mediaUrl ? 1 : 0) + resource.attachments.length,
    [resource],
  );

  const handleSelectDocument = (id: string): void => {
    hasInteractedRef.current = true;
    setSelectedDocId(id);
  };

  const handleCloseDocument = (): void => {
    setSelectedDocId(null);
  };

  const handleMarkComplete = (): void => {
    if (resource.isCompleted) return;
    markComplete.mutate(resource.id, {
      onSuccess: (updated) => {
        setCelebrate(true);
        setCertificateUrl(updated.certificateUrl);
        setCertificateId(updated.certificateId ?? null);
      },
    });
  };

  const handleViewCertificate = (): void => {
    if (certificateId !== null) setViewingCertificateId(certificateId);
  };

  const handleCloseCertificate = (): void => {
    setViewingCertificateId(null);
  };

  const handleEditFiles = (): void => {
    navigate(`/submissions/${resource.id}/edit?tab=resource-files`);
  };

  const handleOpenEditDetails = (): void => {
    setEditingMetadata(resource);
  };

  const handleBackClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (isEffectivelyComplete || selectedDocId === null) return;
    event.preventDefault();
    setShowLeaveConfirm(true);
  };

  const handleMarkCompleteAndLeave = (): void => {
    markComplete.mutate(resource.id, {
      onSuccess: (updated) => {
        setCertificateUrl(updated.certificateUrl);
        setCertificateId(updated.certificateId ?? null);
        setShowLeaveConfirm(false);
        navigate('/resources');
      },
    });
  };

  const handleLeaveAnyway = (): void => {
    setShowLeaveConfirm(false);
    navigate('/resources');
  };

  const handleStayOnPage = (): void => {
    setShowLeaveConfirm(false);
  };

  return (
    <>
      <Celebration show={celebrate} />
      <ResourceBreadcrumb title={resource.title} onBackClick={handleBackClick} />
      <div className={styles.layout}>
        <main className={styles.main}>
          <ResourceHero
            resource={resource}
            totalFiles={totalFiles}
            hasCertificate={certificateId !== null}
            isCertificateLoading={
              viewingCertificateId !== null && certificateQuery.isFetching
            }
            onSelectDocument={handleSelectDocument}
            onViewCertificate={handleViewCertificate}
          />

          {resource.description ? (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>About this resource</h2>
              <div
                className={styles.descriptionText}
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichText(resource.description),
                }}
              />
            </section>
          ) : null}

          <div ref={viewerPanelRef}>
            <ResourceDocumentPanel
              resource={resource}
              selectedDocId={selectedDocId}
              onSelectDocument={handleSelectDocument}
              onClose={handleCloseDocument}
              completion={{
                certificateUrl,
                isCompleted: resource.isCompleted,
                isCompleting: markComplete.isPending,
                onMarkComplete: handleMarkComplete,
              }}
            />
          </div>

          <AttachedFilesList
            resource={resource}
            onSelectDocument={handleSelectDocument}
            activeDocId={selectedDocId}
            canEdit={canEdit}
            onEdit={handleEditFiles}
          />

          {canViewReviews ? (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Ratings & Reviews</h2>
              <ContentReviewsPanel
                contentId={resource.id}
                contentName={resource.title}
                canReview
              />
            </section>
          ) : null}
        </main>

        <ResourceSidebar
          resource={resource}
          totalFiles={totalFiles}
          canEdit={canEdit}
          onEditDetails={handleOpenEditDetails}
        />
      </div>

      <ResourceEditModal
        editing={editingMetadata}
        categories={categories}
        update={updateResource}
        onClose={() => {
          setEditingMetadata(null);
        }}
      />

      <LeaveWithoutCompletingModal
        open={showLeaveConfirm}
        resource={resource}
        isCompleting={markComplete.isPending}
        onMarkComplete={handleMarkCompleteAndLeave}
        onLeaveAnyway={handleLeaveAnyway}
        onStay={handleStayOnPage}
      />

      <CertificateModal
        certificate={certificateQuery.data ?? null}
        now={clock.now()}
        onClose={handleCloseCertificate}
      />
    </>
  );
};
