import { describe, expect, it } from 'vitest';
import { layoutDay, type LayoutSegment } from './overlap';

const seg = (key: string, startMinute: number, endMinute: number): LayoutSegment => ({
  key,
  startMinute,
  endMinute,
});

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('layoutDay', () => {
  it('touching segments do not overlap and use the full width (R4.1, R4.5)', () => {
    const { placed, overflow } = layoutDay([seg('a', 60, 120), seg('b', 120, 180)], 200);
    expect(overflow).toEqual([]);
    expect(placed.map((p) => [p.column, p.columnCount])).toEqual([
      [0, 1],
      [0, 1],
    ]);
  });

  it('identical segments sit side by side, ordered by key (R4.2, R4.3, R4.8)', () => {
    const { placed } = layoutDay([seg('b', 60, 120), seg('a', 60, 120)], 200);
    expect(placed.map((p) => [p.segment.key, p.column, p.columnCount])).toEqual([
      ['a', 0, 2],
      ['b', 1, 2],
    ]);
  });

  it('orders by start, then longer first (R4.8)', () => {
    const { placed } = layoutDay([seg('short', 60, 90), seg('long', 60, 180), seg('early', 30, 45)], 300);
    expect(placed.map((p) => p.segment.key)).toEqual(['early', 'long', 'short']);
  });

  it('chain overlap is one cluster and A and C share a column (R4.4)', () => {
    const { placed } = layoutDay([seg('A', 0, 60), seg('B', 30, 90), seg('C', 60, 120)], 300);
    const byKey = Object.fromEntries(placed.map((p) => [p.segment.key, p]));
    expect(byKey.A!.column).toBe(0);
    expect(byKey.B!.column).toBe(1);
    expect(byKey.C!.column).toBe(0);
    expect(new Set(placed.map((p) => p.columnCount))).toEqual(new Set([2]));
    expect(new Set(placed.map((p) => p.clusterIndex)).size).toBe(1);
  });

  it('6 overlapping segments at 200 px keep 2 and report +4 more (R4.6)', () => {
    const segs = ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => seg(k, 60, 120));
    const { placed, overflow } = layoutDay(segs, 200); // maxColumns = 3
    expect(placed.map((p) => p.segment.key)).toEqual(['a', 'b']);
    expect(overflow).toHaveLength(1);
    expect(overflow[0]).toMatchObject({ count: 4, column: 2, columnCount: 3, startMinute: 60, endMinute: 120 });
    expect(overflow[0]!.hidden.map((s) => s.key)).toEqual(['c', 'd', 'e', 'f']);
  });

  it('a column narrower than twice the minimum puts the whole cluster in overflow', () => {
    const { placed, overflow } = layoutDay([seg('a', 0, 60), seg('b', 0, 60)], 100);
    expect(placed).toEqual([]);
    expect(overflow[0]).toMatchObject({ count: 2, column: 0, columnCount: 1 });
  });

  it('does not overflow a cluster that fits exactly', () => {
    const { overflow, placed } = layoutDay([seg('a', 0, 60), seg('b', 0, 60), seg('c', 0, 60)], 192);
    expect(overflow).toEqual([]);
    expect(placed).toHaveLength(3);
  });

  it('is deterministic and never overlaps drawn blocks over 1,000 seeded random sets (R4.8, R4.9)', () => {
    const rand = mulberry32(12345);
    for (let i = 0; i < 1000; i++) {
      const n = Math.floor(rand() * 12);
      const segs: LayoutSegment[] = [];
      for (let j = 0; j < n; j++) {
        const start = Math.floor(rand() * 20) * 60;
        segs.push(seg(`k${j}`, start, start + (1 + Math.floor(rand() * 4)) * 30));
      }
      const width = 64 * (1 + Math.floor(rand() * 4));
      const first = layoutDay(segs, width);
      const shuffled = [...segs].sort(() => rand() - 0.5);
      expect(layoutDay(shuffled, width)).toEqual(first);
      expect(first.placed.length + first.overflow.reduce((s, o) => s + o.count, 0)).toBe(n);
      for (const a of first.placed) {
        for (const b of first.placed) {
          if (a === b || a.clusterIndex !== b.clusterIndex || a.column !== b.column) continue;
          const overlap =
            a.segment.startMinute < b.segment.endMinute && b.segment.startMinute < a.segment.endMinute;
          expect(overlap).toBe(false);
        }
      }
    }
  });
});
