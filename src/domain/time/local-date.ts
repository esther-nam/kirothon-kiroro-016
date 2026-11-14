import type { DomainResult, LocalDate, LocalDateError, Weekday } from './types';

// Pure integer civil-date arithmetic (Howard Hinnant's algorithms).
// No Date object is used, so the machine timezone cannot affect results.

const PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

interface Civil {
  year: number;
  month: number;
  day: number;
}

function toCivil(date: LocalDate): Civil | null {
  const m = PATTERN.exec(date);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

function format({ year, month, day }: Civil): LocalDate {
  const p = (n: number, w: number): string => String(n).padStart(w, '0');
  return `${p(year, 4)}-${p(month, 2)}-${p(day, 2)}`;
}

/** Days since 1970-01-01 (proleptic Gregorian). */
function daysFromCivil({ year, month, day }: Civil): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

function civilFromDays(z0: number): Civil {
  const z = z0 + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  const year = yoe + era * 400 + (month <= 2 ? 1 : 0);
  return { year, month, day };
}

/** Validates and parses a 'YYYY-MM-DD' string. Rejects impossible dates such as 2026-02-30. */
export function parseLocalDate(input: string): DomainResult<LocalDate, LocalDateError> {
  if (!PATTERN.test(input)) return { ok: false, error: { code: 'invalid_format', input } };
  if (toCivil(input) === null) return { ok: false, error: { code: 'invalid_date', input } };
  return { ok: true, value: input };
}

export function isLocalDate(input: string): boolean {
  return toCivil(input) !== null;
}

function mustCivil(date: LocalDate): Civil {
  const civil = toCivil(date);
  if (civil === null) throw new RangeError(`Invalid LocalDate: ${date}`);
  return civil;
}

/** Builds a LocalDate from parts. Throws RangeError if the date does not exist. */
export function makeLocalDate(year: number, month: number, day: number): LocalDate {
  const civil = { year, month, day };
  if (!Number.isInteger(year) || year < 0 || year > 9999 || !Number.isInteger(month) || !Number.isInteger(day) ||
      month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError(`Invalid civil date: ${year}-${month}-${day}`);
  }
  return format(civil);
}

export function addDays(date: LocalDate, n: number): LocalDate {
  return format(civilFromDays(daysFromCivil(mustCivil(date)) + n));
}

/** Monday = 1 ... Sunday = 7. 1970-01-01 was a Thursday. */
export function weekdayOf(date: LocalDate): Weekday {
  const days = daysFromCivil(mustCivil(date));
  return ((((days + 3) % 7) + 7) % 7 + 1) as Weekday;
}

/** The Monday on or before `date`. */
export function mondayOf(date: LocalDate): LocalDate {
  return addDays(date, 1 - weekdayOf(date));
}

export function addWeeks(date: LocalDate, n: number): LocalDate {
  return addDays(date, n * 7);
}

/** Same day-of-month `n` months later, clamped to the last day of the target month (R8.12). */
export function addMonthsClamped(date: LocalDate, n: number): LocalDate {
  const { year, month, day } = mustCivil(date);
  const index = year * 12 + (month - 1) + n;
  const y = Math.floor(index / 12);
  const mo = index - y * 12 + 1;
  return format({ year: y, month: mo, day: Math.min(day, daysInMonth(y, mo)) });
}

/** Negative if a < b, 0 if equal, positive if a > b. Valid dates compare lexically. */
export function compareLocalDate(a: LocalDate, b: LocalDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
