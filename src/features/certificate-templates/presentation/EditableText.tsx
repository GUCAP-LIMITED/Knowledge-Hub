import { useEffect, useRef, type ReactElement } from 'react';

export interface EditableTextProps {
  readonly initialValue: string;
  /** Single-line elements (the kicker) commit and exit on Enter; multi-line elements
   * (heading/body copy) let Enter insert a line break instead. */
  readonly multiline: boolean;
  readonly className?: string | undefined;
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
}

/** Replaces the current selection with plain text and leaves the caret after it — used for both
 * Enter (inserts `\n`) and paste (inserts the clipboard's plain text), so the element's content
 * stays a single text node instead of accumulating the `<div>`/`<br>` a browser's default
 * contentEditable Enter/paste handling would otherwise introduce. That single-text-node invariant
 * is what makes `.textContent` a reliable, layout-independent read of the current value —
 * `.innerText` would be the "obvious" choice but isn't implemented in jsdom, and depends on actual
 * layout even in real browsers. */
const insertPlainText = (text: string): void => {
  const selection = window.getSelection();
  if (selection === null || selection.rangeCount === 0) {
    return;
  }
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

/**
 * A `contentEditable` text node for in-place canvas editing — the admin double-clicks a text
 * element and types directly on the certificate instead of in a separate field. Sets its starting
 * text imperatively once on mount and never re-syncs from `initialValue` afterwards: letting React
 * re-render this element's children while the user is actively typing is the classic cause of the
 * caret jumping back to the start on every keystroke. The parent remounts this component (via a
 * `key` that changes per selected element) whenever a *different* element enters edit mode, so a
 * mount-once effect is exactly the right lifecycle here.
 */
export const EditableText = ({
  initialValue,
  multiline,
  className,
  onCommit,
  onCancel,
}: EditableTextProps): ReactElement => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element === null) {
      return;
    }
    element.textContent = initialValue;
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    // Intentionally mount-only — see the component doc comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (): void => {
    onCommit(ref.current?.textContent ?? '');
  };

  return (
    <p
      ref={ref}
      className={className}
      role="textbox"
      aria-multiline={multiline}
      contentEditable
      suppressContentEditableWarning
      onBlur={commit}
      onPointerDown={(event) => {
        // Editing takes over the click — the parent's drag/select handler must not also fire.
        event.stopPropagation();
      }}
      onPaste={(event) => {
        event.preventDefault();
        insertPlainText(event.clipboardData.getData('text/plain'));
      }}
      onKeyDown={(event) => {
        // The canvas wrapper listens for Space/Enter to activate the element like a native
        // button (keyboard accessibility for *selecting* it). Without stopping propagation here,
        // that handler sees every keystroke bubble up from this field too and calls
        // preventDefault — which silently blocks the browser's default space-insertion, among
        // other keys, while actively typing.
        event.stopPropagation();
        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
          return;
        }
        if (event.key !== 'Enter') {
          return;
        }
        event.preventDefault();
        if (multiline) {
          insertPlainText('\n');
        } else {
          ref.current?.blur();
        }
      }}
    />
  );
};
