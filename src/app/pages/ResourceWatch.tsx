import { useMemo, type ReactElement } from 'react';
import { BookOpen, Check, X } from 'lucide-react';
import { Badge, Button, IconButton, Modal, Tooltip } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Resource } from '@features/resources';
import { DocumentViewerItem } from '@features/resources/presentation/DocumentViewerItem';
import {
  buildDocuments,
  type DocumentItem,
} from '@features/resources/presentation/resource-format-helper';
import styles from './ResourceDetailPage.module.css';

const FileSwitcher = ({
  documents,
  activeDocId,
  onSelectDocument,
}: {
  readonly documents: readonly DocumentItem[];
  readonly activeDocId: string;
  readonly onSelectDocument: (id: string) => void;
}): ReactElement | null => {
  if (documents.length <= 1) return null;

  return (
    <div className={styles.fileSwitcher} role="tablist" aria-label="Attached files">
      <span className={styles.switcherLabel}>Files ({documents.length}):</span>
      {documents.map((doc) => {
        const isSelected = activeDocId === doc.id;
        return (
          <button
            key={doc.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={cn(styles.fileChip, isSelected && styles.fileChipActive)}
            onClick={() => {
              onSelectDocument(doc.id);
            }}
            title={doc.name}
          >
            {doc.isPrimary ? <span className={styles.primaryTag}>Primary</span> : null}
            {doc.name}
          </button>
        );
      })}
    </div>
  );
};

export const ResourceMarkCompleteButton = ({
  isCompleting,
  onMarkComplete,
}: {
  readonly isCompleting: boolean;
  readonly onMarkComplete: () => void;
}): ReactElement => (
  <div className={styles.markCompleteRow}>
    <Button onClick={onMarkComplete} isLoading={isCompleting}>
      <Check size={16} aria-hidden="true" />
      {isCompleting ? 'Marking Complete...' : 'Mark as Complete'}
    </Button>
  </div>
);

export interface ResourceCompletionState {
  readonly certificateUrl: string | null;
  readonly isCompleted: boolean;
  readonly isCompleting: boolean;
  readonly onMarkComplete: () => void;
}

/** The Mark-Complete CTA, shown inside the preview box while the resource is unfinished — once
 * completed, the certificate lives in the page header instead, so there is nothing left to show
 * here. */
const CompletionRow = ({
  completion,
}: {
  readonly completion: ResourceCompletionState;
}): ReactElement | null => {
  if (completion.certificateUrl !== null || completion.isCompleted) {
    return null;
  }
  return (
    <ResourceMarkCompleteButton
      isCompleting={completion.isCompleting}
      onMarkComplete={completion.onMarkComplete}
    />
  );
};

export interface LeaveWithoutCompletingModalProps {
  readonly open: boolean;
  readonly resource: Resource;
  readonly isCompleting: boolean;
  readonly onMarkComplete: () => void;
  readonly onLeaveAnyway: () => void;
  readonly onStay: () => void;
}

/** Guards the "back to resources" exit: nudges an unfinished visitor to complete the resource
 * before leaving, but never blocks them from leaving anyway. */
export const LeaveWithoutCompletingModal = ({
  open,
  resource,
  isCompleting,
  onMarkComplete,
  onLeaveAnyway,
  onStay,
}: LeaveWithoutCompletingModalProps): ReactElement => (
  <Modal
    open={open}
    onOpenChange={(next) => {
      if (!next) onStay();
    }}
    title="Finish this resource?"
    footer={
      <div className={styles.leaveModalActions}>
        <Button variant="ghost" onClick={onLeaveAnyway}>
          Close anyway
        </Button>
        <Button onClick={onMarkComplete} isLoading={isCompleting}>
          <Check size={16} aria-hidden="true" />
          Mark as Complete
        </Button>
      </div>
    }
  >
    <div className={styles.leaveModalBody}>
      <span className={styles.leaveModalIcon}>
        <BookOpen size={26} aria-hidden="true" />
      </span>
      <div className={styles.leaveModalResource}>
        <p className={styles.leaveModalResourceTitle}>{resource.title}</p>
        <div className={styles.leaveModalResourceMeta}>
          <Badge tone="info">{resource.type}</Badge>
          <span>{resource.category}</span>
        </div>
      </div>
      <p className={styles.leaveModalText}>
        You haven&apos;t marked this complete yet. Finish it now to track your progress,
        or come back to it later.
      </p>
    </div>
  </Modal>
);

export interface ResourceDocumentPanelProps {
  readonly resource: Resource;
  readonly selectedDocId: string | null;
  readonly onSelectDocument: (id: string) => void;
  readonly onClose: () => void;
  readonly completion: ResourceCompletionState;
}

/**
 * Inline document/video viewer for a resource — the primary file plus any attachments.
 * Stays hidden until a document is picked (hero "Read & Preview" CTA or a file-list "Preview"
 * button) and can be dismissed again via the close button, which frees the space without a page
 * navigation. The completion status/Mark-Complete CTA lives inside this same box rather than as
 * a separate section, so it sits right alongside whatever the visitor just previewed.
 */
export const ResourceDocumentPanel = ({
  resource,
  selectedDocId,
  onSelectDocument,
  onClose,
  completion,
}: ResourceDocumentPanelProps): ReactElement | null => {
  const documents = useMemo(() => buildDocuments(resource), [resource]);

  if (documents.length === 0) {
    return (
      <section className={styles.card}>
        <p className={styles.descriptionText}>No document attached to this resource.</p>
      </section>
    );
  }

  if (selectedDocId === null) {
    return null;
  }

  const currentDocIndex = documents.findIndex((doc) => doc.id === selectedDocId);
  const activeDocument = currentDocIndex >= 0 ? documents[currentDocIndex] : null;

  if (!activeDocument) {
    return null;
  }

  return (
    <section className={styles.card}>
      <div className={styles.viewerHeader}>
        <FileSwitcher
          documents={documents}
          activeDocId={activeDocument.id}
          onSelectDocument={onSelectDocument}
        />
        <Tooltip label="Close preview">
          <IconButton
            label="Close preview"
            onClick={onClose}
            className={styles.viewerCloseBtn}
          >
            <X size={14} aria-hidden="true" />
          </IconButton>
        </Tooltip>
      </div>
      <div className={styles.viewerWrapper}>
        <DocumentViewerItem
          document={activeDocument}
          index={currentDocIndex}
          total={documents.length}
        />
      </div>
      <CompletionRow completion={completion} />
    </section>
  );
};
