import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EditableText } from './EditableText';

describe('<EditableText />', () => {
  it('starts with the initial value and focuses itself', () => {
    render(
      <EditableText
        initialValue="Hello there"
        multiline={false}
        onCommit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const editable = screen.getByRole('textbox');
    expect(editable).toHaveTextContent('Hello there');
    expect(editable).toHaveFocus();
  });

  it('commits the edited text on blur', () => {
    const onCommit = vi.fn();
    render(
      <EditableText
        initialValue="Old"
        multiline={false}
        onCommit={onCommit}
        onCancel={vi.fn()}
      />,
    );
    const editable = screen.getByRole('textbox');
    editable.textContent = 'New value';
    fireEvent.blur(editable);

    expect(onCommit).toHaveBeenCalledWith('New value');
  });

  it('single-line: Enter commits instead of inserting a line break', () => {
    const onCommit = vi.fn();
    render(
      <EditableText
        initialValue="Old"
        multiline={false}
        onCommit={onCommit}
        onCancel={vi.fn()}
      />,
    );
    const editable = screen.getByRole('textbox');
    editable.textContent = 'Committed by Enter';
    fireEvent.keyDown(editable, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith('Committed by Enter');
  });

  it('Escape cancels without committing', () => {
    const onCommit = vi.fn();
    const onCancel = vi.fn();
    render(
      <EditableText
        initialValue="Old"
        multiline={false}
        onCommit={onCommit}
        onCancel={onCancel}
      />,
    );
    const editable = screen.getByRole('textbox');
    editable.textContent = 'Should not commit';
    fireEvent.keyDown(editable, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('stops keydown bubbling to an ancestor — e.g. the canvas wrapper treating Space as "activate"', () => {
    const parentKeyDown = vi.fn();
    render(
      <div onKeyDown={parentKeyDown}>
        <EditableText
          initialValue="Old"
          multiline={false}
          onCommit={vi.fn()}
          onCancel={vi.fn()}
        />
      </div>,
    );
    const editable = screen.getByRole('textbox');
    fireEvent.keyDown(editable, { key: ' ' });

    expect(parentKeyDown).not.toHaveBeenCalled();
  });

  it('marks itself multi-line via aria-multiline when applicable', () => {
    render(
      <EditableText initialValue="Old" multiline onCommit={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-multiline', 'true');
  });
});
