import {
  DENSITY_THRESHOLDS_PX,
  densityTierForHeight,
  type DensityTier,
} from '../../features/timetable/constants/layout';

export type Density = DensityTier;

/**
 * Density tier for a block's drawn height in px (design 3.9, R5.9).
 * Thresholds come from the layout constants `[FC-6]`: a height equal to a
 * threshold belongs to the larger tier.
 */
export function densityFor(heightPx: number): Density {
  return densityTierForHeight(heightPx);
}

export { DENSITY_THRESHOLDS_PX };
