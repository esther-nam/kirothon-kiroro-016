import { describe, expect, it } from 'vitest'
import tailwindConfig from '../../../tailwind.config'
import { parseTokens, resolveToken } from '@/styles/tokens.test-helpers'
import { TAG_COLOR_KEYS, TAG_PALETTE, tagIndicatorClasses } from './palette'

const tokens = parseTokens()

describe('tag palette', () => {
  it('has the five Figma color keys', () => {
    expect([...TAG_COLOR_KEYS]).toEqual(['blue', 'deep_purple', 'magenta', 'orange', 'yellow'])
  })

  it.each(TAG_COLOR_KEYS)('%s maps to a defined token with a hex value', (key) => {
    const { cssVar } = TAG_PALETTE[key]
    expect(tokens.has(cssVar)).toBe(true)
    expect(resolveToken(cssVar, tokens)).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('exposes every palette token in the Tailwind theme', () => {
    const tagColors = tailwindConfig.theme.extend.colors.tag as Record<string, string>
    for (const key of TAG_COLOR_KEYS) {
      expect(Object.values(tagColors)).toContain(`var(${TAG_PALETTE[key].cssVar})`)
    }
  })

  it('outlines only Orange and Yellow (R5.6a)', () => {
    const outlined = TAG_COLOR_KEYS.filter((k) => TAG_PALETTE[k].outlined)
    expect(outlined).toEqual(['orange', 'yellow'])
    expect(tagIndicatorClasses('orange')).toContain('outline-tag-outline')
    expect(tagIndicatorClasses('blue')).not.toContain('outline')
    expect(resolveToken('--tag-outline', tokens)).toBe('#171717')
  })

  it('keeps event block backgrounds monochrome (R5.4)', () => {
    for (const name of ['--block-bg', '--block-bg-hover', '--block-bg-selected']) {
      const hex = resolveToken(name, tokens)
      expect(hex.slice(1, 3)).toBe(hex.slice(3, 5))
      expect(hex.slice(3, 5)).toBe(hex.slice(5, 7))
    }
  })
})
