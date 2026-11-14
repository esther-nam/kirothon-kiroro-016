import { formatDayOfMonth, formatWeekdayShort } from '@/domain/format/time'
import type { LocalDate } from '@/domain/time/types'
export interface DayHeaderProps {
  date: LocalDate
  locale: string
  isToday: boolean
}
/** Weekday and day of month in the display timezone (R1.8). Sticky behaviour comes from the header row (R3.8). */
export function DayHeader({ date, locale, isToday }: DayHeaderProps) {
  return (
    <div
      role="columnheader"
      data-slot="day-header"
      data-date={date}
      aria-current={isToday ? 'date' : undefined}
      className={`flex flex-col items-center justify-center gap-0.5 border-l border-[var(--divider)] py-2 ${
        isToday ? 'bg-[var(--surface-today)]' : 'bg-[var(--surface-page)]'
      }`}
    >
      <span className="text-xs text-[var(--text-secondary)] uppercase">
        {formatWeekdayShort(date, locale)}
      </span>
      <span className="text-lg font-semibold text-[var(--text-primary)]">
        {formatDayOfMonth(date, locale)}
      </span>
    </div>
  )
}
