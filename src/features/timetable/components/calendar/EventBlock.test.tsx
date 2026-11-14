import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { densityFor } from '@/domain/layout/density'
import { formatRange } from '@/domain/format/time'
import { en } from '../../messages/en'
import { EventBlock, type EventBlockProps, type EventBlockSegment } from './EventBlock'

function segment(overrides: Partial<EventBlockSegment> = {}): EventBlockSegment {
  return {
    key: 'e1:slot:s1',
    date: '2026-11-09',
    startMinute: 740,
    endMinute: 795,
    continuesBefore: false,
    continuesAfter: false,
    label: formatRange(740, 795, '24h', 'en'),
    title: 'Study group',
    ...overrides,
  }
}

function props(seg: EventBlockSegment, overrides: Partial<EventBlockProps> = {}): EventBlockProps {
  return {
    item: { segment: seg, clusterIndex: 0, column: 0, columnCount: 1 },
    state: 'default',
    density: densityFor(seg.endMinute - seg.startMinute),
    timeFormat: '24h',
    locale: 'en',
    pxPerMinute: 1,
    onSelect: vi.fn(),
    ...overrides,
  }
}

const block = () => screen.getByRole('button')
const slot = (name: string) => block().querySelector(`[data-slot=${name}]`)

describe('EventBlock density tiers', () => {
  const extra = { teamName: 'Algebra', tag: { name: 'Work', colorKey: 'blue' as const } }
  it('full shows title, time and team', () => {
    render(<EventBlock {...props(segment({ ...extra, endMinute: 740 + 90 }))} />)
    expect(block()).toHaveAttribute('data-density', 'full')
    expect(slot('event-title')).toBeInTheDocument()
    expect(slot('event-time')).toBeInTheDocument()
    expect(slot('event-team')).toHaveTextContent('Algebra')
  })
  it('titleTime drops the team line', () => {
    render(<EventBlock {...props(segment({ ...extra, endMinute: 740 + 60 }))} />)
    expect(block()).toHaveAttribute('data-density', 'titleTime')
    expect(slot('event-time')).toBeInTheDocument()
    expect(slot('event-team')).toBeNull()
  })
  it('single shows title and indicator only, with a tooltip', () => {
    render(<EventBlock {...props(segment({ ...extra, endMinute: 740 + 40 }))} />)
    expect(block()).toHaveAttribute('data-density', 'single')
    expect(slot('event-title')).toBeInTheDocument()
    expect(slot('event-time')).toBeNull()
    expect(block()).toHaveAttribute('title', expect.stringContaining('Study group'))
  })
  it('minimal shows the indicator only', () => {
    render(<EventBlock {...props(segment({ ...extra, endMinute: 740 + 15 }))} />)
    expect(block()).toHaveAttribute('data-density', 'minimal')
    expect(slot('event-title')).toBeNull()
    expect(slot('tag-indicator')).toBeInTheDocument()
    expect(block()).toHaveAttribute('title', expect.stringContaining('Study group'))
  })
  it('keeps exact geometry and truncates long titles', () => {
    render(<EventBlock {...props(segment({ title: 'x'.repeat(300) }))} />)
    expect(block()).toHaveStyle({ top: '740px', height: '55px' })
    expect(block()).toHaveClass('overflow-hidden')
    expect(slot('event-title')).toHaveClass('truncate')
  })
})

describe('EventBlock states', () => {
  it.each(['default', 'hover', 'selected'] as const)('renders %s', (state) => {
    render(<EventBlock {...props(segment(), { state })} />)
    expect(block()).toHaveAttribute('data-state', state)
  })
  it('states differ by more than color', () => {
    const classes = (['default', 'hover', 'selected'] as const).map((state) => {
      const { unmount } = render(<EventBlock {...props(segment(), { state })} />)
      const c = block().className
      unmount()
      return c
    })
    expect(classes[1]).toContain('shadow-md')
    expect(classes[2]).toContain('border-2')
    expect(classes[2]).toContain('font-semibold')
    expect(new Set(classes).size).toBe(3)
  })
  it('pointer hover enters and leaves Hover', async () => {
    const user = userEvent.setup()
    render(<EventBlock {...props(segment())} />)
    await user.hover(block())
    expect(block()).toHaveAttribute('data-state', 'hover')
    await user.unhover(block())
    expect(block()).toHaveAttribute('data-state', 'default')
  })
  it('selected stays selected under hover and marks aria-current', async () => {
    const user = userEvent.setup()
    render(<EventBlock {...props(segment(), { state: 'selected' })} />)
    await user.hover(block())
    expect(block()).toHaveAttribute('data-state', 'selected')
    expect(block()).toHaveAttribute('aria-current', 'true')
  })
  it('calls onSelect with the occurrence key', async () => {
    const onSelect = vi.fn()
    render(<EventBlock {...props(segment(), { onSelect })} />)
    await userEvent.setup().click(block())
    expect(onSelect).toHaveBeenCalledWith('e1:slot:s1')
  })
})

describe('EventBlock content rules', () => {
  it('has no indicator when untagged', () => {
    render(<EventBlock {...props(segment())} />)
    expect(slot('tag-indicator')).toBeNull()
  })
  it('colors only the indicator; orange has an outline and blue does not', () => {
    const { rerender } = render(
      <EventBlock {...props(segment({ tag: { name: 'A', colorKey: 'orange' } }))} />,
    )
    expect(slot('tag-indicator')?.className).toContain('bg-tag-orange')
    expect(slot('tag-indicator')?.className).toContain('outline')
    expect(block().className).not.toMatch(/bg-tag|border-tag/)
    rerender(<EventBlock {...props(segment({ tag: { name: 'A', colorKey: 'blue' } }))} />)
    expect(slot('tag-indicator')?.className).not.toContain('outline')
  })
  it('shows no team line without a team', () => {
    render(<EventBlock {...props(segment({ endMinute: 740 + 90 }))} />)
    expect(slot('event-team')).toBeNull()
  })
  it.each(['<b>x</b>', '<img src=x onerror=alert(1)>', '😀 勉強会 café'])(
    'renders %s as plain text',
    (title) => {
      render(<EventBlock {...props(segment({ title }))} />)
      expect(slot('event-title')?.textContent).toBe(title)
      expect(block().querySelector('b, img')).toBeNull()
    },
  )
  it('accessible name has title, tag, day, times and team', () => {
    render(
      <EventBlock
        {...props(
          segment({
            teamName: 'Algebra',
            tag: { name: 'Work', colorKey: 'blue' },
            endMinute: 740 + 90,
            label: formatRange(740, 830, '24h', 'en'),
          }),
        )}
      />,
    )
    expect(block()).toHaveAccessibleName(
      `Study group, ${en.event.tagLabel}: Work, Monday, November 9, 12:20–13:50, ${en.event.teamLabel}: Algebra`,
    )
  })
  it('accessible name omits absent tag and team and keeps the full range of a split segment', () => {
    render(<EventBlock {...props(segment({ label: '23:00–01:00' }))} />)
    expect(block()).toHaveAccessibleName('Study group, Monday, November 9, 23:00–01:00')
  })
})
