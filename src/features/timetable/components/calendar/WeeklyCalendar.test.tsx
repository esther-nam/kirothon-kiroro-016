import { act, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppProviders } from '@/app/providers'
import { fixedClock } from '@/domain/time/clock'
import type { PreferencesRow } from '../../data/types'
import { MockRepository } from '../../data/mock/mock-repository'
import { useTimetableUiStore } from '../../store/ui-store'
import { WeeklyCalendar } from './WeeklyCalendar'
import { initialScrollTop } from './grid-geometry'

const clock = fixedClock('2026-11-10T12:00:00.000Z')
const scrollTops = new WeakMap<Element, number>()
const scrollWrites: number[] = []
let proto: {
  scrollTop?: PropertyDescriptor
  scrollHeight?: PropertyDescriptor
  clientHeight?: PropertyDescriptor
}

beforeEach(() => {
  proto = {
    scrollTop: Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop'),
    scrollHeight: Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight'),
    clientHeight: Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight'),
  }
  scrollWrites.length = 0
  Object.defineProperty(Element.prototype, 'scrollTop', {
    configurable: true,
    get() {
      return scrollTops.get(this as Element) ?? 0
    },
    set(v: number) {
      scrollWrites.push(v)
      scrollTops.set(this as Element, v)
    },
  })
  Object.defineProperty(Element.prototype, 'scrollHeight', { configurable: true, get: () => 1500 })
  Object.defineProperty(Element.prototype, 'clientHeight', { configurable: true, get: () => 600 })
  useTimetableUiStore.setState({ visibleMonday: '2026-11-09' })
})

afterEach(() => {
  for (const key of ['scrollTop', 'scrollHeight', 'clientHeight'] as const) {
    const original = proto[key]
    if (original) Object.defineProperty(Element.prototype, key, original)
    else delete (Element.prototype as unknown as Record<string, unknown>)[key]
  }
})

async function renderCalendar(prefs: Partial<PreferencesRow> = {}) {
  const repository = new MockRepository({ clock })
  await repository.patchPreferences({ timeZone: 'UTC', ...prefs })
  render(
    <AppProviders repository={repository}>
      <WeeklyCalendar clock={clock} />
    </AppProviders>,
  )
  await screen.findByTestId('grid-scroll')
  await waitFor(() => expect(scrollWrites.length).toBeGreaterThan(0))
}

const labels = () =>
  Array.from(document.querySelectorAll('[data-slot="time-gutter"] span')).map((e) => e.textContent)

describe('WeeklyCalendar', () => {
  it('[R1.1, R1.8] shows seven columns Monday to Sunday with weekday and day number', async () => {
    await renderCalendar()
    const headers = screen.getAllByRole('columnheader')
    expect(headers.map((h) => h.getAttribute('data-date'))).toEqual([
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
    ])
    expect(headers[0]).toHaveTextContent('Mon9')
    expect(headers[6]).toHaveTextContent('Sun15')
    expect(headers[1]).toHaveAttribute('aria-current', 'date')
    expect(document.querySelectorAll('[data-slot="day-column"]')).toHaveLength(7)
  })

  it.each<[15 | 30 | 60, number, string]>([
    [15, 96, '00:15'],
    [30, 48, '00:30'],
    [60, 24, '01:00'],
  ])('[R3.2] labels at %i minutes (24h)', async (intervalMinutes, count, second) => {
    await renderCalendar({ intervalMinutes })
    const l = labels()
    expect(l).toHaveLength(count)
    expect(l[0]).toBe('00:00')
    expect(l[1]).toBe(second)
    expect(l.at(-1)).not.toBe('24:00')
  })

  it('[R3.2] labels follow the 12-hour format', async () => {
    await renderCalendar({ intervalMinutes: 60, timeFormat: '12h' })
    const l = labels()
    expect(l[0]).toBe('12:00 AM')
    expect(l[13]).toBe('1:00 PM')
  })

  it('[R3.2] Kathmandu 30-minute rows sit at :00 and :30 local time', async () => {
    await renderCalendar({ timeZone: 'Asia/Kathmandu', intervalMinutes: 30 })
    const minutes = Array.from(document.querySelectorAll('[data-slot="time-gutter"] span')).map(
      (e) => Number(e.getAttribute('data-minute')),
    )
    expect(minutes.every((m) => m % 30 === 0)).toBe(true)
    const column = document.querySelector<HTMLElement>('[data-slot="day-column"]')!
    expect(column.style.backgroundSize).toBe('100% 60px, 100% 30px')
  })

  it('[R3.2] grid lines are CSS on the column, with 1 px per minute over 24 hours', async () => {
    await renderCalendar({ intervalMinutes: 15 })
    const column = document.querySelector<HTMLElement>('[data-slot="day-column"]')!
    expect(column.style.height).toBe('1440px')
    expect(column.style.backgroundImage).toContain('linear-gradient')
    // Only event blocks and overflow controls are children: no per-row elements.
    for (const child of Array.from(column.children)) {
      expect(['event-block', 'overflow-indicator']).toContain(child.getAttribute('data-slot'))
    }
  })

  it('[R3.7, R3.8, R3.9] header row, gutter and scroller are sticky or scrollable', async () => {
    await renderCalendar()
    expect(screen.getByTestId('grid-scroll').className).toContain('overflow-auto')
    expect(document.querySelector('[data-slot="day-header-row"]')!.className).toContain(
      'sticky top-0',
    )
    expect(document.querySelector('[data-slot="time-gutter"]')!.className).toContain(
      'sticky left-0',
    )
    const scroller = screen.getByTestId('grid-scroll')
    expect(within(scroller).queryByTestId('week-header-text')).toBeNull()
    expect(screen.getByTestId('week-header-text')).toBeInTheDocument()
  })

  it('[R3.10] scrolls once to the wake-up row on first render (420 px)', async () => {
    await renderCalendar()
    expect(scrollWrites).toEqual([420])
  })

  it('[R3.10] clamps the initial scroll to the maximum', () => {
    expect(initialScrollTop('07:00', 1, 1500, 600)).toBe(420)
    expect(initialScrollTop('23:30', 1, 1500, 600)).toBe(900)
    expect(initialScrollTop('07:00', 1, 100, 600)).toBe(0)
  })

  it('[R2.8, R3.17] never scrolls programmatically after the first render', async () => {
    await renderCalendar()
    const scroller = screen.getByTestId('grid-scroll')
    scroller.scrollTop = 300
    scrollWrites.length = 0
    act(() => useTimetableUiStore.getState().goNext())
    await waitFor(() =>
      expect(document.querySelector('[data-slot="day-column"]')).toHaveAttribute(
        'data-date',
        '2026-11-16',
      ),
    )
    expect(scroller.scrollTop).toBe(300)
    expect(screen.getByTestId('grid-scroll')).toBe(scroller)
    expect(scrollWrites).toEqual([])
  })

  it('[R19.5] keeps the DOM small for 15-minute rows over 24 hours', async () => {
    await renderCalendar({ intervalMinutes: 15 })
    expect(document.querySelectorAll('*').length).toBeLessThan(220)
  })
})
