import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { fixedClock } from '@/domain/time/clock'
import { weekRange } from '@/domain/time/week'
import { RepositoryProvider } from '../data/RepositoryProvider'
import { MockRepository } from '../data/mock/mock-repository'
import { MockStore } from '../data/mock/mock-store'
import { createSeedData } from '../data/mock/seed'
import { createSimulation } from '../data/mock/simulate'
import { useWeekOccurrences, type UseWeekOccurrencesResult } from './useWeekOccurrences'

// Wednesday 2026-11-11, so the seeded week is Mon 2026-11-09 to Sun 2026-11-15 (UTC).
const clock = fixedClock('2026-11-11T12:00:00.000Z')
const MONDAY = '2026-11-09'

function setup(latencyMs = 0) {
  const repo = new MockRepository({
    store: new MockStore(createSeedData(clock)),
    simulation: createSimulation({ latencyMs }),
  })
  const spy = vi.spyOn(repo, 'getEventsInRange')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider repository={repo}>{children}</RepositoryProvider>
    </QueryClientProvider>
  )
  return { spy, wrapper }
}

const inWindow = (r: UseWeekOccurrencesResult) =>
  r.occurrences.every(
    (o) =>
      Date.parse(o.startsAt) < Date.parse(r.window.end) &&
      Date.parse(o.endsAt) > Date.parse(r.window.start),
  )

describe('useWeekOccurrences', () => {
  it('returns one occurrence per one-time slot, requested by range only (R18.11)', async () => {
    const { spy, wrapper } = setup()
    const { result } = renderHook(() => useWeekOccurrences(MONDAY, 'UTC'), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const keys = result.current.occurrences.map((o) => o.key)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).toContain('ev-study-group:slot:ev-study-group-slot-1')
    expect(keys).toContain('ev-study-group:slot:ev-study-group-slot-3')
    const range = weekRange(MONDAY, 'UTC')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({ from: range.start, to: range.end })
  })

  it('shows only the last requested week after rapid navigation with latency', async () => {
    const { spy, wrapper } = setup(40)
    const seen: UseWeekOccurrencesResult[] = []
    const { result, rerender } = renderHook(
      ({ monday }) => {
        const value = useWeekOccurrences(monday, 'UTC')
        seen.push(value)
        return value
      },
      { wrapper, initialProps: { monday: MONDAY } },
    )
    rerender({ monday: '2026-11-16' })
    rerender({ monday: '2026-11-23' })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.window).toEqual(weekRange('2026-11-23', 'UTC'))
    expect(result.current.occurrences).toEqual([])
    // No render ever showed data from a week other than the one it reports.
    expect(seen.every(inWindow)).toBe(true)
    // Weeks the user left were requested, but their responses were never used.
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(result.current.window).toEqual(weekRange('2026-11-23', 'UTC'))
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('requests a new window when the display timezone changes', async () => {
    const { spy, wrapper } = setup()
    const { result, rerender } = renderHook(({ zone }) => useWeekOccurrences(MONDAY, zone), {
      wrapper,
      initialProps: { zone: 'UTC' },
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    rerender({ zone: 'America/Los_Angeles' })
    const la = weekRange(MONDAY, 'America/Los_Angeles')
    expect(result.current.window).toEqual(la)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(spy).toHaveBeenLastCalledWith({ from: la.start, to: la.end })
    expect(spy).toHaveBeenCalledTimes(2)
    expect(la.start).not.toBe(weekRange(MONDAY, 'UTC').start)
  })
})
