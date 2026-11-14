import { addDays } from '../time/local-date';
import type { LocalDate } from '../time/types';
import { getFormatter } from './formatter-cache';

// Week header text (design 3.10, R1.3 to R1.7, R1.10). Month names and numbers
// come from Intl parts. A civil date is rendered at UTC noon in the UTC zone,
// so the machine timezone cannot change the result. No week number is produced.

const SEPARATOR = ' \u2014 '; // em dash with spaces, per R1.3 (Figma shows no separator string, audit item 10)
const RANGE_DASH = '\u2013'; // en dash

interface Civil {
  year: number;
  month: number;
  day: number;
}

function civil(date: LocalDate): Civil {
  return { year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)), day: Number(date.slice(8, 10)) };
}

function instant({ year, month, day }: Civil): Date {
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  d.setUTCHours(12, 0, 0, 0);
  return d;
}

function part(locale: string, options: Intl.DateTimeFormatOptions, type: Intl.DateTimeFormatPartTypes, c: Civil): string {
  const parts = getFormatter(locale, 'UTC', options).formatToParts(instant(c));
  return parts.find((p) => p.type === type)?.value ?? '';
}

const monthLong = (l: string, c: Civil): string => part(l, { month: 'long' }, 'month', c);
const monthShort = (l: string, c: Civil): string => part(l, { month: 'short' }, 'month', c);
const yearOf = (l: string, c: Civil): string => part(l, { year: 'numeric' }, 'year', c);
const dayOf = (l: string, c: Civil): string => part(l, { day: 'numeric' }, 'day', c);

/** Locale pattern table. Day-first languages put the month after the day number. */
const DAY_FIRST = new Set(['de', 'fr', 'es', 'it', 'pt', 'nl', 'ru', 'pl', 'tr', 'ko', 'ja', 'zh']);

function isDayFirst(locale: string): boolean {
  return DAY_FIRST.has(locale.split('-')[0]?.toLowerCase() ?? '');
}

function dayRange(locale: string, a: Civil, b: Civil): string {
  const sameMonth = a.year === b.year && a.month === b.month;
  const dayA = dayOf(locale, a);
  const dayB = dayOf(locale, b);
  if (isDayFirst(locale)) {
    const left = sameMonth ? dayA : `${dayA} ${monthShort(locale, a)}`;
    return `${left}${RANGE_DASH}${dayB} ${monthShort(locale, b)}`;
  }
  const left = `${monthShort(locale, a)} ${dayA}`;
  const right = sameMonth ? dayB : `${monthShort(locale, b)} ${dayB}`;
  return `${left}${RANGE_DASH}${right}`;
}

/**
 * Header text for the Monday-to-Sunday week starting at `monday`.
 * English: `November 2026 — Nov 9–15`, `Nov–Dec 2026 — Nov 30–Dec 6`,
 * `Dec 2026–Jan 2027 — Dec 28–Jan 3`.
 */
export function formatWeekHeader(monday: LocalDate, locale: string): string {
  const a = civil(monday);
  const b = civil(addDays(monday, 6));

  let months: string;
  if (a.year !== b.year) {
    months = `${monthShort(locale, a)} ${yearOf(locale, a)}${RANGE_DASH}${monthShort(locale, b)} ${yearOf(locale, b)}`;
  } else if (a.month !== b.month) {
    months = `${monthShort(locale, a)}${RANGE_DASH}${monthShort(locale, b)} ${yearOf(locale, a)}`;
  } else {
    months = `${monthLong(locale, a)} ${yearOf(locale, a)}`;
  }
  return `${months}${SEPARATOR}${dayRange(locale, a, b)}`;
}
