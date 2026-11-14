/**
 * Named layout constants. Source: figma-audit.md sections 2 and 9 (FC-1 to FC-9).
 * Initial values, pending visual QA against Figma.
 */

/** FC-1: viewport width at which the desktop layout starts, in px. */
export const DESKTOP_MIN_WIDTH = 1024

/** FC-2: press duration that starts a touch drag-select, in ms. */
export const LONG_PRESS_MS = 400

/** FC-3: smallest block width when overlapping blocks share a column, in px. */
export const MIN_BLOCK_WIDTH_PX = 64

/**
 * FC-4: one scale for every grid interval. Known deviation from Figma
 * (64 px per hour desktop, 80 px per hour mobile), to check in QA.
 */
export const PX_PER_MINUTE = 1

/** FC-5: mobile weekday column width, in px. About 2 to 3 columns are visible. */
export const MOBILE_COLUMN_WIDTH_PX = 140

/** FC-5: fixed mobile time gutter width, in px (Figma 56). */
export const MOBILE_GUTTER_WIDTH_PX = 56

/** FC-6: block height thresholds in px for each density tier. */
export const DENSITY_THRESHOLDS_PX = {
  full: 78,
  titleTime: 58,
  single: 32,
} as const

export type DensityTier = 'full' | 'titleTime' | 'single' | 'minimal'

/** Maps a block height in px to its density tier (R5.9). */
export function densityTierForHeight(heightPx: number): DensityTier {
  if (heightPx >= DENSITY_THRESHOLDS_PX.full) return 'full'
  if (heightPx >= DENSITY_THRESHOLDS_PX.titleTime) return 'titleTime'
  if (heightPx >= DENSITY_THRESHOLDS_PX.single) return 'single'
  return 'minimal'
}

/** FC-8: selectable grid intervals in minutes, and the default. */
export const GRID_INTERVALS_MIN = [15, 30, 60] as const
export type GridIntervalMin = (typeof GRID_INTERVALS_MIN)[number]
export const DEFAULT_GRID_INTERVAL_MIN: GridIntervalMin = 15

/** FC-9: most people on one event, including the creator. */
export const MAX_EVENT_PEOPLE = 5

/** First hour line offset from the top of the grid, in px (audit 2.1). */
export const GRID_TOP_OFFSET_PX = 16
