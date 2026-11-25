import { useRef, useState, type ReactElement } from 'react';
import { Alert, Button, Modal, Spinner, Tabs, TabsPanel, useToast } from '@shared/ui';
import {
  useCertificateDesign,
  useCertificateTemplateStore,
  type CertificateKind,
} from '../store/certificate-template-store';
import { defaultCertificateBackground } from '../domain';
import { SAMPLE_ARTWORK_DATA } from './certificate-artwork-data';
import { CertificateArtwork } from './CertificateArtwork';
import { CertificateBackgroundField } from './CertificateBackgroundField';
import {
  CertificateEditorCanvas,
  type CertificateSelectedElement,
} from './CertificateEditorCanvas';
import { CertificateElementStylePanel } from './CertificateElementStylePanel';
import { CertificateHtmlSourceEditor } from './CertificateHtmlSourceEditor';
import { useCertificateHtmlSource } from './use-certificate-html-source';
import { useClickOutside } from './use-click-outside';
import { useHydrateCertificateDesign } from './use-hydrate-certificate-design';
import { useUpsertCertificateTemplate } from './use-upsert-certificate-template';
import styles from './CertificateTemplatesManager.module.css';

const KIND_TABS = [
  { value: 'course', label: 'Course' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'resource', label: 'Resource' },
] as const;

const MODE_TABS = [
  { value: 'visual', label: 'Visual editor' },
  { value: 'html', label: 'HTML source' },
] as const;

/** A custom (non-shipped) background is in place — the only case "remove" has an effect. */
const hasCustomBackground = (design: ReturnType<typeof useCertificateDesign>): boolean =>
  design.backgroundImage !== undefined &&
  design.backgroundImage !== defaultCertificateBackground(design.kind);

interface CertificateDesignPanelProps {
  readonly kind: CertificateKind;
}

interface CertificateActionToolbarProps {
  readonly canRemoveBackground: boolean;
  readonly onBackgroundChange: (dataUrl: string) => void;
  readonly onBackgroundRemove: () => void;
  readonly onPreview: () => void;
  readonly onSave: () => void;
  readonly isSaving: boolean;
}

/** Document-level actions (background/preview/save) — split out so the panel's main component
 * stays within the file's function-size limit. */
const CertificateActionToolbar = ({
  canRemoveBackground,
  onBackgroundChange,
  onBackgroundRemove,
  onPreview,
  onSave,
  isSaving,
}: CertificateActionToolbarProps): ReactElement => (
  <div className={styles.toolbar}>
    <CertificateBackgroundField
      canRemove={canRemoveBackground}
      onChange={onBackgroundChange}
      onRemove={onBackgroundRemove}
    />
    <Button variant="outline" onClick={onPreview}>
      Full preview
    </Button>
    <Button variant="default" onClick={onSave} isLoading={isSaving}>
      Save template
    </Button>
  </div>
);

interface CertificateDesignEditorProps {
  readonly kind: CertificateKind;
  readonly design: ReturnType<typeof useCertificateDesign>;
  readonly selected: CertificateSelectedElement | null;
  readonly onSelect: (selected: CertificateSelectedElement | null) => void;
  readonly htmlSource: ReturnType<typeof useCertificateHtmlSource>;
}

/** The visual/HTML mode tabs — split out so the panel's main component stays within the file's
 * function-size limit. */
const CertificateDesignEditor = ({
  kind,
  design,
  selected,
  onSelect,
  htmlSource,
}: CertificateDesignEditorProps): ReactElement => (
  <Tabs
    tabs={MODE_TABS}
    value={htmlSource.mode}
    onValueChange={(value) => {
      htmlSource.setMode(value as 'visual' | 'html');
    }}
  >
    <TabsPanel value="visual">
      {selected !== null ? (
        <CertificateElementStylePanel kind={kind} design={design} selected={selected} />
      ) : null}

      <span className={styles.canvasHint}>
        Click an element to select it, drag it to reposition, drag its handle to resize —
        double-click heading, kicker, or body copy to type directly on the certificate.
      </span>
      <CertificateEditorCanvas
        kind={kind}
        design={design}
        selected={selected}
        onSelect={onSelect}
      />
    </TabsPanel>
    <TabsPanel value="html">
      <CertificateHtmlSourceEditor
        html={htmlSource.html}
        onChange={htmlSource.onHtmlChange}
        onApplyToVisual={htmlSource.applyToVisual}
        applyFailed={htmlSource.applyFailed}
      />
    </TabsPanel>
  </Tabs>
);

interface CertificateLoadStatusProps extends ReturnType<
  typeof useHydrateCertificateDesign
