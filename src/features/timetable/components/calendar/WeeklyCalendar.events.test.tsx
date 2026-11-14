import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppProviders } from '@/app/providers'
import { fixedClock } from '@/domain/time/clock'
import { MockRepository } from '../../data/mock/mock-repository'
import { MockStore, type StoredEvent } from '../../data/mock/mock-store'
import { createSeedData, instantAt } from '../../data/mock/seed'
import { usePreferences } from '../../hooks/usePreferences'
import { useTimetableUiStore } from '../../store/ui-store'
import { WeeklyCalendar } from './WeeklyCalendar'

const clock = fixedClock('2026-11-10T12:00:00.000Z')

beforeEach(() => {
  useTimetableUiStore.setState({ visibleMonday: '2026-11-09', selectedOccurrenceKey: null })
})

function setSlot(event: StoredEvent, startsAt: string, endsAt: string) {
  const segment = event.segments[0]!
  segment.slots = [{ id: 'slot-test', position: 0, startsAt, endsAt }]
}

const block = (title: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-slot="event-block"]')).find((b) =>
    b.textContent?.includes(title),
  )
const columnOf = (el: Element) => el.closest('[data-slot="day-column"]')?.getAttribute('data-date')

async function setup(zone: string) {
  const repository = new MockRepository({ clock })
  await repository.patchPreferences({ timeZone: zone })
  const view = render(
    <AppProviders repository={repository}>
      <WeeklyCalendar clock={clock} />
    </AppProviders>,
  )
  return { repository, ...view }
}

describe('WeeklyCalendar events', () => {
  it('[R3.3] seeded events render at exact positions (12:20 to 13:15)', async () => {
    await setup('UTC')
    await waitFor(() => expect(block('Lunch with Sam')).toBeDefined())
    const lunch = block('Lunch with Sam')!
    expect(columnOf(lunch)).toBe('2026-11-12')
    expect(lunch.style.top).toBe('740px')
    expect(lunch.style.height).toBe('55px')
  })

  it('[R4.3, R4.6] adjacent blocks do not overlap; a crowded cluster uses the overflow indicator', async () => {
    await setup('UTC')
    await waitFor(() => expect(block('Lab')).toBeDefined())
    expect(block('Lab')!.style.width).toBe('calc(100% - 4px)')
    const overflow = await screen.findByRole('button', { name: /more events?, / })
    expect(overflow).toHaveTextContent(/^\+\d+ more$/)
    expect(columnOf(overflow)).toBe('2026-11-10')
  })

  it('[R4.10] selecting a block marks it selected', async () => {
    await setup('UTC')
    await waitFor(() => expect(block('Dentist')).toBeDefined())
    act(() => block('Dentist')!.click())
    expect(block('Dentist')).toHaveAttribute('data-state', 'selected')
  })

  it('[R14.2, R14.4, R14.5] Seoul to Los Angeles keeps Nov 9-15 and moves the event; switching back restores it', async () => {
    const data = createSeedData(clock, 'Asia/Seoul')
    const standup = data.events.find((e) => e.row.id === 'ev-standup')!
    // Monday 2026-11-09 08:00 Seoul is 2026-11-08T23:00Z.
    const startsAt = instantAt('2026-11-09', 8 * 60, 'Asia/Seoul')
    expect(startsAt).toBe('2026-11-08T23:00:00.000Z')
    setSlot(standup, startsAt, instantAt('2026-11-09', 9 * 60, 'Asia/Seoul'))
    const repository = new MockRepository({ clock, store: new MockStore(data) })
    await repository.patchPreferences({ timeZone: 'Asia/Seoul' })
    let setZone: (zone: string) => void = () => {}
    function Switcher() {
      const { update } = usePreferences()
      setZone = (zone) => void update({ timeZone: zone })
      return null
    }
    render(
      <AppProviders repository={repository}>
        <Switcher />
        <WeeklyCalendar clock={clock} />
      </AppProviders>,
    )
    await waitFor(() => expect(block('Team standup')).toBeDefined())
    expect(columnOf(block('Team standup')!)).toBe('2026-11-09')
    expect(block('Team standup')!.style.top).toBe('480px')

    act(() => setZone('America/Los_Angeles'))
    // Thursday 12:20 Seoul is Wednesday 19:20 in Los Angeles: loaded and moved.
    await waitFor(() => expect(block('Lunch with Sam')?.style.top).toBe('1160px'))
    expect(columnOf(block('Lunch with Sam')!)).toBe('2026-11-11')
    expect(block('Team standup')).toBeUndefined()
    expect(useTimetableUiStore.getState().visibleMonday).toBe('2026-11-09')
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('data-date', '2026-11-09')

    act(() => setZone('Asia/Seoul'))
    await waitFor(() => expect(block('Team standup')).toBeDefined())
    expect(columnOf(block('Team standup')!)).toBe('2026-11-09')
    expect(block('Team standup')!.style.top).toBe('480px')
  })

  it('[R14.5] in Los Angeles the event shows Sunday 15:00 on the previous week', async () => {
    const data = createSeedData(clock, 'Asia/Seoul')
    const standup = data.events.find((e) => e.row.id === 'ev-standup')!
    setSlot(standup, '2026-11-08T23:00:00.000Z', '2026-11-09T00:00:00.000Z')
    const repository = new MockRepository({ clock, store: new MockStore(data) })
    await repository.patchPreferences({ timeZone: 'America/Los_Angeles' })
    useTimetableUiStore.setState({ visibleMonday: '2026-11-02' })
    render(
      <AppProviders repository={repository}>
        <WeeklyCalendar clock={clock} />
      </AppProviders>,
    )
    await waitFor(() => expect(block('Team standup')).toBeDefined())
    expect(columnOf(block('Team standup')!)).toBe('2026-11-08')
    expect(block('Team standup')!.style.top).toBe('900px')
  })
})
