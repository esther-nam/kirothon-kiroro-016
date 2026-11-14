import { formatRange, type TimeFormat } from '../format/time';
import { addDays, compareLocalDate } from '../time/local-date';
import type { Instant, LocalDate, MinuteOfDay } from '../time/types';
import { toLocal } from '../time/zone';

export const MINUTES_PER_DAY = 1440;

/** The part of an occurrence needed to place it (structurally compatible with `Occurrence`). */
export interface SplittableOccurrence {
  key: string;
  startsAt: Instant;
  endsAt: Instant;
}

/** One occurrence piece inside one local day column (design 3.6). */
export interface DaySegment {
  /** Occurrence key. Every segment of one occurrence shares it (R5.15). */
  key: string;
  /** Local date of the column in the display timezone. */
  date: LocalDate;
  /** Wall-clock minutes in the display timezone, 0..1440. */
  startMinute: MinuteOfDay;
  endMinute: MinuteOfDay;
  continuesBefore: boolean;
  continuesAfter: boolean;
  /** Full original range of the whole occurrence in the display timezone, e.g. `23:00–01:00`. */
  label: string;
}

/**
 * Splits an occurrence into one segment per local day it touches in `displayZone`.
 * The grid always shows 00:00 to 24:00 (FD-9), so nothing is clipped.
 * An end exactly at local midnight stays on its day and ends at 1440 (R14.10).
 */
export function splitByLocalDay(
  occurrence: SplittableOccurrence,
  displayZone: string,
  timeFormat: TimeFormat = '24h',
  locale?: string,
): DaySegment[] {
  const start = toLocal(occurrence.startsAt, displayZone);
  const end = toLocal(occurrence.endsAt, displayZone);

  let lastDate = end.date;
  let lastMinute: MinuteOfDay = end.minute;
  if (compareLocalDate(end.date, start.date) > 0 && end.minute === 0) {
    lastDate = addDays(end.date, -1);
    lastMinute = MINUTES_PER_DAY;
  }
  // Fall-back day: wall-clock end can precede wall-clock start on the same date.
  if (lastDate === start.date && lastMinute < start.minute) lastMinute = start.minute;

  const label = formatRange(start.minute, end.minute, timeFormat, locale);
  const segments: DaySegment[] = [];
  for (let date = start.date; compareLocalDate(date, lastDate) <= 0; date = addDays(date, 1)) {
    const isFirst = date === start.date;
    const isLast = date === lastDate;
    segments.push({
      key: occurrence.key,
      date,
      startMinute: isFirst ? start.minute : 0,
      endMinute: isLast ? lastMinute : MINUTES_PER_DAY,
      continuesBefore: !isFirst,
      continuesAfter: !isLast,
      label,
    });
  }
  return segments;
}
