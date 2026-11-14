import { describe, expect, it } from 'vitest'
import { parseTokens } from '@/styles/tokens.test-helpers'
import {
  DEFAULT_GRID_INTERVAL_MIN,
  DENSITY_THRESHOLDS_PX,
  DESKTOP_MIN_WIDTH,
  LONG_PRESS_MS,
  MIN_BLOCK_WIDTH_PX,
  MOBILE_COLUMN_WIDTH_PX,
  PX_PER_MINUTE,
  densityTierForHeight,
} from './layout'

describe('layout constants', () => {
  it('match the approved values', () => {
    expect(DESKTOP_MIN_WIDTH).toBe(1024)
    expect(LONG_PRESS_MS).toBe(400)
    expect(MIN_BLOCK_WIDTH_PX).toBe(64)
    expect(PX_PER_MINUTE).toBe(1)
    expect(DENSITY_THRESHOLDS_PX).toEqual({ full: 78, titleTime: 58, single: 32 })
    expect(DEFAULT_GRID_INTERVAL_MIN).toBe(15)
  })

  it('agree with the CSS tokens', () => {
    const tokens = parseTokens()
    expect(tokens.get('--min-block-width')).toBe(`${MIN_BLOCK_WIDTH_PX}px`)
    expect(tokens.get('--day-column-width-mobile')).toBe(`${MOBILE_COLUMN_WIDTH_PX}px`)
  })

  it.each([
    [78, 'full'],
    [77, 'titleTime'],
    [58, 'titleTime'],
    [57, 'single'],
    [32, 'single'],
    [31, 'minimal'],
    [15, 'minimal'],
  ] as const)('height %i px is tier %s', (height, tier) => {
    expect(densityTierForHeight(height)).toBe(tier)
  })
})
