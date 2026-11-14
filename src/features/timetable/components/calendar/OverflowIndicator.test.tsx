import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import type { OverflowEntry } from '@/domain/layout/overlap'
import type { EventBlockSegment } from './EventBlock'
import { OverflowIndicator } from './OverflowIndicator'

function seg(key: string, title: string): EventBlockSegment {
  return {
    key,
    date: '2026-11-09',
    startMinute: 540,
    endMinute: 600,
    continuesBefore: false,
    continuesAfter: false,
    label: '09:00 – 10:00',
    title,
  }
}
const entry: OverflowEntry<EventBlockSegment> = {
  clusterIndex: 0,
  column: 1,
  columnCount: 2,
  startMinute: 540,
  endMinute: 600,
  count: 2,
  hidden: [seg('a', 'Alpha'), seg('b', 'Beta')],
}

describe.each(['popover', 'sheet'] as const)('OverflowIndicator (%s)', (variant) => {
  const setup = (onSelect = vi.fn()) => {
    render(
      <OverflowIndicator
        entry={entry}
        pxPerMinute={1}
        timeFormat="24h"
        locale="en"
        onSelect={onSelect}
        variant={variant}
      />,
    )
    return { onSelect, trigger: screen.getByRole('button', { name: /2 more events/ }) }
  }

  it('shows +N more and opens with Enter, focus moves in, Escape closes and restores focus', async () => {
    const user = userEvent.setup()
    const { trigger } = setup()
    expect(trigger).toHaveTextContent('+2 more')
    trigger.focus()
    await user.keyboard('{Enter}')
    const alpha = await screen.findByRole('button', { name: /Alpha/ })
    expect(screen.getByRole('button', { name: /Beta/ })).toBeInTheDocument()
    expect(alpha.closest('[role=dialog]')).toContainElement(document.activeElement as HTMLElement)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: /Alpha/ })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('selecting a listed event calls onSelect and closes the list', async () => {
    const user = userEvent.setup()
    const { onSelect, trigger } = setup()
    await user.click(trigger)
    await user.click(await screen.findByRole('button', { name: /Beta/ }))
    expect(onSelect).toHaveBeenCalledWith('b')
    expect(screen.queryByRole('button', { name: /Beta/ })).not.toBeInTheDocument()
  })
})
