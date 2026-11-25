import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RichTextEditor } from './RichTextEditor';

describe('<RichTextEditor />', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- stubbing the API under test
    document.execCommand = vi.fn();
  });

  it('seeds the editable area with the initial HTML', () => {
    render(
      <RichTextEditor
        label="Description"
        initialValue="<b>hello</b>"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox')).toContainHTML('<b>hello</b>');
  });

  it('runs the bold command and commits the change when a toolbar button is clicked', () => {
    const onChange = vi.fn();
    render(
      <RichTextEditor label="Description" initialValue="text" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));

    // eslint-disable-next-line @typescript-eslint/no-deprecated -- asserting the stub under test
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
    expect(onChange).toHaveBeenCalled();
  });

  it('forces pasted content to plain text', () => {
    const onChange = vi.fn();
    render(<RichTextEditor label="Description" initialValue="" onChange={onChange} />);
    const editor = screen.getByRole('textbox');

    const clipboardData = {
      getData: vi.fn().mockReturnValue('plain text'),
    };
    fireEvent.paste(editor, { clipboardData });

    // eslint-disable-next-line @typescript-eslint/no-deprecated -- asserting the stub under test
    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, 'plain text');
  });

  it('commits sanitized content on input', () => {
    const onChange = vi.fn();
    render(<RichTextEditor label="Description" initialValue="" onChange={onChange} />);
    const editor = screen.getByRole('textbox');

    editor.innerHTML = '<b onclick="x()">typed</b>';
    fireEvent.input(editor);

    expect(onChange).toHaveBeenCalledWith('<b>typed</b>');
  });

  it('sets custom height, minHeight, and maxHeight CSS variables on container', () => {
    const { container } = render(
      <RichTextEditor
        label="Description"
        initialValue=""
        onChange={vi.fn()}
        height={240}
        minHeight="140px"
        maxHeight={500}
      />,
    );

    const field = container.firstElementChild as HTMLElement;
    expect(field.style.getPropertyValue('--rte-height')).toBe('240px');
    expect(field.style.getPropertyValue('--rte-min-height')).toBe('140px');
    expect(field.style.getPropertyValue('--rte-max-height')).toBe('500px');
  });

  it('applies noResize class when resizable is false', () => {
    render(
      <RichTextEditor
        label="Description"
        initialValue=""
        onChange={vi.fn()}
        resizable={false}
      />,
    );

    const editor = screen.getByRole('textbox');
    expect(editor.className).toContain('noResize');
  });

  it('clears manual height override when height prop changes', () => {
    const { rerender } = render(
      <RichTextEditor
        label="Description"
        initialValue=""
        onChange={vi.fn()}
        height={200}
      />,
    );

    const editor = screen.getByRole('textbox');
    // Simulate user dragging the bottom-right corner resize handle
    editor.style.height = '350px';
    expect(editor.style.height).toBe('350px');

    // Rerender with a newly supplied height prop from outside
    rerender(
      <RichTextEditor
        label="Description"
        initialValue=""
        onChange={vi.fn()}
        height={280}
      />,
    );

    // Manual override should be cleared to let the new height take effect
    expect(editor.style.height).toBe('');
  });

  it('updates innerHTML when initialValue changes externally while not focused', () => {
    const { rerender } = render(
      <RichTextEditor label="Description" initialValue="" onChange={vi.fn()} />,
    );

    const editor = screen.getByRole('textbox');
    expect(editor.innerHTML).toBe('');

    rerender(
      <RichTextEditor
        label="Description"
        initialValue="<p>Loaded from server</p>"
        onChange={vi.fn()}
      />,
    );

    expect(editor.innerHTML).toBe('<p>Loaded from server</p>');
  });

  it('does not reset innerHTML while focused when parent re-renders with committed value', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <RichTextEditor label="Description" initialValue="" onChange={onChange} />,
    );

    const editor = screen.getByRole('textbox');
    editor.focus();

    // Simulate user typing
    editor.innerHTML = 'typed text';
    fireEvent.input(editor);

    expect(onChange).toHaveBeenCalledWith('typed text');

    // Simulate parent re-rendering with new field.value
    rerender(
      <RichTextEditor
        label="Description"
        initialValue="typed text"
        onChange={onChange}
      />,
    );

    // InnerHTML must remain intact and not wiped or re-seeded
    expect(editor.innerHTML).toBe('typed text');
  });
});