> {
  /** Suppresses the "no previous template" notice once a save has just created one — the query
   * itself won't reflect that until a refetch, which correctness-wise it deliberately never does. */
  readonly justSaved: boolean;
}

/** Loading spinner, load-error alert, "nothing saved yet", or a one-time legacy-import notice —
 * whichever applies. */
const CertificateLoadStatus = ({
  isLoading,
  isError,
  hasNoSavedTemplate,
  importedFormat,
  justSaved,
}: CertificateLoadStatusProps): ReactElement | null => {
  if (isLoading) {
    return <Spinner label="Loading the saved certificate template…" />;
  }
  if (isError) {
    return <Alert tone="error">Could not load the existing certificate template.</Alert>;
  }
  if (hasNoSavedTemplate && !justSaved) {
    return (
      <Alert tone="info" title="No previous template">
        This content kind has no saved certificate yet — build one below, then save it.
      </Alert>
    );
  }
  if (importedFormat === 'legacy') {
    return (
      <Alert tone="info" title="Imported your previous certificate">
        The heading, kicker, body copy, and background image (if one was set) were carried
        over. The old format never stored element positions, so reposition the name and QR
        code to match before saving.
      </Alert>
    );
  }
  return null;
};

/** Live drag-and-drop editor for a single content kind's certificate design. */
const CertificateDesignPanel = ({ kind }: CertificateDesignPanelProps): ReactElement => {
  const design = useCertificateDesign(kind);
  const updateBackgroundImage = useCertificateTemplateStore(
    (state) => state.updateBackgroundImage,
  );
  const removeBackgroundImage = useCertificateTemplateStore(
    (state) => state.removeBackgroundImage,
  );
  const markBackgroundSaved = useCertificateTemplateStore(
    (state) => state.markBackgroundSaved,
  );
  const toast = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selected, setSelected] = useState<CertificateSelectedElement | null>(null);
  const upsertTemplate = useUpsertCertificateTemplate();
  const loadStatus = useHydrateCertificateDesign(kind);
  const htmlSource = useCertificateHtmlSource(kind, design);
  const editorRef = useRef<HTMLDivElement>(null);
  useClickOutside(
    editorRef,
    () => {
      setSelected(null);
    },
    selected !== null,
  );

  const onSave = (): void => {
    upsertTemplate.mutate(
      { kind, html: htmlSource.htmlToSave },
      {
        onSuccess: () => {
          markBackgroundSaved(kind);
          toast.success('Certificate template saved.');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <div className={styles.canvasColumn} ref={editorRef}>
      <CertificateLoadStatus {...loadStatus} justSaved={upsertTemplate.isSuccess} />
      <CertificateActionToolbar
        canRemoveBackground={hasCustomBackground(design)}
        onBackgroundChange={(dataUrl) => {
          updateBackgroundImage(kind, dataUrl);
        }}
        onBackgroundRemove={() => {
          removeBackgroundImage(kind);
        }}
        onPreview={() => {
          setPreviewOpen(true);
        }}
        onSave={onSave}
        isSaving={upsertTemplate.isPending}
      />

      <CertificateDesignEditor
        kind={kind}
        design={design}
        selected={selected}
        onSelect={setSelected}
        htmlSource={htmlSource}
      />

      <Modal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title="Certificate preview"
        size="xl"
      >
        <CertificateArtwork
          kind={kind}
          design={design}
          data={SAMPLE_ARTWORK_DATA[kind]}
        />
      </Modal>
    </div>
  );
};

/** Admin editor for the three certificate designs (course/tutorial/resource), shown in Settings. */
export const CertificateTemplatesManager = (): ReactElement => {
  const [activeKind, setActiveKind] = useState<CertificateKind>('course');

  return (
    <div className={styles.manager}>
      <p className={styles.lead}>
        Each content kind starts from the shipped certificate artwork — upload your own to
        replace it. Position the heading, kicker, body copy, recipient name, and QR code
        on top of it. Body copy can include
        <code>{'{{courseName}}'}</code> wherever you want the course name to appear.
        Changes apply the next time a certificate is issued for that kind.
      </p>
      <Tabs
        tabs={KIND_TABS}
        value={activeKind}
        onValueChange={(value) => {
          setActiveKind(value as CertificateKind);
        }}
      >
        <TabsPanel value="course">
          <CertificateDesignPanel kind="course" />
        </TabsPanel>
        <TabsPanel value="tutorial">
          <CertificateDesignPanel kind="tutorial" />
        </TabsPanel>
        <TabsPanel value="resource">
          <CertificateDesignPanel kind="resource" />
        </TabsPanel>
      </Tabs>
    </div>
  );
};
