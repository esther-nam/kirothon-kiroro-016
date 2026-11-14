import { describe, expect, it } from 'vitest';
import { DENSITY_THRESHOLDS_PX } from '../../features/timetable/constants/layout';
import { densityFor } from './density';
import { hitTest, placedBlockRects, type HitRect } from './hit-test';
import { layoutDay } from './overlap';

describe('densityFor (R5.9, FC-6)', () => {
  const { full, titleTime, single } = DENSITY_THRESHOLDS_PX;
  it('switches tier exactly at each threshold', () => {
    expect(densityFor(full)).toBe('full');
    expect(densityFor(full - 1)).toBe('titleTime');
    expect(densityFor(titleTime)).toBe('titleTime');
    expect(densityFor(titleTime - 1)).toBe('single');
    expect(densityFor(single)).toBe('single');
    expect(densityFor(single - 1)).toBe('minimal');
    expect(densityFor(0)).toBe('minimal');
  });
  it('uses the FC-6 values', () => {
    expect([full, titleTime, single]).toEqual([78, 58, 32]);
  });
});

describe('hitTest (R5.12, R6.9)', () => {
  const tiny = (key: string, top: number, height = 5): HitRect => ({
    key,
    left: 0,
    top,
    width: 100,
    height,
  });

  it('a press inside a short block hits that block', () => {
    expect(hitTest({ x: 50, y: 502 }, [tiny('a', 500)], 24)).toBe('a');
  });

  it('a press just outside a short block hits it through the expanded area', () => {
    expect(hitTest({ x: 50, y: 495 }, [tiny('a', 500)], 24)).toBe('a');
    expect(hitTest({ x: 50, y: 480 }, [tiny('a', 500)], 24)).toBeNull();
  });

  it('the drawn rectangle wins over another block\'s expanded area', () => {
    const rects = [tiny('a', 500), tiny('b', 508)];
    expect(hitTest({ x: 50, y: 509 }, rects, 24)).toBe('b');
    expect(hitTest({ x: 50, y: 501 }, rects, 24)).toBe('a');
  });

  it('between two tiny blocks picks the nearer one', () => {
    const rects = [tiny('a', 500), tiny('b', 512)];
    expect(hitTest({ x: 50, y: 507 }, rects, 24)).toBe('a');
    expect(hitTest({ x: 50, y: 510 }, rects, 24)).toBe('b');
  });

  it('half-open edges: the bottom edge belongs to the next block', () => {
    const rects = [tiny('a', 500, 10), tiny('b', 510, 10)];
    expect(hitTest({ x: 50, y: 510 }, rects, 0)).toBe('b');
  });

  it('works with placed blocks side by side', () => {
    const { placed } = layoutDay(
      [
        { key: 'a', startMinute: 600, endMinute: 660 },
        { key: 'b', startMinute: 600, endMinute: 660 },
      ],
      200,
    );
    const rects = placedBlockRects(placed, 200, 1);
    expect(hitTest({ x: 150, y: 620 }, rects, 24)).toBe('b');
    expect(hitTest({ x: 10, y: 620 }, rects, 24)).toBe('a');
  });
});
