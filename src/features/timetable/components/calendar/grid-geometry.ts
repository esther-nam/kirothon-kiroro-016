export const MINUTES_PER_DAY = 1440

/** 'HH:mm' to minutes since 00:00. Callers pass validated preference values. */
export function minutesOfTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/**
 * Initial vertical scroll offset in px (R3.10, R3.18): the wake-up row on the
 * local-clock axis, clamped to what the grid can scroll.
 */
export function initialScrollTop(
  wakeUpTime: string,
  pxPerMinute: number,
  scrollHeight: number,
  clientHeight: number,
): number {
  const max = Math.max(0, scrollHeight - clientHeight)
  return Math.min(minutesOfTime(wakeUpTime) * pxPerMinute, max)
}
