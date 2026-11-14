import { describe, expect, it } from 'vitest';
import { clearFormatterCache, formatterCacheSize, getFormatter } from './formatter-cache';
import {
  formatInstantRange,
  formatMonthLong,
  formatRange,
  formatTime,
  formatWeekdayShort,
} from './time';

describe('formatTime', () => {
  it('24-hour (R13.4)', () => {
    expect(formatTime(13 * 60 + 5, '24h')).toBe('13:05');
    expect(formatTime(0, '24h')).toBe('00:00');
  });
  it('12-hour (R13.5)', () => {
    expect(formatTime(13 * 60 + 5, '12h')).toBe('1:05 PM');
    expect(formatTime(0, '12h')).toBe('12:00 AM');
    expect(formatTime(720, '12h')).toBe('12:00 PM');
  });
  it('shows an end at midnight as 24:00 in 24-hour format', () => {
    expect(formatTime(1440, '24h')).toBe('24:00');
    expect(formatTime(0, '24h', 'en', true)).toBe('24:00');
    expect(formatTime(1440, '12h')).toBe('12:00 AM');
  });
  it('12-hour setting overrides locale default (R20.4)', () => {
    expect(formatTime(13 * 60 + 5, '12h', 'de')).toMatch(/^1:05 PM$/i);
    expect(formatTime(13 * 60 + 5, '24h', 'en-US')).toBe('13:05');
  });
});

describe('formatRange', () => {
  it('uses an en dash (R5.2)', () => {
    expect(formatRange(740, 795, '24h')).toBe('12:20–13:15');
    expect(formatRange(740, 795, '12h')).toBe('12:20 PM–1:15 PM');
    expect(formatRange(1380, 1440, '24h')).toBe('23:00–24:00');
  });
  it('formats instants in the given zone', () => {
    expect(
      formatInstantRange('2026-03-08T03:20:00.000Z', '2026-03-08T04:15:00.000Z', 'Asia/Seoul', '24h'),
    ).toBe('12:20–13:15');
  });
});

describe('locale-aware dates (R20.2)', () => {
  it('changes weekday and month names for German', () => {
    expect(formatWeekdayShort('2026-11-09', 'en')).toBe('Mon');
    expect(formatWeekdayShort('2026-11-09', 'de')).toMatch(/^Mo/);
    expect(formatMonthLong('2026-11-09', 'en')).toBe('November');
    expect(formatMonthLong('2026-03-09', 'de')).toBe('März');
  });
});

describe('formatter cache', () => {
  it('reuses formatters per zone and locale', () => {
    clearFormatterCache();
    const a = getFormatter('en', 'UTC', { hour: 'numeric' });
    expect(getFormatter('en', 'UTC', { hour: 'numeric' })).toBe(a);
    expect(getFormatter('en', 'Asia/Seoul', { hour: 'numeric' })).not.toBe(a);
    expect(getFormatter('de', 'UTC', { hour: 'numeric' })).not.toBe(a);
    expect(formatterCacheSize()).toBe(3);
  });
});
