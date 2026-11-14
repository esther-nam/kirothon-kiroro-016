import type { LayoutSegment, PlacedBlock } from './overlap';

/** Pixel rectangle of a drawn block, relative to the day column's top-left corner. */
export interface HitRect {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Drawn rectangles of placed blocks (R3.3, R4.3). Geometry stays exact; nothing is enlarged. */
export function placedBlockRects<T extends LayoutSegment>(
  placed: readonly PlacedBlock<T>[],
  columnWidthPx: number,
  pxPerMinute: number,
): HitRect[] {
  return placed.map((block) => {
    const width = columnWidthPx / block.columnCount;
    return {
      key: block.segment.key,
      left: block.column * width,
      top: block.segment.startMinute * pxPerMinute,
      width,
      height: (block.segment.endMinute - block.segment.startMinute) * pxPerMinute,
    };
  });
}

function containsHalfOpen(r: HitRect, p: Point): boolean {
  return p.x >= r.left && p.x < r.left + r.width && p.y >= r.top && p.y < r.top + r.height;
}

/** Rectangle grown symmetrically so each side is at least `minTargetPx` (R5.12). */
function expand(r: HitRect, minTargetPx: number): HitRect {
  const growX = Math.max(0, minTargetPx - r.width) / 2;
  const growY = Math.max(0, minTargetPx - r.height) / 2;
  return {
    key: r.key,
    left: r.left - growX,
    top: r.top - growY,
    width: r.width + 2 * growX,
    height: r.height + 2 * growY,
  };
}

/** Distance from the point to the drawn rectangle (0 when inside). */
function distanceToRect(r: HitRect, p: Point): number {
  const dx = Math.max(r.left - p.x, 0, p.x - (r.left + r.width));
  const dy = Math.max(r.top - p.y, 0, p.y - (r.top + r.height));
  return Math.hypot(dx, dy);
}

function distanceToCenter(r: HitRect, p: Point): number {
  return Math.hypot(r.left + r.width / 2 - p.x, r.top + r.height / 2 - p.y);
}

/**
 * Block hit by a press (design 3.9, R5.12, R6.9). Pure.
 * 1. A block whose drawn rectangle contains the point always wins; when drawn
 *    rectangles share a point (should not happen after layout) the later key order decides.
 * 2. Otherwise the nearest block whose rectangle expanded to `minTargetPx` contains the point.
 * Returns the block key, or null when the press is on empty grid.
 */
export function hitTest(
  point: Point,
  rects: readonly HitRect[],
  minTargetPx: number,
): string | null {
  const drawn = rects.filter((r) => containsHalfOpen(r, point));
  if (drawn.length > 0) return pickClosest(drawn, point, distanceToCenter);

  const reachable = rects.filter((r) => containsHalfOpen(expand(r, minTargetPx), point));
  if (reachable.length === 0) return null;
  const byRect = new Map(rects.map((r) => [r.key, r]));
  return pickClosest(reachable, point, (r, p) => distanceToRect(byRect.get(r.key) ?? r, p));
}

function pickClosest(
  candidates: readonly HitRect[],
  point: Point,
  distance: (r: HitRect, p: Point) => number,
): string {
  let best = candidates[0]!;
  let bestD = distance(best, point);
  for (const c of candidates.slice(1)) {
    const d = distance(c, point);
    if (d < bestD || (d === bestD && c.key < best.key)) {
      best = c;
      bestD = d;
    }
  }
  return best.key;
}
