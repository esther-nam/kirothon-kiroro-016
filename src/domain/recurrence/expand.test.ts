import { describe, expect, it } from 'vitest'
import type { EventBundle } from '@/features/timetable/data/types'
import { expandBundle, expandBundles } from './expand'

const WINDOW = { start: '2026-11-09T00:00:00.000Z', end: '2026-11-16T00:00:00.000Z' }

function oneTime(id: string, slots: [string, string][]): EventBundle {
  return {
    event: { id, creatorId: 'u', timeZone: 'UTC', isRecurring: false, teamId: null, version: 1 },
    segments: [
      {
        id: `${id}-seg`,
        title: `Title ${id}`,
        validFrom: null,
        validUntil: null,
        slots: slots.map(([startsAt, endsAt], i) => ({ id: `s${i + 1}`, position: i, startsAt, endsAt })),
      },
    ],
    exceptions: [],
    creator: { id: 'u', displayName: 'U' },
    myStatus: 'accepted',
    myTagId: null,
    participants: [],
  }
}

describe('expandBundle (one-time)', () => {
  it('yields exactly one occurrence per slot with the slot key', () => {
    const bundle = oneTime('e1', [
      ['2026-11-09T09:00:00.000Z', '2026-11-09T10:00:00.000Z'],
      ['2026-11-11T09:00:00.000Z', '2026-11-11T10:00:00.000Z'],
    ])
    const result = expandBundle(bundle, WINDOW)
    expect(result.map((o) => o.key)).toEqual(['e1:slot:s1', 'e1:slot:s2'])
    expect(result[0]).toMatchObject({ title: 'Title e1', timeZone: 'UTC', isRecurring: false })
  })

  it('uses half-open intersection: touching blocks are excluded, crossing blocks included', () => {
    const bundle = oneTime('e2', [
      ['2026-11-08T23:00:00.000Z', '2026-11-09T00:00:00.000Z'],
      ['2026-11-08T23:00:00.000Z', '2026-11-09T00:01:00.000Z'],
      ['2026-11-16T00:00:00.000Z', '2026-11-16T01:00:00.000Z'],
      ['2026-11-15T23:59:00.000Z', '2026-11-16T01:00:00.000Z'],
    ])
    expect(expandBundle(bundle, WINDOW).map((o) => o.key)).toEqual(['e2:slot:s2', 'e2:slot:s4'])
  })

  it('sorts by start, then end descending, then key', () => {
    const a = oneTime('a', [['2026-11-10T09:00:00.000Z', '2026-11-10T10:00:00.000Z']])
    const b = oneTime('b', [['2026-11-10T09:00:00.000Z', '2026-11-10T11:00:00.000Z']])
    const c = oneTime('c', [['2026-11-09T09:00:00.000Z', '2026-11-09T10:00:00.000Z']])
    expect(expandBundles([a, b, c], WINDOW).map((o) => o.eventId)).toEqual(['c', 'b', 'a'])
  })
})
