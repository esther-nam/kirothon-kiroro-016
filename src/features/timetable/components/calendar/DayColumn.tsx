import type { ReactNode } from 'react'
import type { LocalDate } from '@/domain/time/types'
import { MINUTES_PER_DAY } from './grid-geometry'
export interface DayColumnProps {
  date: LocalDate
  intervalMinutes: number
  pxPerMinute: number
  isToday: boolean
  /** Block layer, added by later tasks. */
  children?: ReactNode
}
/**
 * One day, 00:00 to 24:00 (R3.16). Grid lines are two CSS gradients, so the
 * column is one element however many rows it has (design D-10).
 */
export function DayColumn({
  date,
  intervalMinutes,
  pxPerMinute,
  isToday,
  children,
}: DayColumnProps) {
  return (
    <div
      role="gridcell"
      data-slot="day-column"
      data-date={date}
      className={`relative border-l border-[var(--divider)] ${isToday ? 'bg-[var(--surface-today)]' : ''}`}
      style={{
        height: MINUTES_PER_DAY * pxPerMinute,
        backgroundImage:
          'linear-gradient(to bottom, var(--grid-line-hour) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line-quarter) 1px, transparent 1px)',
        backgroundSize: `100% ${60 * pxPerMinute}px, 100% ${intervalMinutes * pxPerMinute}px`,
      }}
    >
      {children}
    </div>
  )
}
