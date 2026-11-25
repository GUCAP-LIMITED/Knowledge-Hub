import { useState, type ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DurationInput } from './DurationInput';

const ControlledSeconds = ({ initial = 0 }: { initial?: number }): ReactElement => {
  const [seconds, setSeconds] = useState(initial);
  return (
    <DurationInput
      label="Duration"
      mode="seconds"
      value={seconds}
      onChange={(_v, total) => {
        setSeconds(total);
      }}
    />
  );
};

describe('DurationInput', () => {
  it('does not rewrite or wipe what is typed when the parent echoes the value back', () => {
    render(<ControlledSeconds />);
    const input = screen.getByLabelText('Duration');

    fireEvent.change(input, { target: { value: '1' } });
    expect(input).toHaveValue('1');

    fireEvent.change(input, { target: { value: '1h' } });
    fireEvent.change(input, { target: { value: '1h 3' } });
    expect(input).toHaveValue('1h 3');

    fireEvent.change(input, { target: { value: '1h 30m' } });
    expect(input).toHaveValue('1h 30m');
  });

  it('renders with label and formatted seconds in seconds mode', () => {
    render(<DurationInput label="Duration" mode="seconds" value={3600} />);

    const input = screen.getByLabelText('Duration');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('1h');
  });

  it('displays the live translation preview badge when input differs from canonical format', () => {
    // 65m 2s -> 1h 5m 2s
    render(<DurationInput label="Duration" mode="seconds" value={0} />);

    const input = screen.getByLabelText('Duration');
    fireEvent.change(input, { target: { value: '65m 2s' } });

    // Live preview badge should show "= 1h 5m 2s"
    expect(screen.getByText('= 1h 5m 2s')).toBeInTheDocument();
  });

  it('normalizes on blur (60m -> 1h, 60s -> 1m, 65m 2s -> 1h 5m 2s)', () => {
    const onChange = vi.fn();
    render(<DurationInput label="Duration" mode="string" value="" onChange={onChange} />);

    const input = screen.getByLabelText('Duration');

    // Type 60m and blur
    fireEvent.change(input, { target: { value: '60m' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('1h');

    // Type 65m 2s and blur
    fireEvent.change(input, { target: { value: '65m 2s' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('1h 5m 2s');

    // Type 60s and blur
    fireEvent.change(input, { target: { value: '60s' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('1m');
  });

  it('emits total seconds in seconds mode on change', () => {
    const onChange = vi.fn();
    render(
      <DurationInput label="Duration" mode="seconds" value={0} onChange={onChange} />,
    );

    const input = screen.getByLabelText('Duration');
    fireEvent.change(input, { target: { value: '1h 30m' } });

    expect(onChange).toHaveBeenCalledWith(5400, 5400);
  });

  it('clears input when clear button is clicked', () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(
      <DurationInput
        label="Duration"
        mode="seconds"
        value={1800}
        onChange={onChange}
        onClear={onClear}
      />,
    );

    const clearBtn = screen.getByLabelText('Clear Duration');
    fireEvent.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith(0, 0);
    expect(onClear).toHaveBeenCalled();
  });

  it('renders presets and applies preset when clicked', () => {
    const onChange = vi.fn();
    render(
      <DurationInput
        label="Duration"
        mode="seconds"
        value={0}
        presets={['15m', '30m', '1h']}
        onChange={onChange}
      />,
    );

    const presetBtn = screen.getByRole('button', { name: '1h' });
    fireEvent.click(presetBtn);

    const input = screen.getByLabelText('Duration');
    expect(input).toHaveValue('1h');
    expect(onChange).toHaveBeenCalledWith(3600, 3600);
  });

  it('renders error message when error prop is provided', () => {
    render(
      <DurationInput
        label="Duration"
        mode="seconds"
        value={0}
        error="Duration is required."
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Duration is required.');
  });
});
