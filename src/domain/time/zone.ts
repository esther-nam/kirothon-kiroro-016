import { DateTime, IANAZone } from 'luxon';
import { makeLocalDate } from './local-date';
import type { Instant, LocalDate, MinuteOfDay } from './types';

export interface LocalDateTime {
  date: LocalDate;
  /** Wall-clock minutes from local midnight, 0..1439. */
  minute: MinuteOfDay;
}

export function isValidZone(zone: string): boolean {
  return IANAZone.isValidZone(zone);
}

function assertZone(zone: string): void {
  if (!isValidZone(zone)) throw new RangeError(`Invalid IANA timezone: ${zone}`);
}

/** UTC offset in minutes (local minus UTC) in force at an epoch-ms instant. Historical rules apply. */
export function offsetMinutesAt(epochMs: number, zone: string): number {
  assertZone(zone);
  return DateTime.fromMillis(epochMs, { zone }).offset;
}

export function instantToMs(instant: Instant): number {
  const ms = Date.parse(instant);
  if (Number.isNaN(ms)) throw new RangeError(`Invalid instant: ${instant}`);
  return ms;
}

export function msToInstant(epochMs: number): Instant {
  return new Date(epochMs).toISOString();
}

/** Converts an absolute instant to the wall-clock date and minute in `zone`. */
export function toLocal(instant: Instant, zone: string): LocalDateTime {
  assertZone(zone);
  const dt = DateTime.fromMillis(instantToMs(instant), { zone });
  return { date: makeLocalDate(dt.year, dt.month, dt.day), minute: dt.hour * 60 + dt.minute };
}
