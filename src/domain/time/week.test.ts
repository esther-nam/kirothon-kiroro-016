import { describe, expect, it } from 'vitest';
import { fixedClock } from './clock';
import { addWeeks, mondayOf, weekdayOf } from './local-date';
import { NAV_MAX, NAV_MIN, canNavigate, intersectsWeek, isCurrentWeek, stepWeek, todayIn, weekRange } from './week';

const hours = (r: { start: string; end: string }): number => (Date.parse(r.end) - Date.parse(r.start)) / 3_600_000;

describe('weekRange', () => {
  it('[R14.9] week of 2025-03-03 in New York is 167 hours (spring forward)', () => {
    expect(hours(weekRange('2025-03-03', 'America/New_York'))).toBe(167);
  });

  it('[R14.9] week of 2025-10-27 in New York is 169 hours (fall back)', () => {
    expect(hours(weekRange('2025-10-27', 'America/New_York'))).toBe(169);
  });

  it('[R14.9] an ordinary week is 168 hours and starts at local Monday 00:00', () => {
    const r = weekRange('2025-06-02', 'Asia/Seoul');
    expect(hours(r)).toBe(168);
    expect(r.start).toBe('2025-06-01T15:00:00.000Z');
  });

  it('[R14.10] Monday 00:00 is inside the week and an end at Monday 00:00 is not', () => {
    const r = weekRange('2025-06-02', 'UTC');
    expect(intersectsWeek(r.start, '2025-06-02T01:00:00.000Z', r)).toBe(true);
    expect(intersectsWeek('2025-06-01T23:00:00.000Z', r.start, r)).toBe(false);
    expect(intersectsWeek(r.end, '2025-06-09T01:00:00.000Z', r)).toBe(false);
    expect(intersectsWeek('2025-06-08T23:00:00.000Z', r.end, r)).toBe(true);
  });
});

describe('todayIn and isCurrentWeek', () => {
  const clock = fixedClock('2025-06-08T20:00:00.000Z'); // Sunday UTC, already Monday in Seoul

  it('[R2.3] uses the display zone for the local date', () => {
    expect(todayIn('UTC', clock)).toBe('2025-06-08');
    expect(todayIn('Asia/Seoul', clock)).toBe('2025-06-09');
  });

  it('[R2.3] the current week depends on the zone', () => {
    expect(isCurrentWeek('2025-06-02', 'UTC', clock)).toBe(true);
    expect(isCurrentWeek('2025-06-02', 'Asia/Seoul', clock)).toBe(false);
    expect(isCurrentWeek('2025-06-09', 'Asia/Seoul', clock)).toBe(true);
  });
});

describe('navigation', () => {
  it('[R2.1][R2.2] crosses month and year boundaries', () => {
    expect(stepWeek('2026-11-30', 'next')).toBe('2026-12-07');
    expect(stepWeek('2026-12-28', 'next')).toBe('2027-01-04');
    expect(stepWeek('2027-01-04', 'previous')).toBe('2026-12-28');
  });

  it('[R2.1][R2.2] crosses the leap day', () => {
    expect(stepWeek('2028-02-28', 'next')).toBe('2028-03-06');
    expect(stepWeek('2028-03-06', 'previous')).toBe('2028-02-28');
  });

  it('[R2.5] every step across DST lands on a Monday that starts at local midnight', () => {
    let monday = '2025-03-03';
    for (let i = 0; i < 4; i++) {
      monday = stepWeek(monday, 'next');
      expect(weekdayOf(monday)).toBe(1);
      expect(weekRange(monday, 'America/New_York').start).toMatch(/T0[45]:00:00\.000Z$/);
    }
  });

  it('[R2.9] limits block navigation at both ends', () => {
    expect(mondayOf(NAV_MIN)).toBe(NAV_MIN);
    expect(canNavigate(NAV_MIN, 'previous')).toBe(false);
    expect(canNavigate(NAV_MIN, 'next')).toBe(true);
    expect(canNavigate(addWeeks(NAV_MIN, 1), 'previous')).toBe(true);

    const lastMonday = mondayOf(NAV_MAX);
    expect(canNavigate(lastMonday, 'next')).toBe(false);
    expect(canNavigate(lastMonday, 'previous')).toBe(true);
    expect(canNavigate(addWeeks(lastMonday, -1), 'next')).toBe(true);
  });
});
