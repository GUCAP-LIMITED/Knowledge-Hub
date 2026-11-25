import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ContentFeature from '@features/content';
import { ContentSelect } from './ContentSelect';

vi.mock(
  '@features/content',
  async (importOriginal: () => Promise<typeof ContentFeature>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useContentList: vi.fn().mockReturnValue({
        data: {
          items: [
            {
              id: 'content-1',
              title: 'React Fundamentals',
              type: actual.CONTENT_TYPE.course,
            },
            {
              id: 'content-2',
              title: 'TypeScript Advanced',
              type: actual.CONTENT_TYPE.tutorial,
            },
          ],
          totalCount: 2,
        },
        isLoading: false,
        isFetching: false,
      }),
    };
  },
);

describe('<ContentSelect />', () => {
  it('renders trigger button and placeholder', () => {
    render(<ContentSelect value="" onChange={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: /select training content/i }),
    ).toBeInTheDocument();
  });

  it('opens popover on click and shows items', async () => {
    const user = userEvent.setup();
    render(<ContentSelect value="" onChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /select training content/i }));

    expect(await screen.findByPlaceholderText('Search by title…')).toBeInTheDocument();
    expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('TypeScript Advanced')).toBeInTheDocument();
  });

  it('calls onChange when an item is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ContentSelect value="" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /select training content/i }));
    await user.click(await screen.findByText('React Fundamentals'));

    expect(onChange).toHaveBeenCalledWith(
      'content-1',
      expect.objectContaining({
        id: 'content-1',
        title: 'React Fundamentals',
      }),
    );
  });
});
