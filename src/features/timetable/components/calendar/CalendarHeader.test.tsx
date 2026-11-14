import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { fixedClock } from '@/domain/time/clock'
import { mondayOf } from '@/domain/time/local-date'
import type { LocalDate } from '@/domain/time/types'
import { canNavigate, isCurrentWeek, stepWeek } from '@/domain/time/week'
import { CalendarHeader, type CalendarHeaderProps } from './CalendarHeader'

const clock = fixedClock('2026-11-10T12:00:00.000Z')
const ZONE = 'UTC'

function props(overrides: Partial<CalendarHeaderProps> = {}): CalendarHeaderProps {
  return {
    monday: '2026-11-09',
    locale: 'en',
    isCurrentWeek: false,
    canPrev: true,
    canNext: true,
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
    ...overrides,
  }
}

/** Wires the header to real navigation logic. */
function Harness({ start }: { start: LocalDate }) {
  const [monday, setMonday] = useState<LocalDate>(start)
  return (
    <CalendarHeader
      monday={monday}
      locale="en"
      isCurrentWeek={isCurrentWeek(monday, ZONE, clock)}
      canPrev={canNavigate(monday, 'previous')}
      canNext={canNavigate(monday, 'next')}
      onPrev={() => setMonday(stepWeek(monday, 'previous'))}
      onNext={() => setMonday(stepWeek(monday, 'next'))}
      onToday={() => setMonday(mondayOf('2026-11-10'))}
    />
  )
}

describe('CalendarHeader', () => {
  it('[R1.3] shows the header text and has no date picker [R1.9]', () => {
    render(<CalendarHeader {...props()} />)
    expect(screen.getByTestId('week-header-text')).toHaveTextContent('November 2026 — Nov 9–15')
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.queryByLabelText(/date/i)).toBeNull()
  })

  it('[R2.1-R2.3] click fires previous, next and Today', async () => {
    const p = props()
    render(<CalendarHeader {...p} />)
    await userEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    await userEvent.click(screen.getByRole('button', { name: 'Today' }))
    expect(p.onPrev).toHaveBeenCalledTimes(1)
    expect(p.onNext).toHaveBeenCalledTimes(1)
    expect(p.onToday).toHaveBeenCalledTimes(1)
  })

  it('[R2.10] Enter and Space activate the controls', async () => {
    const p = props()
    render(<CalendarHeader {...p} />)
    const prev = screen.getByRole('button', { name: 'Previous week' })
    prev.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(p.onPrev).toHaveBeenCalledTimes(2)
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Today' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Next week' })).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(p.onToday).toHaveBeenCalledTimes(1)
    expect(p.onNext).toHaveBeenCalledTimes(1)
  })

  it('[R2.4] Today is inactive on the current week, explained, and does nothing', async () => {
    const p = props({ isCurrentWeek: true })
    render(<CalendarHeader {...p} />)
    const today = screen.getByRole('button', { name: 'Today' })
    expect(today).toHaveAttribute('aria-disabled', 'true')
    expect(today).toHaveAccessibleDescription('You are already viewing the current week.')
    await userEvent.click(today)
    today.focus()
    await userEvent.keyboard('{Enter}')
    expect(p.onToday).not.toHaveBeenCalled()
  })

  it('[R2.4] Today is active on another week', () => {
    render(<CalendarHeader {...props()} />)
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-disabled', 'false')
  })

  it('[R2.9] controls at a navigation limit are inactive with an explanation', async () => {
    const p = props({ canPrev: false, canNext: false })
    render(<CalendarHeader {...p} />)
    const prev = screen.getByRole('button', { name: 'Previous week' })
    const next = screen.getByRole('button', { name: 'Next week' })
    expect(prev).toHaveAttribute('aria-disabled', 'true')
    expect(prev).toHaveAccessibleDescription(/earliest week/)
    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(next).toHaveAccessibleDescription(/latest week/)
    await userEvent.click(prev)
    await userEvent.click(next)
    expect(p.onPrev).not.toHaveBeenCalled()
    expect(p.onNext).not.toHaveBeenCalled()
  })

  it('[R21.6] the polite live region content changes on navigation', async () => {
    render(<Harness start="2026-11-09" />)
    const live = screen.getByTestId('week-header-text')
    expect(live).toHaveAttribute('aria-live', 'polite')
    expect(live).toHaveTextContent('November 2026 — Nov 9–15')
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(live).toHaveTextContent('November 2026 — Nov 16–22')
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(live).toHaveTextContent('November 2026 — Nov 23–29')
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(live).toHaveTextContent('Nov–Dec 2026 — Nov 30–Dec 6')
  })

  it('Today returns to the current week and becomes inactive', async () => {
    render(<Harness start="2026-11-30" />)
    const today = screen.getByRole('button', { name: 'Today' })
    expect(today).toHaveAttribute('aria-disabled', 'false')
    await userEvent.click(today)
    expect(screen.getByTestId('week-header-text')).toHaveTextContent('November 2026 — Nov 9–15')
    expect(today).toHaveAttribute('aria-disabled', 'true')
  })
})
