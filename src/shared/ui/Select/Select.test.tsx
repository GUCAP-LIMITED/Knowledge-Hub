import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, type SelectOption } from './Select';

const OPTIONS: readonly SelectOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

const ControlledSelect = (): ReturnType<typeof Select> => {
  const [value, setValue] = useState('');
  return (
    <Select
      label="Letter"
      placeholder="Pick one…"
      options={OPTIONS}
      value={value}
      onChange={setValue}
    />
  );
};

describe('<Select />', () => {
  it('associates the label with the trigger and shows the placeholder when nothing is selected', () => {
    render(<ControlledSelect />);
    const trigger = screen.getByRole('combobox', { name: 'Letter' });
    expect(trigger).toHaveTextContent('Pick one…');
  });

  it('opens the listbox and updates the value when an option is chosen', async () => {
    const user = userEvent.setup();
    render(<ControlledSelect />);

    await user.click(screen.getByRole('combobox', { name: 'Letter' }));
    await user.click(await screen.findByRole('option', { name: 'Beta' }));

    expect(screen.getByRole('combobox', { name: 'Letter' })).toHaveTextContent('Beta');
  });

  it('renders the error message and marks the trigger invalid', () => {
    render(
      <Select
        label="Letter"
        options={OPTIONS}
        value=""
        onChange={vi.fn()}
        error="Please pick a letter"
        required
      />,
    );
    expect(screen.getByText('Please pick a letter')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Letter' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
