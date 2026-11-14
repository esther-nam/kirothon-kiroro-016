/** 'YYYY-MM-DD', no zone. Calendar math only (design 3.1, D-14). */
export type LocalDate = string;
/** ISO-8601 UTC instant, whole minutes (e.g. '2026-03-08T10:30:00.000Z'). */
export type Instant = string;
/** Monday = 1 ... Sunday = 7. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
/** 0..1440 (1440 only as an end). */
export type MinuteOfDay = number;

export interface LocalSlotTime {
  startMinute: MinuteOfDay;
  endMinute: MinuteOfDay;
}

export type DomainResult<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type LocalDateErrorCode = 'invalid_format' | 'invalid_date';

export interface LocalDateError {
  code: LocalDateErrorCode;
  input: string;
}
