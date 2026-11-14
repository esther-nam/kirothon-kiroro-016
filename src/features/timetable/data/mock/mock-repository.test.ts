import { afterEach, describe, expect, it, vi } from 'vitest'
import { fixedClock } from '@/domain/time/clock'
import type { EventBundle } from '../types'
import { MockRepository } from './mock-repository'
import { MockStore } from './mock-store'
import { createSeedData, instantAt, USER_A, USER_B } from './seed'
import { createSimulation } from './simulate'

// Wednesday 2026-11-11. The week is Mon 2026-11-09 to Sun 2026-11-15.
const clock = fixedClock('2026-11-11T12:00:00.000Z')
const WEEK = { from: '2026-11-09T00:00:00.000Z', to: '2026-11-16T00:00:00.000Z' }

function setup() {
  const store = new MockStore(createSeedData(clock))
  const repo = new MockRepository({ store, simulation: createSimulation() })
  return { store, repo }
}

async function weekOf(repo: MockRepository): Promise<EventBundle[]> {
  const result = await repo.getEventsInRange(WEEK)
  if (!result.ok) throw new Error('expected ok')
  return result.value
}

const titles = (bundles: EventBundle[]) => bundles.map((b) => b.segments[0]?.title).sort()

afterEach(() => {
  vi.useRealTimers()
})

describe('getEventsInRange', () => {
  it('[R18.11] uses half-open intervals', async () => {
    const { repo } = setup()
    // "Lunch with Sam" is Thu 12:20 to 13:15 UTC.
    const lunch = (r: Awaited<ReturnType<typeof repo.getEventsInRange>>) =>
      r.ok && r.value.some((b) => b.event.id === 'ev-lunch')

    // Range ending exactly at the start excludes it.
    expect(
      lunch(
        await repo.getEventsInRange({
          from: '2026-11-12T00:00:00.000Z',
          to: '2026-11-12T12:20:00.000Z',
        }),
      ),
    ).toBe(false)
    // One minute later includes it.
    expect(
      lunch(
        await repo.getEventsInRange({
          from: '2026-11-12T00:00:00.000Z',
          to: '2026-11-12T12:21:00.000Z',
        }),
      ),
    ).toBe(true)
    // Range starting exactly at the end excludes it.
    expect(
      lunch(
        await repo.getEventsInRange({
          from: '2026-11-12T13:15:00.000Z',
          to: '2026-11-12T20:00:00.000Z',
        }),
      ),
    ).toBe(false)
    // One minute earlier includes it.
    expect(
      lunch(
        await repo.getEventsInRange({
          from: '2026-11-12T13:14:00.000Z',
          to: '2026-11-12T20:00:00.000Z',
        }),
      ),
    ).toBe(true)
  })

  it('[R18.11] returns only events inside the requested week', async () => {
    const { repo } = setup()
    const next = await repo.getEventsInRange({
      from: '2026-11-16T00:00:00.000Z',
      to: '2026-11-23T00:00:00.000Z',
    })
    expect(next).toEqual({ ok: true, value: [] })
  })

  it('[R18.11] includes a multi-slot event when any slot is in range', async () => {
    const { repo } = setup()
    const result = await repo.getEventsInRange({
      from: '2026-11-13T00:00:00.000Z',
      to: '2026-11-14T00:00:00.000Z',
    })
    expect(result.ok && result.value.some((b) => b.event.id === 'ev-study-group')).toBe(true)
  })

  it("[R17.2] never returns another user's events", async () => {
    const { repo } = setup()
    const own = await weekOf(repo)
    expect(titles(own)).not.toContain('Piano lesson')
    expect(own.every((b) => b.creator.id === USER_A.id || b.myStatus !== 'pending')).toBe(true)

    const ben = await weekOf(repo.forUser(USER_B.id))
    expect(titles(ben)).toContain('Piano lesson')
    expect(titles(ben)).not.toContain('Dentist')
  })

  it("[R17.2] hides the other user's tag from a participant", async () => {
    const { repo } = setup()
    const asAna = await repo.getEvent('ev-shared')
    const asBen = await repo.forUser(USER_B.id).getEvent('ev-shared')
    expect(asAna.ok && asAna.value.myTagId).toBe('tag-a-work')
    expect(asBen.ok && asBen.value.myTagId).toBe('tag-b-music')
  })
})

