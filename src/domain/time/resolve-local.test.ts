import { describe, expect, it } from 'vitest';
import { resolveLocal } from './resolve-local';
import { toLocal } from './zone';

const NY = 'America/New_York';

describe('resolveLocal', () => {
  it('normal time (design 3.3, R14.7)', () => {
    expect(resolveLocal('2025-03-04', 540, NY, 'series')).toEqual({ kind: 'normal', instant: '2025-03-04T14:00:00.000Z' });
    expect(resolveLocal('2025-03-11', 540, NY, 'series')).toEqual({ kind: 'normal', instant: '2025-03-11T13:00:00.000Z' });
  });

  it('repeated hour uses the earlier instant in both contexts (R7.14, R8.19)', () => {
    for (const ctx of ['oneTime', 'series'] as const) {
      expect(resolveLocal('2025-11-02', 90, NY, ctx)).toEqual({ kind: 'repeated', instant: '2025-11-02T05:30:00.000Z' });
    }
  });

  it('series 01:00 to 02:00 across fall-back spans 2 hours', () => {
    const s = resolveLocal('2025-11-02', 60, NY, 'series');
    const e = resolveLocal('2025-11-02', 120, NY, 'series');
    expect(s).toEqual({ kind: 'repeated', instant: '2025-11-02T05:00:00.000Z' });
    expect(e).toEqual({ kind: 'normal', instant: '2025-11-02T07:00:00.000Z' });
  });

  it('one-time gap is nonexistent (R7.13)', () => {
    expect(resolveLocal('2026-03-08', 150, NY, 'oneTime')).toEqual({ kind: 'nonexistent' });
  });

  it('series gap returns the first valid time after the gap', () => {
    expect(resolveLocal('2026-03-08', 150, NY, 'series')).toEqual({ kind: 'gap', instant: '2026-03-08T07:00:00.000Z' });
    expect(resolveLocal('2026-03-08', 135, NY, 'series')).toEqual({ kind: 'gap', instant: '2026-03-08T07:00:00.000Z' });
    expect(resolveLocal('2026-03-08', 180, NY, 'series')).toEqual({ kind: 'normal', instant: '2026-03-08T07:00:00.000Z' });
  });

  it('minute 1440 is 00:00 of the next date', () => {
    expect(resolveLocal('2026-03-07', 1440, NY, 'oneTime')).toEqual(resolveLocal('2026-03-08', 0, NY, 'oneTime'));
    expect(resolveLocal('2026-03-07', 1440, NY, 'oneTime')).toEqual({ kind: 'normal', instant: '2026-03-08T05:00:00.000Z' });
  });

  it('handles +05:45 and +05:30 offsets (R14.13)', () => {
    expect(resolveLocal('2026-01-15', 540, 'Asia/Kathmandu', 'oneTime')).toEqual({ kind: 'normal', instant: '2026-01-15T03:15:00.000Z' });
    expect(resolveLocal('2026-01-15', 540, 'Asia/Kolkata', 'oneTime')).toEqual({ kind: 'normal', instant: '2026-01-15T03:30:00.000Z' });
  });

  it('DST at midnight: 00:00 missing, day starts at first valid time (R14.12)', () => {
    // America/Sao_Paulo began DST at local midnight on 2018-11-04 (-03 to -02).
    expect(resolveLocal('2018-11-04', 0, 'America/Sao_Paulo', 'oneTime')).toEqual({ kind: 'nonexistent' });
    const r = resolveLocal('2018-11-04', 0, 'America/Sao_Paulo', 'series');
    expect(r).toEqual({ kind: 'gap', instant: '2018-11-04T03:00:00.000Z' });
    expect(toLocal('2018-11-04T03:00:00.000Z', 'America/Sao_Paulo')).toEqual({ date: '2018-11-04', minute: 60 });
  });

  it('uses the rules in force at the date (R14.14)', () => {
    // Moscow was UTC+4 in 2012 and returned to UTC+3 in 2014.
    expect(resolveLocal('2012-07-01', 720, 'Europe/Moscow', 'oneTime')).toEqual({ kind: 'normal', instant: '2012-07-01T08:00:00.000Z' });
    expect(resolveLocal('2015-07-01', 720, 'Europe/Moscow', 'oneTime')).toEqual({ kind: 'normal', instant: '2015-07-01T09:00:00.000Z' });
  });

  it('rejects invalid input', () => {
    expect(() => resolveLocal('2026-02-30', 0, NY, 'oneTime')).toThrow(RangeError);
    expect(() => resolveLocal('2026-02-01', 0, 'Not/AZone', 'oneTime')).toThrow(RangeError);
    expect(() => resolveLocal('2026-02-01', 1441, NY, 'oneTime')).toThrow(RangeError);
  });
});

describe('toLocal', () => {
  it('converts instants to wall clock, including across the date line', () => {
    expect(toLocal('2025-01-12T23:00:00.000Z', 'Asia/Seoul')).toEqual({ date: '2025-01-13', minute: 480 });
    expect(toLocal('2025-11-02T06:30:00.000Z', NY)).toEqual({ date: '2025-11-02', minute: 90 });
    expect(toLocal('2026-01-15T03:15:00.000Z', 'Asia/Kathmandu')).toEqual({ date: '2026-01-15', minute: 540 });
  });
});
