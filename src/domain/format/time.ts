import type { Instant, LocalDate, MinuteOfDay } from '../time/types';
import { getFormatter } from './formatter-cache';

export type TimeFormat = '12h' | '24h';

export const DEFAULT_LOCALE = 'en';
const EN_DASH = '–';
const MINUTES_PER_DAY = 1440;

function normalizeSpaces(text: string): string {
  return text.replace(/[\u202f\u00a0]/g, ' ');
}

function timeOptions(format: TimeFormat): Intl.DateTimeFormatOptions {
  // The user's 12/24-hour setting overrides the locale default (R20.4).
  return format === '12h'
    ? { hour: 'numeric', minute: '2-digit', hourCycle: 'h12' }
    : { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
}

/**
 * Formats a minute of day (0..1440). `isEnd` lets 1440 (and 0 as an end) show as
 * `24:00` in 24-hour format; in 12-hour format it shows `12:00 AM`.
 */
export function formatTime(
  minute: MinuteOfDay,
  format: TimeFormat,
  locale: string = DEFAULT_LOCALE,
  isEnd = false,
): string {
  if (format === '24h' && (minute === MINUTES_PER_DAY || (isEnd && minute === 0))) {
    return '24:00';
  }
  const m = ((minute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const date = new Date(Date.UTC(2000, 0, 1, Math.floor(m / 60), m % 60));
  const text = getFormatter(locale, 'UTC', timeOptions(format)).format(date);
  return format === '12h' ? normalizeSpaces(text) : text;
}

/** `12:20–13:15` or `12:20 PM–1:15 PM`. */
export function formatRange(
  startMinute: MinuteOfDay,
  endMinute: MinuteOfDay,
  format: TimeFormat,
  locale: string = DEFAULT_LOCALE,
): string {
  return `${formatTime(startMinute, format, locale)}${EN_DASH}${formatTime(endMinute, format, locale, true)}`;
}

/** Formats an absolute instant as a time of day in the given IANA zone. */
export function formatInstantTime(
  instant: Instant,
  timeZone: string,
  format: TimeFormat,
  locale: string = DEFAULT_LOCALE,
): string {
  const text = getFormatter(locale, timeZone, timeOptions(format)).format(new Date(instant));
  return format === '12h' ? normalizeSpaces(text) : text;
}

export function formatInstantRange(
  startsAt: Instant,
  endsAt: Instant,
  timeZone: string,
  format: TimeFormat,
  locale: string = DEFAULT_LOCALE,
): string {
  return `${formatInstantTime(startsAt, timeZone, format, locale)}${EN_DASH}${formatInstantTime(endsAt, timeZone, format, locale)}`;
}

function localDateToUtcDate(date: LocalDate): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

/** Formats a zone-free civil date with arbitrary Intl options (UTC-pinned, so machine zone is irrelevant). */
export function formatLocalDate(
  date: LocalDate,
  options: Intl.DateTimeFormatOptions,
  locale: string = DEFAULT_LOCALE,
): string {
  return getFormatter(locale, 'UTC', options).format(localDateToUtcDate(date));
}

export function formatWeekdayShort(date: LocalDate, locale: string = DEFAULT_LOCALE): string {
  return formatLocalDate(date, { weekday: 'short' }, locale);
}

export function formatMonthShort(date: LocalDate, locale: string = DEFAULT_LOCALE): string {
  return formatLocalDate(date, { month: 'short' }, locale);
}

export function formatMonthLong(date: LocalDate, locale: string = DEFAULT_LOCALE): string {
  return formatLocalDate(date, { month: 'long' }, locale);
}

export function formatDayOfMonth(date: LocalDate, locale: string = DEFAULT_LOCALE): string {
  return formatLocalDate(date, { day: 'numeric' }, locale);
}
