import type { ChangeEvent, ReactElement } from 'react';
import { Alert, Button, Textarea } from '@shared/ui';
import styles from './CertificateHtmlSourceEditor.module.css';

export interface CertificateHtmlSourceEditorProps {
  readonly html: string;
  readonly onChange: (html: string) => void;
  readonly onApplyToVisual: () => void;
  readonly applyFailed: boolean;
}

/** Raw-HTML escape hatch for the certificate editor: saving here saves exactly what's typed, and
 * "Apply to visual editor" syncs whatever this editor recognizes (background, copy, positions,
 * fonts) back onto the drag-and-drop canvas. */
export const CertificateHtmlSourceEditor = ({
  html,
  onChange,
  onApplyToVisual,
  applyFailed,
}: CertificateHtmlSourceEditorProps): ReactElement => (
  <div className={styles.wrapper}>
    <span className={styles.hint}>
      Edit the certificate&apos;s raw HTML directly. Saving while this tab is open saves
      exactly what you type here — use &quot;Apply to visual editor&quot; to sync it back
      onto the canvas first if you want to keep editing there instead.
    </span>
    {applyFailed ? (
      <Alert tone="error">
        Could not recognize this HTML&apos;s structure, so nothing was applied to the
        visual editor. Your typed HTML is unaffected and is still what will be saved.
      </Alert>
    ) : null}
    <Textarea
      label="Certificate HTML"
      value={html}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event.target.value);
      }}
      spellCheck={false}
      rows={24}
      className={styles.code}
    />
    <div className={styles.actions}>
      <Button variant="outline" onClick={onApplyToVisual}>
        Apply to visual editor
      </Button>
    </div>
  </div>
);
