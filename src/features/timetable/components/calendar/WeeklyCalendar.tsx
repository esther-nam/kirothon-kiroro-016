import { useLayoutEffect, useRef } from 'react'
import { DEFAULT_LOCALE } from '@/domain/format/time'
import { systemClock, type Clock } from '@/domain/time/clock'
import { addDays } from '@/domain/time/local-date'
import { canNavigate, isCurrentWeek, todayIn } from '@/domain/time/week'
import { useTimetableUiStore } from '../../store/ui-store'
import { usePreferences } from '../../hooks/usePreferences'
import {
  MOBILE_COLUMN_WIDTH_PX,
  MOBILE_GUTTER_WIDTH_PX,
  PX_PER_MINUTE,
} from '../../constants/layout'
import { CalendarHeader } from './CalendarHeader'
import { DayColumn } from './DayColumn'
import { DayHeader } from './DayHeader'
import { TimeGutter } from './TimeGutter'
import { initialScrollTop } from './grid-geometry'
export interface WeeklyCalendarProps {
  locale?: string
  clock?: Clock
}
const DAY_OFFSETS = [0, 1, 2, 3, 4, 5, 6] as const
/**
 * The grid frame: toolbar, sticky day headers, sticky time gutter and seven
 * day columns, Monday to Sunday (R1.1). The grid always spans 00:00 to 24:00 (R3.16).
 *
 * Scrolling (R3.7 to R3.10, R3.17): the toolbar sits outside the scroll
 * container; the header row sticks to its top and the gutter to its left. The
 * scroll position is set once, on the first render after preferences loaded or
 * failed to load. Nothing else ever writes `scrollTop`.
 */
export function WeeklyCalendar({
  locale = DEFAULT_LOCALE,
  clock = systemClock,
}: WeeklyCalendarProps) {
  const monday = useTimetableUiStore((s) => s.visibleMonday)
  const goPrevious = useTimetableUiStore((s) => s.goPrevious)
  const goNext = useTimetableUiStore((s) => s.goNext)
  const goToday = useTimetableUiStore((s) => s.goToday)
  const { preferences, isLoading } = usePreferences()
  const { timeZone, timeFormat, intervalMinutes, wakeUpTime } = preferences
  const scrollRef = useRef<HTMLDivElement>(null)
  const didInitialScroll = useRef(false)
  const ready = !isLoading // loaded, or failed with defaults (R3.10)
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!ready || didInitialScroll.current || !el) return
    didInitialScroll.current = true
    el.scrollTop = initialScrollTop(wakeUpTime, PX_PER_MINUTE, el.scrollHeight, el.clientHeight)
  }, [ready, wakeUpTime])
  const today = todayIn(timeZone, clock)
  const dates = DAY_OFFSETS.map((offset) => addDays(monday, offset))
  const columns = `${MOBILE_GUTTER_WIDTH_PX}px repeat(7, minmax(${MOBILE_COLUMN_WIDTH_PX}px, 1fr))`
  return (
    <section data-slot="weekly-calendar" className="flex h-full min-h-0 flex-col">
      <CalendarHeader
        monday={monday}
        locale={locale}
        isCurrentWeek={isCurrentWeek(monday, timeZone, clock)}
        canPrev={canNavigate(monday, 'previous')}
        canNext={canNavigate(monday, 'next')}
        onPrev={goPrevious}
        onNext={goNext}
        onToday={() => goToday(timeZone)}
      />
      <div ref={scrollRef} data-testid="grid-scroll" className="min-h-0 flex-1 overflow-auto">
        <div role="grid" aria-label="Weekly timetable" className="w-max min-w-full">
          <div
            role="row"
            data-slot="day-header-row"
            className="sticky top-0 z-20 grid border-b border-[var(--divider)] bg-[var(--surface-page)]"
            style={{ gridTemplateColumns: columns }}
          >
            <div className="sticky left-0 z-10 bg-[var(--surface-page)]" aria-hidden="true" />
            {dates.map((date) => (
              <DayHeader key={date} date={date} locale={locale} isToday={date === today} />
            ))}
          </div>
          <div role="row" className="relative grid" style={{ gridTemplateColumns: columns }}>
            <TimeGutter
              intervalMinutes={intervalMinutes}
              timeFormat={timeFormat}
              locale={locale}
              pxPerMinute={PX_PER_MINUTE}
              widthPx={MOBILE_GUTTER_WIDTH_PX}
            />
            {dates.map((date) => (
              <DayColumn
                key={date}
                date={date}
                intervalMinutes={intervalMinutes}
                pxPerMinute={PX_PER_MINUTE}
                isToday={date === today}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
