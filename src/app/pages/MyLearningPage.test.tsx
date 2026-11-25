import { describe, expect, it, vi } from 'vitest';
import { mapOriginParam, mapAssignedScopeParam } from '@features/my-learning';

describe('MyLearningPage query param mapping', () => {
  describe('mapOriginParam', () => {
    it('maps "assigned" to backend LearningOrigin.Assigned (2)', () => {
      expect(mapOriginParam('assigned')).toBe(2);
    });

    it('maps "self" to backend LearningOrigin.Self (1)', () => {
      expect(mapOriginParam('self')).toBe(1);
    });

    it('maps "all" to undefined so no origin filter is applied', () => {
      expect(mapOriginParam('all')).toBeUndefined();
    });
  });

  describe('mapAssignedScopeParam', () => {
    it('returns undefined when origin is not "assigned"', () => {
      expect(mapAssignedScopeParam('all', 'me')).toBeUndefined();
      expect(mapAssignedScopeParam('self', 'team')).toBeUndefined();
      expect(mapAssignedScopeParam('self', 'role')).toBeUndefined();
    });

    it('returns undefined when scope is "all"', () => {
      expect(mapAssignedScopeParam('assigned', 'all')).toBeUndefined();
    });

    it('maps "me" to backend AssignedScope.Me (1)', () => {
      expect(mapAssignedScopeParam('assigned', 'me')).toBe(1);
    });

    it('maps "team" to backend AssignedScope.Team (2)', () => {
      expect(mapAssignedScopeParam('assigned', 'team')).toBe(2);
    });

    it('maps "role" to backend AssignedScope.Role (3)', () => {
      expect(mapAssignedScopeParam('assigned', 'role')).toBe(3);
    });
  });
});

describe('MyLearningPage forbidden handling', () => {
  it('redirects to /forbidden when a 403 Forbidden error occurs', async () => {
    const { render, screen } = await import('@testing-library/react');
    const { MemoryRouter, Route, Routes } = await import('react-router-dom');
    const myLearningMod = await import('@features/my-learning');
    const { MyLearningPage } = await import('./MyLearningPage');

    const spyInfinite = vi.spyOn(myLearningMod, 'useInfiniteMyLearning').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('HTTP 403 Forbidden for /api/app/my-learning/my-learning'),
      refetch: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    } as unknown as ReturnType<typeof myLearningMod.useInfiniteMyLearning>);

    const spyStats = vi.spyOn(myLearningMod, 'useMyLearningStats').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof myLearningMod.useMyLearningStats>);

    const spyStatuses = vi.spyOn(myLearningMod, 'useMyLearningStatuses').mockReturnValue({
      statuses: [],
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter initialEntries={['/my-learning']}>
        <Routes>
          <Route path="/my-learning" element={<MyLearningPage />} />
          <Route path="/forbidden" element={<div>Access denied box</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Access denied box')).toBeInTheDocument();

    spyInfinite.mockRestore();
    spyStats.mockRestore();
    spyStatuses.mockRestore();
  });
});