describe('getEvent', () => {
  it("[R17.2] returns NOT_FOUND for another user's event and for a missing one alike", async () => {
    const { repo } = setup()
    const foreign = await repo.getEvent('ev-b-piano')
    const missing = await repo.getEvent('does-not-exist')
    expect(foreign).toEqual({ ok: false, error: { code: 'NOT_FOUND' } })
    expect(missing).toEqual(foreign)
  })

  it('[R18.2] returns a copy, so callers cannot change stored rows', async () => {
    const { repo } = setup()
    const first = await repo.getEvent('ev-dentist')
    if (!first.ok) throw new Error('expected ok')
    first.value.event.version = 99
    const second = await repo.getEvent('ev-dentist')
    expect(second.ok && second.value.event.version).toBe(1)
  })

  it('[R17.4] shows the creator every status, and an accepted participant only accepted users', async () => {
    const { repo } = setup()
    const creator = await repo.getEvent('ev-shared')
    const guest = await repo.forUser(USER_B.id).getEvent('ev-shared')
    if (!creator.ok || !guest.ok) throw new Error('expected ok')
    expect(creator.value.participants.map((p) => p.status).sort()).toEqual([
      'accepted',
      'declined',
      'pending',
    ])
    expect(guest.value.participants).toEqual([
      { userId: 'user-b', displayName: 'Ben Ortiz', username: 'ben' },
    ])
  })
})

describe('preferences', () => {
  it('[R18.2] starts empty and merges patches per field', async () => {
    const { repo } = setup()
    const initial = await repo.getPreferences()
    expect(initial.ok && initial.value.timeFormat).toBeNull()

    await repo.patchPreferences({ timeFormat: '12h' })
    const second = await repo.patchPreferences({ intervalMinutes: 30 })
    expect(second).toEqual({
      ok: true,
      value: {
        timeZone: null,
        timeFormat: '12h',
        intervalMinutes: 30,
        wakeUpTime: null,
        bedtime: null,
      },
    })
  })

  it('[R17.2] keeps preferences private per user', async () => {
    const { repo } = setup()
    await repo.patchPreferences({ timeZone: 'Asia/Seoul' })
    const ben = await repo.forUser(USER_B.id).getPreferences()
    expect(ben.ok && ben.value.timeZone).toBeNull()
  })

  it('[R18.2] resetPreferences clears every field', async () => {
    const { repo } = setup()
    await repo.patchPreferences({ timeFormat: '24h', wakeUpTime: '06:00' })
    const reset = await repo.resetPreferences()
    expect(reset.ok && Object.values(reset.value).every((v) => v === null)).toBe(true)
  })
})

