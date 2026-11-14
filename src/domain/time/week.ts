import type { Clock } from './clock';
import { addDays, addWeeks, compareLocalDate, mondayOf } from './local-date';
import { resolveLocal } from './resolve-local';
import type { Instant, LocalDate } from './types';
import { toLocal } from './zone';

/** Navigable range (design 3.4, R2.9). */
export const NAV_MIN: LocalDate = '1900-01-01';
export const NAV_MAX: LocalDate = '2200-12-31';

export type NavDirection = 'previous' | 'next';

export interface WeekRange {
  /** Inclusive. */
  start: Instant;
  /** Exclusive. */
  end: Instant;
}

/** First valid instant of a local day. A day whose 00:00 is skipped starts at its first valid time (R14.12). */
export function startOfDay(date: LocalDate, zone: string): Instant {
  const resolved = resolveLocal(date, 0, zone, 'series');
  // The 'series' context never yields 'nonexistent'; gaps shift forward.
  if (resolved.kind === 'nonexistent') throw new RangeError(`No valid start of day for ${date} in ${zone}`);
  return resolved.instant;
}

/** Half-open `[start of Monday, start of next Monday)` computed on local dates, never +168h (R14.9). */
export function weekRange(monday: LocalDate, zone: string): WeekRange {
  return { start: startOfDay(monday, zone), end: startOfDay(addDays(monday, 7), zone) };
}

/** True if `[start, end)` intersects the week: `start < weekEnd AND end > weekStart` (R14.10). */
export function intersectsWeek(start: Instant, end: Instant, range: WeekRange): boolean {
  return start < range.end && end > range.start;
}

/** The current local date in `zone`. */
export function todayIn(zone: string, clock: Clock): LocalDate {
  return toLocal(clock.now(), zone).date;
}

/** True when `visibleMonday` is the week that contains "now" in `zone`. */
export function isCurrentWeek(visibleMonday: LocalDate, zone: string, clock: Clock): boolean {
  return mondayOf(todayIn(zone, clock)) === visibleMonday;
}

/** The Monday reached by one step. Does not check limits; see `canNavigate`. */
export function stepWeek(monday: LocalDate, direction: NavDirection): LocalDate {
  return addWeeks(monday, direction === 'next' ? 1 : -1);
}

/**
 * Whether a step stays in the navigable range. The target week must overlap
 * `[NAV_MIN, NAV_MAX]`: its Sunday must be on or after NAV_MIN, its Monday on or before NAV_MAX.
 */
export function canNavigate(monday: LocalDate, direction: NavDirection): boolean {
  const target = stepWeek(monday, direction);
  return direction === 'next'
    ? compareLocalDate(target, NAV_MAX) <= 0
    : compareLocalDate(addDays(target, 6), NAV_MIN) >= 0;
}
