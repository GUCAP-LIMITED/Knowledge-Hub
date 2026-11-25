import {
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { Bold, Italic, List, ListOrdered, Underline } from 'lucide-react';
import { cn, sanitizeRichText } from '@shared/utils';
import styles from './RichTextEditor.module.css';

type FormatCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'insertUnorderedList'
  | 'insertOrderedList';

interface ToolbarAction {
  readonly command: FormatCommand;
  readonly label: string;
  readonly Icon: typeof Bold;
}

const TOOLBAR_ACTIONS: readonly ToolbarAction[] = [
  { command: 'bold', label: 'Bold', Icon: Bold },
  { command: 'italic', label: 'Italic', Icon: Italic },
  { command: 'underline', label: 'Underline', Icon: Underline },
  { command: 'insertUnorderedList', label: 'Bullet list', Icon: List },
  { command: 'insertOrderedList', label: 'Numbered list', Icon: ListOrdered },
];

/**
 * Sole call site for `execCommand`. It's deprecated, but no replacement browser primitive exists
 * for toggling contentEditable formatting (bold/italic/lists) without pulling in a full editor
 * library — which this lightweight field deliberately avoids.
 */
const runEditorCommand = (command: string, value?: string): void => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see comment above
  document.execCommand(command, false, value);
};

const toCssDimension = (value: string | number | undefined): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === 'number' ? `${String(value)}px` : value;
};

interface CustomStyleProperties extends CSSProperties {
  readonly '--rte-height'?: string;
  readonly '--rte-min-height'?: string;
  readonly '--rte-max-height'?: string;
}

interface RichTextToolbarProps {
  readonly label: string;
  readonly onCommand: (command: FormatCommand) => void;
}

const RichTextToolbar = ({ label, onCommand }: RichTextToolbarProps): ReactElement => (
  <div className={styles.toolbar} role="toolbar" aria-label={`${label} formatting`}>
    {TOOLBAR_ACTIONS.map((action) => (
      <button
        key={action.command}
        type="button"
        className={styles.toolbarButton}
        aria-label={action.label}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          onCommand(action.command);
        }}
      >
        <action.Icon size={15} aria-hidden="true" />
      </button>
    ))}
  </div>
);

export interface RichTextEditorProps {
  readonly label: string;
  readonly initialValue: string;
  readonly onChange: (html: string) => void;
  readonly error?: string | undefined;
  readonly required?: boolean;
  /**
   * Default/initial height of the editable area.
   * Can be a number (interpreted as px, e.g. 180 -> '180px') or any CSS length string (e.g. '12rem', '200px').
   * Defaults to '160px'.
   */
  readonly height?: string | number | undefined;
  /**
   * Minimum height boundary for the editable area (defaults to '100px').
   */
  readonly minHeight?: string | number | undefined;
  /**
   * Maximum height boundary for the editable area (defaults to 'none').
   */
  readonly maxHeight?: string | number | undefined;
  /**
   * Whether the editor height is vertically extendable via the bottom-right drag handle.
   * Defaults to true.
   */
  readonly resizable?: boolean | undefined;
  readonly className?: string | undefined;
  readonly style?: CSSProperties | undefined;
}

const createFieldStyle = (
  style: CSSProperties | undefined,
  height: string | number | undefined,
  minHeight: string | number | undefined,
  maxHeight: string | number | undefined,
): CustomStyleProperties => {
  const formattedHeight = toCssDimension(height);
  const formattedMinHeight = toCssDimension(minHeight);
  const formattedMaxHeight = toCssDimension(maxHeight);

  return {
    ...style,
    ...(formattedHeight !== undefined ? { '--rte-height': formattedHeight } : {}),
    ...(formattedMinHeight !== undefined
      ? { '--rte-min-height': formattedMinHeight }
      : {}),
    ...(formattedMaxHeight !== undefined
      ? { '--rte-max-height': formattedMaxHeight }
      : {}),
  };
};

interface FieldLabelProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean | undefined;
}

const FieldLabel = ({ id, label, required }: FieldLabelProps): ReactElement => (
  <label className={styles.label} htmlFor={id}>
    {label}
    {required === true ? (
      <span className={styles.req} aria-hidden="true">
        {' '}
        *
      </span>
    ) : null}
  </label>
);

const clearElementHeight = (element: HTMLElement | null): void => {
  element?.style.removeProperty('height');
};

const useResetHeightOnPropChange = (
  editorRef: { readonly current: HTMLDivElement | null },
  height: string | number | undefined,
): void => {
  const prevHeightRef = useRef(height);

  useEffect(() => {
    if (prevHeightRef.current !== height) {
      prevHeightRef.current = height;
      clearElementHeight(editorRef.current);
    }
  }, [editorRef, height]);
};

const useSyncExternalHtml = (
  initialValue: string,
): {
  readonly editorRef: { readonly current: HTMLDivElement | null };
  readonly initialHtmlRef: { readonly current: string };
  readonly lastCommittedRef: { current: string };
} => {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialHtmlRef = useRef<string>(initialValue);
  const lastCommittedRef = useRef<string>(initialValue);

  useEffect(() => {
    const element = editorRef.current;
    if (!element) {
      return;
    }
    const isFocused = document.activeElement === element;
    if (!isFocused && initialValue !== lastCommittedRef.current) {
      element.innerHTML = initialValue;
      lastCommittedRef.current = initialValue;
    }
  }, [initialValue]);

  return { editorRef, initialHtmlRef, lastCommittedRef };
};

/**
 * Minimal contentEditable rich text field: bold/italic/underline/lists only, no toolbar for
 * links/images/raw HTML. Uncontrolled by design — `initialValue` seeds the DOM once on mount so
 * typing never fights a React re-render for the caret position.
 */
export const RichTextEditor = ({
  label,
  initialValue,
  onChange,
  error,
  required,
  height,
  minHeight,
  maxHeight,
  resizable = true,
  className,
  style,
}: RichTextEditorProps): ReactElement => {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = error !== undefined && error.length > 0;
  const { editorRef, initialHtmlRef, lastCommittedRef } =
    useSyncExternalHtml(initialValue);

  useEffect(() => {
    runEditorCommand('styleWithCSS', 'false');
  }, []);

  useResetHeightOnPropChange(editorRef, height);

  const commit = (): void => {
    const html = sanitizeRichText(editorRef.current?.innerHTML ?? '');
    lastCommittedRef.current = html;
    onChange(html);
  };

  const onPaste = (event: ClipboardEvent<HTMLDivElement>): void => {
    event.preventDefault();
    runEditorCommand('insertText', event.clipboardData.getData('text/plain'));
    commit();
  };

  const handleCommand = (command: FormatCommand): void => {
    editorRef.current?.focus();
    runEditorCommand(command);
    commit();
  };

  const fieldStyle = createFieldStyle(style, height, minHeight, maxHeight);

  return (
    <div className={cn(styles.field, className)} style={fieldStyle}>
      <FieldLabel id={id} label={label} required={required} />
      <RichTextToolbar label={label} onCommand={handleCommand} />
      <div
        id={id}
        ref={editorRef}
        className={cn(
          styles.editor,
          hasError && styles.invalid,
          !resizable && styles.noResize,
        )}
        contentEditable
        role="textbox"
        dir="auto"
        aria-multiline="true"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        onInput={commit}
        onPaste={onPaste}
        onBlur={commit}
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: initialHtmlRef.current }}
      />
      {hasError ? (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      ) : null}
    </div>
  );
};
