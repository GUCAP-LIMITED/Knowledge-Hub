import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('<Button />', () => {
  it('renders a real button that defaults to type="button"', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('is disabled and busy while loading', () => {
    render(<Button isLoading>Save</Button>);
    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('styles its child instead of rendering a button when asChild is set', () => {
    render(
      <Button asChild variant="outline">
        <a href="/certificates">View certificate</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'View certificate' });
    expect(link).toHaveAttribute('href', '/certificates');
    expect(link.className).toContain('button');
    expect(link.className).toContain('outline');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('marks an asChild link as aria-disabled instead of using the disabled attribute', () => {
    render(
      <Button asChild disabled>
        <a href="/x">Go</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('forwards event handlers to an asChild child', () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    render(
      <Button asChild onClick={onClick}>
        <a href="/x">Go</a>
      </Button>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
