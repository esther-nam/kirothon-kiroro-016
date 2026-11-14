import { addDays, parseLocalDate } from './local-date';
import type { Instant, LocalDate, MinuteOfDay } from './types';
import { isValidZone, msToInstant, offsetMinutesAt } from './zone';

/** 'oneTime' rejects gaps (R7.13). 'series' shifts forward past them (R8.19). */
export type ResolveContext = 'oneTime' | 'series';

export type ResolvedLocal =
  | { kind: 'normal'; instant: Instant }
  | { kind: 'repeated'; instant: Instant }
  | { kind: 'gap'; instant: Instant }
  | { kind: 'nonexistent' };

const MINUTE_MS = 60_000;
const WINDOW_MS = 36 * 3_600_000;

function wallMsAsUtc(date: LocalDate, minute: MinuteOfDay): number {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const base = new Date(0);
  base.setUTCFullYear(y, m - 1, d);
  base.setUTCHours(0, 0, 0, 0);
  return base.getTime() + minute * MINUTE_MS;
}

/** Smallest whole minute in (lo, hi] whose offset equals the offset at hi. Assumes one transition. */
function findTransition(lo: number, hi: number, zone: string): number {
  const target = offsetMinutesAt(hi, zone);
  let a = Math.floor(lo / MINUTE_MS);
  let b = Math.floor(hi / MINUTE_MS);
  while (b - a > 1) {
    const mid = Math.floor((a + b) / 2);
    if (offsetMinutesAt(mid * MINUTE_MS, zone) === target) b = mid;
    else a = mid;
  }
  return b * MINUTE_MS;
}

/**
 * The single local-to-instant conversion (design 3.3). Minute 1440 means 00:00 of the next date.
 * The series gap policy (provisional OQ-36a) lives only in the `gap` branch below.
 */
export function resolveLocal(
  date: LocalDate,
  minute: MinuteOfDay,
  zone: string,
  context: ResolveContext,
): ResolvedLocal {
  if (!parseLocalDate(date).ok) throw new RangeError(`Invalid LocalDate: ${date}`);
  if (!isValidZone(zone)) throw new RangeError(`Invalid IANA timezone: ${zone}`);
  if (!Number.isInteger(minute) || minute < 0 || minute > 1440) {
    throw new RangeError(`Invalid minute of day: ${minute}`);
  }
  const wall = minute === 1440 ? wallMsAsUtc(addDays(date, 1), 0) : wallMsAsUtc(date, minute);

  const before = offsetMinutesAt(wall - WINDOW_MS, zone);
  const after = offsetMinutesAt(wall + WINDOW_MS, zone);
  const candidates = [...new Set([before, after])]
    .map((offset) => ({ offset, ms: wall - offset * MINUTE_MS }))
    .filter(({ offset, ms }) => offsetMinutesAt(ms, zone) === offset)
    .map(({ ms }) => ms)
    .sort((x, y) => x - y);

  if (candidates.length === 1) return { kind: 'normal', instant: msToInstant(candidates[0] as number) };
  if (candidates.length >= 2) return { kind: 'repeated', instant: msToInstant(candidates[0] as number) };

  // Gap: no instant has this wall time.
  if (context === 'oneTime') return { kind: 'nonexistent' };
  // Series policy (provisional OQ-36a): the first valid local time after the gap.
  const transition = findTransition(wall - before * MINUTE_MS - WINDOW_MS, wall - after * MINUTE_MS + WINDOW_MS, zone);
  return { kind: 'gap', instant: msToInstant(transition) };
}
