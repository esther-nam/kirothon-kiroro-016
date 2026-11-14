import { describe, expect, it } from 'vitest';
import { fixedClock, systemClock } from './clock';
import {
  addDays,
  addMonthsClamped,
  addWeeks,
  compareLocalDate,
  makeLocalDate,
  mondayOf,
  parseLocalDate,
  weekdayOf,
} from './local-date';

describe('parseLocalDate', () => {
  it('[R14.20] accepts valid dates including leap day', () => {
    expect(parseLocalDate('2028-02-29')).toEqual({ ok: true, value: '2028-02-29' });
  });
  it('[R14.20] rejects bad format and impossible dates with typed errors', () => {
    expect(parseLocalDate('2026-1-5')).toEqual({ ok: false, error: { code: 'invalid_format', input: '2026-1-5' } });
    expect(parseLocalDate('2026-02-29')).toMatchObject({ ok: false, error: { code: 'invalid_date' } });
    expect(parseLocalDate('2026-13-01')).toMatchObject({ ok: false, error: { code: 'invalid_date' } });
    expect(parseLocalDate('1900-02-29')).toMatchObject({ ok: false, error: { code: 'invalid_date' } });
    expect(parseLocalDate('2000-02-29')).toMatchObject({ ok: true });
  });
  it('[R14.20] makeLocalDate pads and validates', () => {
    expect(makeLocalDate(900, 1, 5)).toBe('0900-01-05');
    expect(() => makeLocalDate(2026, 2, 30)).toThrow(RangeError);
  });
});

describe('weekdayOf / mondayOf / addWeeks', () => {
  it('[R2.1] weekdayOf uses Monday = 1 and Sunday = 7', () => {
    expect(weekdayOf('2026-11-30')).toBe(1);
    expect(weekdayOf('2026-12-06')).toBe(7);
    expect(weekdayOf('1970-01-01')).toBe(4);
    expect(weekdayOf('1900-01-01')).toBe(1);
  });
  it('[R2.1] week across a month boundary: 2026-11-30 to 2026-12-06', () => {
    for (let i = 0; i < 7; i++) expect(mondayOf(addDays('2026-11-30', i))).toBe('2026-11-30');
    expect(addDays('2026-11-30', 6)).toBe('2026-12-06');
    expect(addWeeks('2026-11-30', 1)).toBe('2026-12-07');
  });
  it('[R2.2] week across a year boundary: 2026-12-28 to 2027-01-03', () => {
    expect(mondayOf('2027-01-03')).toBe('2026-12-28');
    expect(addDays('2026-12-28', 6)).toBe('2027-01-03');
    expect(addWeeks('2026-12-28', 1)).toBe('2027-01-04');
    expect(addWeeks('2027-01-04', -1)).toBe('2026-12-28');
  });
  it('[R14.20] leap day arithmetic', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01');
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01');
    expect(weekdayOf('2028-02-29')).toBe(2);
    expect(mondayOf('2028-02-29')).toBe('2028-02-28');
  });
  it('[R14.20] addDays is invertible over a wide range', () => {
    for (const d of ['1900-01-01', '2200-12-31', '2026-03-08', '2026-11-01']) {
      for (const n of [-1000, -1, 0, 1, 365, 10000]) expect(addDays(addDays(d, n), -n)).toBe(d);
    }
  });
});

describe('addMonthsClamped', () => {
  it('[R8.12] clamps to the last day of the target month', () => {
    expect(addMonthsClamped('2026-11-30', 3)).toBe('2027-02-28');
    expect(addMonthsClamped('2027-11-30', 3)).toBe('2028-02-29');
    expect(addMonthsClamped('2026-01-31', 1)).toBe('2026-02-28');
  });
  it('[R8.12] keeps the day when it exists and handles year rollover and negatives', () => {
    expect(addMonthsClamped('2026-10-15', 3)).toBe('2027-01-15');
    expect(addMonthsClamped('2028-02-29', 12)).toBe('2029-02-28');
    expect(addMonthsClamped('2028-02-29', 24)).toBe('2030-02-28');
    expect(addMonthsClamped('2026-01-15', -2)).toBe('2025-11-15');
  });
});

describe('compareLocalDate', () => {
  it('[R14.20] orders dates', () => {
    expect(compareLocalDate('2026-12-31', '2027-01-01')).toBeLessThan(0);
    expect(compareLocalDate('2027-01-01', '2027-01-01')).toBe(0);
  });
});

describe('Clock', () => {
  it('[R14.20] fixedClock returns the injected instant', () => {
    expect(fixedClock('2026-03-08T10:00:00.000Z').now()).toBe('2026-03-08T10:00:00.000Z');
  });
  it('[R14.20] systemClock returns whole-minute UTC instants', () => {
    expect(systemClock.now()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/);
  });
});
