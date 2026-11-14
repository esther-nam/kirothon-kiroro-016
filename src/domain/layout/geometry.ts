import type { MinuteOfDay } from '../time/types';

export interface BlockRect {
  top: number;
  height: number;
}

/**
 * Time-based position and size (R3.3, R3.4, R3.15). The grid always starts at 00:00,
 * so `top = startMinute * pxPerMinute`. The grid interval is never an input (R3.5, R3.6).
 */
export function segmentGeometry(
  startMinute: MinuteOfDay,
  endMinute: MinuteOfDay,
  pxPerMinute: number,
): BlockRect {
  return {
    top: startMinute * pxPerMinute,
    height: (endMinute - startMinute) * pxPerMinute,
  };
}
