import { useId } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatWeekHeader } from '@/domain/format/week-header'
import type { LocalDate } from '@/domain/time/types'
import { en } from '../../messages/en'

export interface CalendarHeaderProps {
  monday: LocalDate
  locale: string
  isCurrentWeek: boolean
  canPrev: boolean
  canNext: boolean
  onPrev(): void
  onNext(): void
  onToday(): void
}

const SEPARATOR = ' \u2014 '

/**
 * Week header and previous, next, Today controls (Figma `Calendar / Header` 7:1386,
 * R1.3, R1.9, R2.1 to R2.4, R2.9, R2.10, R21.6). There is no date picker (R1.9).
 *
 * Inactive controls use `aria-disabled` rather than `disabled`, so they stay
 * focusable and their explanation is read out. Activation is ignored while inactive.
 */
export function CalendarHeader({
  monday,
  locale,
  isCurrentWeek,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const id = useId()
  const text = formatWeekHeader(monday, locale)
  const split = text.indexOf(SEPARATOR)
  const months = split >= 0 ? text.slice(0, split) : text
  const range = split >= 0 ? text.slice(split + SEPARATOR.length) : ''

  const prevHint = `${id}-prev`
  const nextHint = `${id}-next`
  const todayHint = `${id}-today`

  return (
    <div
      data-slot="calendar-header"
      className="flex min-h-[var(--controls-height)] flex-wrap items-center justify-between gap-4 bg-[var(--surface-page)] px-4 py-4 lg:px-8"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[10px] leading-[14px] font-semibold tracking-[0.13em] text-[var(--text-secondary)] uppercase">
          {en.calendar.overline}
        </span>
        <h2
          aria-live="polite"
          aria-atomic="true"
          data-testid="week-header-text"
          className="flex flex-wrap items-baseline text-[28px] leading-[39px] font-semibold text-[var(--text-primary)]"
        >
          <span>{months}</span>
          {range ? (
            <>
              <span className="whitespace-pre text-[var(--text-secondary)]">{SEPARATOR}</span>
              <span className="text-[13px] leading-[18px] font-normal text-[var(--text-secondary)]">
                {range}
              </span>
            </>
          ) : null}
        </h2>
      </div>

      <div className="flex items-center gap-2" role="group" aria-label={en.calendar.weekHeaderLabel}>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={en.calendar.previousWeek}
          aria-disabled={!canPrev}
          aria-describedby={canPrev ? undefined : prevHint}
          title={canPrev ? undefined : en.calendar.previousLimit}
          className={!canPrev ? 'opacity-50' : undefined}
          onClick={() => {
            if (canPrev) onPrev()
          }}
        >
          <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.6} />
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-disabled={isCurrentWeek}
          aria-describedby={isCurrentWeek ? todayHint : undefined}
          title={isCurrentWeek ? en.calendar.todayInactive : undefined}
          className={`h-10 ${isCurrentWeek ? 'opacity-50' : ''}`}
          onClick={() => {
            if (!isCurrentWeek) onToday()
          }}
        >
          {en.calendar.today}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={en.calendar.nextWeek}
          aria-disabled={!canNext}
          aria-describedby={canNext ? undefined : nextHint}
          title={canNext ? undefined : en.calendar.nextLimit}
          className={!canNext ? 'opacity-50' : undefined}
          onClick={() => {
            if (canNext) onNext()
          }}
        >
          <ChevronRight aria-hidden="true" className="size-5" strokeWidth={1.6} />
        </Button>
      </div>

      <span id={prevHint} className="sr-only">
        {en.calendar.previousLimit}
      </span>
      <span id={todayHint} className="sr-only">
        {en.calendar.todayInactive}
      </span>
      <span id={nextHint} className="sr-only">
        {en.calendar.nextLimit}
      </span>
    </div>
  )
}
