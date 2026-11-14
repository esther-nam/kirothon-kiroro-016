import { useMemo } from 'react'
import type { TimeFormat } from '@/domain/format/time'
import { splitByLocalDay } from '@/domain/layout/day-split'
import { layoutDay, type DayLayout } from '@/domain/layout/overlap'
import type { Occurrence } from '@/domain/recurrence/expand'
import type { LocalDate } from '@/domain/time/types'
import type { EventBlockSegment } from '../components/calendar/EventBlock'

export interface UseDayLayoutsInput {
  occurrences: readonly Occurrence[]
  /** The seven visible dates, Monday to Sunday. */
  dates: readonly LocalDate[]
  displayZone: string
  timeFormat: TimeFormat
  locale: string
  columnWidthPx: number
}

export type DayLayouts = ReadonlyMap<LocalDate, DayLayout<EventBlockSegment>>

/**
 * Splits occurrences by local day in the display zone and lays out each visible day (R4.10).
 * Recomputes whenever data, zone, format or column width change. Segments on dates outside
 * the visible week are dropped; they belong to the neighboring week's view.
 */
export function useDayLayouts({
  occurrences,
  dates,
  displayZone,
  timeFormat,
  locale,
  columnWidthPx,
}: UseDayLayoutsInput): DayLayouts {
  return useMemo(() => {
    const byDate = new Map<LocalDate, EventBlockSegment[]>(dates.map((d) => [d, []]))
    for (const occurrence of occurrences) {
      for (const segment of splitByLocalDay(occurrence, displayZone, timeFormat, locale)) {
        byDate.get(segment.date)?.push({ ...segment, title: occurrence.title })
      }
    }
    const layouts = new Map<LocalDate, DayLayout<EventBlockSegment>>()
    for (const [date, segments] of byDate) layouts.set(date, layoutDay(segments, columnWidthPx))
    return layouts
  }, [occurrences, dates, displayZone, timeFormat, locale, columnWidthPx])
}
