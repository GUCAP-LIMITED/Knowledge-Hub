import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders nothing when everything fits on one page', () => {
    const { container } = render(
      <Pagination page={0} pageSize={20} totalCount={20} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the range and disables Previous on the first page', () => {
    render(<Pagination page={0} pageSize={20} totalCount={45} onPageChange={vi.fn()} />);
    expect(screen.getByText('1–20 of 45')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('disables Next on the last page and clamps the range end', () => {
    render(<Pagination page={2} pageSize={20} totalCount={45} onPageChange={vi.fn()} />);
    expect(screen.getByText('41–45 of 45')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('reports the requested page', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={1} pageSize={20} totalCount={45} onPageChange={onPageChange} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