describe('simulation', () => {
  it('[R18.3] failure switch returns UNAVAILABLE on reads and writes', async () => {
    const { repo } = setup()
    repo.simulation.fail = true
    const calls = [
      await repo.getEventsInRange(WEEK),
      await repo.getEvent('ev-dentist'),
      await repo.getPreferences(),
      await repo.patchPreferences({ timeFormat: '12h' }),
      await repo.resetPreferences(),
    ]
    for (const call of calls) {
      expect(call.ok).toBe(false)
      if (!call.ok) expect(call.error.code).toBe('UNAVAILABLE')
    }
    repo.simulation.fail = false
    expect((await repo.getPreferences()).ok).toBe(true)
  })

  it('[R18.3] stale-version switch rejects writes only and leaves data unchanged', async () => {
    const { repo } = setup()
    repo.simulation.staleVersion = true
    const write = await repo.patchPreferences({ timeFormat: '12h' })
    expect(write.ok === false && write.error.code).toBe('STALE_VERSION')
    expect((await repo.getPreferences()).ok).toBe(true)
    repo.simulation.staleVersion = false
    const after = await repo.getPreferences()
    expect(after.ok && after.value.timeFormat).toBeNull()
  })

  it('[R18.3] latency delays the response', async () => {
    vi.useFakeTimers()
    const { repo } = setup()
    repo.simulation.latencyMs = 500
    let done = false
    const pending = repo.getPreferences().then((r) => {
      done = true
      return r
    })
    await vi.advanceTimersByTimeAsync(499)
    expect(done).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect((await pending).ok).toBe(true)
  })

  it('[R18.3] unimplemented write paths report UNAVAILABLE', async () => {
    const { repo } = setup()
    const result = await repo.deleteEvent()
    expect(result.ok === false && result.error.code).toBe('UNAVAILABLE')
  })
})

describe('seed data', () => {
  it('[R18.3] covers the one-time cases', async () => {
    const { repo } = setup()
    const bundles = await weekOf(repo)
    const slots = bundles.flatMap((b) =>
      b.segments.flatMap((s) =>
        s.slots.flatMap((slot) =>
          'startsAt' in slot
            ? [{ id: b.event.id, start: Date.parse(slot.startsAt), end: Date.parse(slot.endsAt) }]
            : [],
        ),
      ),
    )
    const overlapsOf = (id: string) =>
      slots
        .filter((s) => s.id === id)
        .flatMap((a) => slots.filter((b) => b.start < a.end && a.start < b.end))

    // Cluster of at least 5 mutually-near occurrences.
    const cluster = slots.filter((s) => s.id.startsWith('ev-cluster'))
    expect(cluster.length).toBeGreaterThanOrEqual(5)
    expect(overlapsOf('ev-cluster-1').length).toBeGreaterThanOrEqual(5)

    // Adjacent: Lecture ends when Lab starts, no overlap.
    const lecture = slots.find((s) => s.id === 'ev-adjacent-1')
    const lab = slots.find((s) => s.id === 'ev-adjacent-2')
    expect(lecture?.end).toBe(lab?.start)

    // 12:20 to 13:15.
    const lunch = slots.find((s) => s.id === 'ev-lunch')
    expect(lunch && [lunch.start, lunch.end]).toEqual([
      Date.parse(instantAt('2026-11-12', 740, 'UTC')),
      Date.parse(instantAt('2026-11-12', 795, 'UTC')),
    ])

    // Multi-date one-time event, near midnight, outside hours, untagged.
    expect(slots.filter((s) => s.id === 'ev-study-group')).toHaveLength(3)
    expect(slots.some((s) => s.id === 'ev-until-midnight')).toBe(true)
    expect(slots.some((s) => s.id === 'ev-early-run')).toBe(true)
    expect(bundles.some((b) => b.myTagId === null)).toBe(true)
  })

  it('[R18.3] provides two users and tags with different colors', () => {
    const store = new MockStore(createSeedData(clock))
    expect(store.users.map((u) => u.id)).toEqual(['user-a', 'user-b'])
    const colors = new Set(store.tagsOf('user-a').map((t) => t.colorKey))
    expect(colors.size).toBeGreaterThanOrEqual(5)
  })

  it('[R18.3] places the current week events relative to the clock', async () => {
    const { repo } = setup()
    const next = new MockRepository({
      store: new MockStore(createSeedData(fixedClock('2026-11-18T12:00:00.000Z'))),
    })
    expect(titles(await weekOf(repo))).toContain('Team standup')
    const shifted = await next.getEventsInRange({
      from: '2026-11-16T00:00:00.000Z',
      to: '2026-11-23T00:00:00.000Z',
    })
    expect(shifted.ok && shifted.value.length).toBeGreaterThan(10)
  })
})
