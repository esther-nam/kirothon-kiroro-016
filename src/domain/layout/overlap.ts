import { MIN_BLOCK_WIDTH_PX } from '../../features/timetable/constants/layout';
import type { MinuteOfDay } from '../time/types';

/** The part of a day segment needed for overlap layout (structurally compatible with `DaySegment`). */
export interface LayoutSegment {
  key: string;
  startMinute: MinuteOfDay;
  endMinute: MinuteOfDay;
}

export interface OverlapConfig {
  /** Smallest legible block width in px. Default is `MIN_BLOCK_WIDTH_PX` [FC-3]. */
  minBlockWidthPx: number;
}

export const DEFAULT_OVERLAP_CONFIG: OverlapConfig = { minBlockWidthPx: MIN_BLOCK_WIDTH_PX };

/** A block that is drawn. Horizontal position is `column / columnCount` of the column width. */
export interface PlacedBlock<T extends LayoutSegment = LayoutSegment> {
  segment: T;
  clusterIndex: number;
  /** Zero-based slot index inside the cluster. */
  column: number;
  /** Number of slots the cluster width is divided into (the overflow indicator uses one). */
  columnCount: number;
}

/** The `+N more` entry that takes the last slot of a cluster that is too wide (R4.6). */
export interface OverflowEntry<T extends LayoutSegment = LayoutSegment> {
  clusterIndex: number;
  column: number;
  columnCount: number;
  startMinute: MinuteOfDay;
  endMinute: MinuteOfDay;
  /** N in `+N more`: occurrences in the hidden columns. */
  count: number;
  /** Hidden segments in display order (R4.7). */
  hidden: T[];
}

export interface DayLayout<T extends LayoutSegment = LayoutSegment> {
  placed: PlacedBlock<T>[];
  overflow: OverflowEntry<T>[];
}

/** Display order: earlier start, then later end, then key (R4.8). */
export function compareSegments(a: LayoutSegment, b: LayoutSegment): number {
  if (a.startMinute !== b.startMinute) return a.startMinute - b.startMinute;
  if (a.endMinute !== b.endMinute) return b.endMinute - a.endMinute;
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
}

/** Most side-by-side slots a column of this width can hold, at least 1 (R4.6). */
export function maxColumnsFor(columnWidthPx: number, minBlockWidthPx: number): number {
  return Math.max(1, Math.floor(columnWidthPx / minBlockWidthPx));
}

/**
 * Overlap layout for one day column (design 3.8, R4). Pure and deterministic (R4.8).
 * Intervals are half-open, so touching segments never overlap (R4.1).
 */
export function layoutDay<T extends LayoutSegment>(
  segments: readonly T[],
  columnWidthPx: number,
  config: OverlapConfig = DEFAULT_OVERLAP_CONFIG,
): DayLayout<T> {
  const sorted = [...segments].sort(compareSegments);
  const maxColumns = maxColumnsFor(columnWidthPx, config.minBlockWidthPx);

  const clusters: { items: { segment: T; column: number }[]; columnCount: number }[] = [];
  let current: (typeof clusters)[number] | null = null;
  let clusterEnd = -Infinity;
  let columnEnds: number[] = [];

  for (const segment of sorted) {
    if (current === null || segment.startMinute >= clusterEnd) {
      current = { items: [], columnCount: 0 };
      clusters.push(current);
      clusterEnd = -Infinity;
      columnEnds = [];
    }
    let column = columnEnds.findIndex((end) => end <= segment.startMinute);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = segment.endMinute;
    current.items.push({ segment, column });
    current.columnCount = Math.max(current.columnCount, column + 1);
    clusterEnd = Math.max(clusterEnd, segment.endMinute);
  }

  const placed: PlacedBlock<T>[] = [];
  const overflow: OverflowEntry<T>[] = [];

  clusters.forEach((cluster, clusterIndex) => {
    if (cluster.columnCount <= maxColumns) {
      for (const { segment, column } of cluster.items) {
        placed.push({ segment, clusterIndex, column, columnCount: cluster.columnCount });
      }
      return;
    }
    const shown = maxColumns - 1;
    const hidden: T[] = [];
    for (const { segment, column } of cluster.items) {
      if (column < shown) {
        placed.push({ segment, clusterIndex, column, columnCount: maxColumns });
      } else {
        hidden.push(segment);
      }
    }
    overflow.push({
      clusterIndex,
      column: shown,
      columnCount: maxColumns,
      startMinute: Math.min(...hidden.map((s) => s.startMinute)),
      endMinute: Math.max(...hidden.map((s) => s.endMinute)),
      count: hidden.length,
      hidden,
    });
  });

  return { placed, overflow };
}
