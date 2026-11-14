import { describe, expect, it } from 'vitest';
import { splitByLocalDay } from './day-split';
import { segmentGeometry } from './geometry';

const occ = (startsAt: string, endsAt: string) => ({ key: 'e1:slot:s1', startsAt, endsAt });

describe('segmentGeometry', () => {
  it('12:20-13:15 has the same position and height regardless of interval (R3.3, R3.5)', () => {
    const [seg] = splitByLocalDay(occ('2025-01-13T12:20:00.000Z', '2025-01-13T13:15:00.000Z'), 'UTC');
    // Geometry takes no interval input, so 15, 30 and 60 share one result.
    const rects = [15, 30, 60].map(() => segmentGeometry(seg!.startMinute, seg!.endMinute, 1));
    for (const r of rects) expect(r).toEqual({ top: 740, height: 55 });
  });

  it('heights are proportional to duration (R3.4)', () => {
    expect(segmentGeometry(0, 30, 1).height * 2).toBe(segmentGeometry(0, 60, 1).height);
  });
});

describe('splitByLocalDay', () => {
  it('splits Seoul 08:00-10:00 viewed in UTC into two segments labeled 23:00–01:00 (R5.15)', () => {
    const segs = splitByLocalDay(occ('2025-01-12T23:00:00.000Z', '2025-01-13T01:00:00.000Z'), 'UTC');
    expect(segs).toHaveLength(2);
    expect(segs[0]).toMatchObject({
      key: 'e1:slot:s1',
      date: '2025-01-12',
      startMinute: 1380,
      endMinute: 1440,
      continuesBefore: false,
      continuesAfter: true,
      label: '23:00–01:00',
    });
    expect(segs[1]).toMatchObject({
      date: '2025-01-13',
      startMinute: 0,
      endMinute: 60,
      continuesBefore: true,
      continuesAfter: false,
      label: '23:00–01:00',
    });
  });

  it('keeps an end exactly at midnight on its day (R14.10)', () => {
    const segs = splitByLocalDay(occ('2025-01-13T22:00:00.000Z', '2025-01-14T00:00:00.000Z'), 'UTC');
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({ date: '2025-01-13', startMinute: 1320, endMinute: 1440, label: '22:00–24:00' });
  });

  it('uses wall-clock minutes of the display zone', () => {
    const segs = splitByLocalDay(occ('2025-01-13T00:00:00.000Z', '2025-01-13T01:00:00.000Z'), 'Asia/Seoul');
    expect(segs[0]).toMatchObject({ date: '2025-01-13', startMinute: 540, endMinute: 600 });
  });

  it('covers every day of a multi-day occurrence', () => {
    const segs = splitByLocalDay(occ('2025-01-13T12:00:00.000Z', '2025-01-15T06:00:00.000Z'), 'UTC');
    expect(segs.map((s) => [s.date, s.startMinute, s.endMinute])).toEqual([
      ['2025-01-13', 720, 1440],
      ['2025-01-14', 0, 1440],
      ['2025-01-15', 0, 360],
    ]);
  });
});
