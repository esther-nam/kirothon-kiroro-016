import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { expandBundles, type Occurrence } from '@/domain/recurrence/expand'
import { weekRange, type WeekRange } from '@/domain/time/week'
import type { LocalDate } from '@/domain/time/types'
import type { EventBundle } from '../data/types'
import { useRepository } from '../data/use-repository'

/** The key is the UTC window, so a timezone change that moves the window refetches (R14.2, R14.5). */
export const weekQueryKey = (window: WeekRange) =>
  ['timetable', 'events', window.start, window.end] as const

export interface UseWeekOccurrencesResult {
  /** Empty until the data of the current window has arrived. Never holds another week's data. */
  occurrences: Occurrence[]
  window: WeekRange
  isLoading: boolean
  isError: boolean
}

function abortError(): Error {
  return new DOMException('Week request cancelled', 'AbortError')
}

/** Rejects when `signal` aborts, so a week the user left stops waiting for its response. */
function raceAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortError())
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError())
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort)
        resolve(value)
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort)
        reject(error instanceof Error ? error : new Error(String(error)))
      },
    )
  })
}

/**
 * Loads the events of the visible week by range only (R18.11) and returns its occurrences.
 * One-time events only for now (task 2.8).
 */
export function useWeekOccurrences(
  visibleMonday: LocalDate,
  displayZone: string,
): UseWeekOccurrencesResult {
  const repository = useRepository()
  const window = useMemo(() => weekRange(visibleMonday, displayZone), [visibleMonday, displayZone])

  const query = useQuery({
    queryKey: weekQueryKey(window),
    queryFn: async ({ signal }): Promise<EventBundle[]> => {
      const result = await raceAbort(
        repository.getEventsInRange({ from: window.start, to: window.end }),
        signal,
      )
      if (!result.ok) throw new Error(result.error.code)
      return result.value
    },
  })

  const occurrences = useMemo(
    () => (query.data ? expandBundles(query.data, window) : []),
    [query.data, window],
  )

  return { occurrences, window, isLoading: query.isPending, isError: query.isError }
}
