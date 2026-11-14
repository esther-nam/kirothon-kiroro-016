import type { Config } from 'tailwindcss'

/**
 * Theme extension over the CSS variables in src/styles/tokens.css.
 * Loaded from globals.css with `@config`. No raw values here.
 */
const config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neutral: {
          0: 'var(--neutral-0)',
          25: 'var(--neutral-25)',
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          350: 'var(--neutral-350)',
          500: 'var(--neutral-500)',
          900: 'var(--neutral-900)',
        },
        surface: {
          page: 'var(--surface-page)',
          subtle: 'var(--surface-subtle)',
          today: 'var(--surface-today)',
          hover: 'var(--surface-hover)',
        },
        block: {
          DEFAULT: 'var(--block-bg)',
          hover: 'var(--block-bg-hover)',
          selected: 'var(--block-bg-selected)',
          border: 'var(--block-border)',
          'border-focus': 'var(--block-border-focus)',
        },
        grid: {
          hour: 'var(--grid-line-hour)',
          quarter: 'var(--grid-line-quarter)',
        },
        divider: 'var(--divider)',
        content: {
          primary: 'var(--text-primary)',
          block: 'var(--text-block)',
          secondary: 'var(--text-secondary)',
          inverse: 'var(--text-inverse)',
        },
        tag: {
          blue: 'var(--tag-blue)',
          'deep-purple': 'var(--tag-deep-purple)',
          magenta: 'var(--tag-magenta)',
          orange: 'var(--tag-orange)',
          yellow: 'var(--tag-yellow)',
          outline: 'var(--tag-outline)',
        },
      },
      spacing: {
        'sp-1': 'var(--space-1)',
        'sp-2': 'var(--space-2)',
        'sp-3': 'var(--space-3)',
        'sp-4': 'var(--space-4)',
        'sp-5': 'var(--space-5)',
        'sp-6': 'var(--space-6)',
        'sp-8': 'var(--space-8)',
        'sp-10': 'var(--space-10)',
        'sp-12': 'var(--space-12)',
        'sp-14': 'var(--space-14)',
        'sp-16': 'var(--space-16)',
        'block-pad': 'var(--block-padding)',
        'block-gap': 'var(--block-gap)',
        'block-pad-mobile': 'var(--block-padding-mobile)',
        'block-gap-mobile': 'var(--block-gap-mobile)',
        'block-pad-narrow': 'var(--block-padding-narrow)',
        'block-inset': 'var(--block-inset-desktop)',
        'block-inset-mobile': 'var(--block-inset-mobile)',
        gutter: 'var(--gutter-width)',
        'gutter-mobile': 'var(--gutter-width-mobile)',
        page: 'var(--page-padding)',
        nav: 'var(--nav-height)',
        controls: 'var(--controls-height)',
        'weekday-header': 'var(--weekday-header-height)',
        footer: 'var(--footer-height)',
        control: 'var(--control-height)',
        touch: 'var(--touch-target)',
        icon: 'var(--icon-size)',
        'tag-dot': 'var(--tag-dot-size)',
        'tag-dot-modal': 'var(--tag-dot-size-modal)',
        'day-column-mobile': 'var(--day-column-width-mobile)',
        'min-block': 'var(--min-block-width)',
        modal: 'var(--modal-width)',
      },
      borderRadius: {
        event: 'var(--radius-event)',
        control: 'var(--radius-control)',
        button: 'var(--radius-button)',
        card: 'var(--radius-card)',
        dialog: 'var(--radius-dialog)',
        'date-badge': 'var(--radius-date-badge)',
        pill: 'var(--radius-pill)',
      },
      fontFamily: { sans: ['var(--font-sans)'] },
      fontSize: {
        display: ['var(--text-display-size)', 'var(--text-display-line)'],
        heading: ['var(--text-heading-size)', 'var(--text-heading-line)'],
        title: ['var(--text-title-size)', 'var(--text-title-line)'],
        subtitle: ['var(--text-subtitle-size)', 'var(--text-subtitle-line)'],
        body: ['var(--text-body-size)', 'var(--text-body-line)'],
        small: ['var(--text-small-size)', 'var(--text-small-line)'],
        'event-title': ['var(--text-event-title-size)', 'var(--text-event-title-line)'],
        caption: ['var(--text-caption-size)', 'var(--text-caption-line)'],
        overline: [
          'var(--text-overline-size)',
          {
            lineHeight: 'var(--text-overline-line)',
            letterSpacing: 'var(--text-overline-tracking)',
          },
        ],
        wordmark: [
          'var(--text-wordmark-size)',
          {
            lineHeight: 'var(--text-wordmark-line)',
            letterSpacing: 'var(--text-wordmark-tracking)',
          },
        ],
      },
    },
  },
} satisfies Config

export default config
