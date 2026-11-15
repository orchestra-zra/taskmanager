import { describe, it, expect, vi, afterEach } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { renderHook, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the API layer so no network / axiosClient (and thus no Telegram SDK) is hit.
vi.mock('../../api/events', () => ({
  eventsApi: {
    getEvntsNew: vi.fn(async () => [{ id: 'new-event' }]),
    getEvents: vi.fn(async () => [{ id: 'viewed-event' }]),
  },
}));

import { useGetEventsNew, useGetEvents } from './index';

// Regression for the react-query v5 migration bug where both event hooks shared
// one queryKey: two different feeds cached under the same key collide (the
// second observer silently receives the first one's data). The fix split them
// into ["events", "new"] and ["events", "viewed"].
describe('events hooks: query key collision regression', () => {
  afterEach(() => {
    cleanup();
  });

  it('useGetEventsNew and useGetEvents register DISTINCT cache entries and resolve their own data', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { result: newResult } = renderHook(() => useGetEventsNew(), { wrapper });
    const { result: viewedResult } = renderHook(() => useGetEvents(), { wrapper });

    await waitFor(() => {
      expect(newResult.current.isSuccess).toBe(true);
      expect(viewedResult.current.isSuccess).toBe(true);
    });

    expect(newResult.current.data).toEqual([{ id: 'new-event' }]);
    expect(viewedResult.current.data).toEqual([{ id: 'viewed-event' }]);

    const cacheKeys = queryClient
      .getQueryCache()
      .getAll()
      .map((q) => JSON.stringify(q.queryKey));

    // Both keys exist...
    expect(cacheKeys).toContain(JSON.stringify(['events', 'new']));
    expect(cacheKeys).toContain(JSON.stringify(['events', 'viewed']));
    // ...and they are distinct — exactly two independent cache entries.
    expect(cacheKeys).toHaveLength(2);
    expect(new Set(cacheKeys).size).toBe(2);

    queryClient.clear();
  });
});
