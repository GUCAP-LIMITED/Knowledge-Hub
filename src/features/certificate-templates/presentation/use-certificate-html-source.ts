import { useEffect, useState } from 'react';
import {
  useCertificateTemplateStore,
  type CertificateDesign,
} from '../store/certificate-template-store';
import { buildCertificateTemplateHtml } from './certificate-template-html';
import { parseCertificateTemplateHtml } from './certificate-template-html-parser';

export type CertificateEditorMode = 'visual' | 'html';

export interface UseCertificateHtmlSourceResult {
  readonly mode: CertificateEditorMode;
  readonly setMode: (mode: CertificateEditorMode) => void;
  readonly html: string;
  readonly onHtmlChange: (html: string) => void;
  /** Set once `applyToVisual` was tried against HTML whose structure this editor doesn't
   * recognize (no `[data-element="canvas"]`/`.frame`) — nothing was applied. */
  readonly applyFailed: boolean;
  readonly applyToVisual: () => void;
  /** What `onSave` should persist: the admin's typed HTML verbatim in HTML mode (so a hand-added
   * tag or attribute survives even if the parser above can't round-trip it), the design's rebuilt
   * HTML otherwise — matches the pre-existing save behaviour for anyone who never opens this tab. */
  readonly htmlToSave: string;
}

/**
 * Backs the raw-HTML source tab: seeds a draft from the current design the *first* time the admin
 * opens it (never again — re-seeding on every visit would silently discard unapplied edits) and
 * lets `applyToVisual` sync recognizable elements back onto the canvas via `applyDesignPatch`.
 */
export const useCertificateHtmlSource = (
  kind: CertificateDesign['kind'],
  design: CertificateDesign,
): UseCertificateHtmlSourceResult => {
  const [mode, setMode] = useState<CertificateEditorMode>('visual');
  const [html, setHtml] = useState('');
  const [seeded, setSeeded] = useState(false);
  const [applyFailed, setApplyFailed] = useState(false);
  const applyDesignPatch = useCertificateTemplateStore((state) => state.applyDesignPatch);

  useEffect(() => {
    if (mode === 'html' && !seeded) {
      setHtml(buildCertificateTemplateHtml(kind, design));
      setSeeded(true);
    }
  }, [mode, seeded, kind, design]);

  const onHtmlChange = (value: string): void => {
    setHtml(value);
    setApplyFailed(false);
  };

  const applyToVisual = (): void => {
    const parsed = parseCertificateTemplateHtml(html);
    if (parsed.format === 'unknown') {
      setApplyFailed(true);
      return;
    }
    applyDesignPatch(kind, parsed.design);
    setApplyFailed(false);
    setMode('visual');
  };

  return {
    mode,
    setMode,
    html,
    onHtmlChange,
    applyFailed,
    applyToVisual,
    htmlToSave: mode === 'html' ? html : buildCertificateTemplateHtml(kind, design),
  };
};
