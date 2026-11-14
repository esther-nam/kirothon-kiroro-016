/**
 * Tag palette: the five Figma primaries (figma-audit.md 4.1, R5.6).
 * Hex values live only in src/styles/tokens.css. Here a `color_key` maps to a token.
 */

export const TAG_COLOR_KEYS = ['blue', 'deep_purple', 'magenta', 'orange', 'yellow'] as const

export type TagColorKey = (typeof TAG_COLOR_KEYS)[number]

interface TagPaletteEntry {
  /** CSS custom property that holds the color. */
  readonly cssVar: string
  /** Tailwind class for the indicator background. */
  readonly bgClass: string
  /** Orange and Yellow fail 3:1 on the block, so they get a 1 px outline (R5.6a, FC-7). */
  readonly outlined: boolean
}

export const TAG_PALETTE: Readonly<Record<TagColorKey, TagPaletteEntry>> = {
  blue: { cssVar: '--tag-blue', bgClass: 'bg-tag-blue', outlined: false },
  deep_purple: { cssVar: '--tag-deep-purple', bgClass: 'bg-tag-deep-purple', outlined: false },
  magenta: { cssVar: '--tag-magenta', bgClass: 'bg-tag-magenta', outlined: false },
  orange: { cssVar: '--tag-orange', bgClass: 'bg-tag-orange', outlined: true },
  yellow: { cssVar: '--tag-yellow', bgClass: 'bg-tag-yellow', outlined: true },
}

/** Tailwind classes for a tag indicator dot. Outline only where the palette requires it. */
export function tagIndicatorClasses(key: TagColorKey): string {
  const entry = TAG_PALETTE[key]
  const base = `size-tag-dot rounded-pill ${entry.bgClass}`
  return entry.outlined
    ? `${base} outline outline-(length:--tag-outline-width) outline-tag-outline`
    : base
}
