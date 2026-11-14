import { formatTime, type TimeFormat } from '@/domain/format/time'
import { MINUTES_PER_DAY } from './grid-geometry'
export interface TimeGutterProps {
  intervalMinutes: number
  timeFormat: TimeFormat
  locale: string
  pxPerMinute: number
  widthPx: number
}
/**
 * Time labels down the left, one per row of the local-clock axis (R1.1, R3.2).
 * Sticky to the left edge while the grid scrolls horizontally (R3.9, R16.10).
 */
export function TimeGutter({
  intervalMinutes,
  timeFormat,
  locale,
  pxPerMinute,
  widthPx,
}: TimeGutterProps) {
  const labels: number[] = []
  for (let minute = 0; minute < MINUTES_PER_DAY; minute += intervalMinutes) labels.push(minute)
  return (
    <div
      data-slot="time-gutter"
      className="sticky left-0 z-10 bg-[var(--surface-page)]"
      style={{ width: widthPx, height: MINUTES_PER_DAY * pxPerMinute }}
    >
      {labels.map((minute) => (
        <span
          key={minute}
          data-minute={minute}
          className={`absolute right-2 text-[10px] leading-3 whitespace-nowrap text-[var(--text-secondary)] ${
            minute === 0 ? '' : '-translate-y-1/2'
          }`}
          style={{ top: minute * pxPerMinute }}
        >
          {formatTime(minute, timeFormat, locale)}
        </span>
      ))}
    </div>
  )
}
