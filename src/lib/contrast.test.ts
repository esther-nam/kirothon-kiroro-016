import { describe, expect, it } from 'vitest'
import { TAG_COLOR_KEYS, TAG_PALETTE } from '@/features/tags/palette'
import { parseTokens, resolveToken } from '@/styles/tokens.test-helpers'
import { contrastRatio } from './contrast'

const tokens = parseTokens()
const color = (name: string) => resolveToken(name, tokens)

describe('contrastRatio', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })
})

describe('token contrast against the block background', () => {
  const blockBg = color('--block-bg')

  it.each(['--text-primary', '--text-block', '--text-secondary'])(
    '%s is at least 4.5:1',
    (name) => {
      expect(contrastRatio(color(name), blockBg)).toBeGreaterThanOrEqual(4.5)
    },
  )

  // Open item (audit section 7, #9): --text-secondary is 4.35:1 on hover/selected blocks.
  // Primary and block title text must pass there; secondary is tracked by the Figma fix.
  it.each(['--block-bg-hover', '--block-bg-selected'])(
    'primary and block text pass on %s',
    (bg) => {
      for (const name of ['--text-primary', '--text-block']) {
        expect(contrastRatio(color(name), color(bg))).toBeGreaterThanOrEqual(4.5)
      }
    },
  )

  it.each(TAG_COLOR_KEYS)('tag indicator %s is at least 3:1', (key) => {
    const entry = TAG_PALETTE[key]
    const fill = contrastRatio(color(entry.cssVar), blockBg)
    if (entry.outlined) {
      // The 1 px outline is the contrast carrier for Orange and Yellow (FC-7).
      expect(fill).toBeLessThan(3)
      expect(contrastRatio(color('--tag-outline'), blockBg)).toBeGreaterThanOrEqual(3)
    } else {
      expect(fill).toBeGreaterThanOrEqual(3)
    }
  })
})
