import type { EventBundle, ParticipantStatus } from '@/features/timetable/data/types'
import type { Instant } from '../time/types'

/** One concrete block of an event (design 3.5). */
export interface Occurrence {
  /** One-time: `eventId:slot:<slotId>` (design 3.5). */
  key: string
  eventId: string
  title: string
  startsAt: Instant
  endsAt: Instant
  /** Anchor timezone of the event (IANA, immutable). */
  timeZone: string
  isRecurring: boolean
  myStatus: ParticipantStatus
  myTagId: string | null
}

export interface ExpandWindow {
  /** Inclusive. */
  start: Instant
  /** Exclusive. */
  end: Instant
}

/** Order of design 3.7 step 4: `startsAt`, then `endsAt` descending, then key. */
export function compareOccurrences(a: Occurrence, b: Occurrence): number {
  const byStart = Date.parse(a.startsAt) - Date.parse(b.startsAt)
  if (byStart !== 0) return byStart
  const byEnd = Date.parse(b.endsAt) - Date.parse(a.endsAt)
  if (byEnd !== 0) return byEnd
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
}

/**
 * Expands one bundle inside `window` (design 3.7).
 * Only the one-time branch exists so far: each slot that intersects the window
 * (`startsAt < windowEnd AND endsAt > windowStart`) is exactly one occurrence.
 * Series expansion arrives with task 6.2.
 */
export function expandBundle(bundle: EventBundle, window: ExpandWindow): Occurrence[] {
  if (bundle.event.isRecurring) return []

  const windowStart = Date.parse(window.start)
  const windowEnd = Date.parse(window.end)
  const occurrences: Occurrence[] = []

  for (const segment of bundle.segments) {
    for (const slot of segment.slots) {
      if (!('startsAt' in slot)) continue
      if (!(Date.parse(slot.startsAt) < windowEnd && Date.parse(slot.endsAt) > windowStart)) continue
      occurrences.push({
        key: `${bundle.event.id}:slot:${slot.id}`,
        eventId: bundle.event.id,
        title: segment.title,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        timeZone: bundle.event.timeZone,
        isRecurring: false,
        myStatus: bundle.myStatus,
        myTagId: bundle.myTagId,
      })
    }
  }
  return occurrences.sort(compareOccurrences)
}

/** Expands every bundle and returns one list in the order of design 3.7 step 4. */
export function expandBundles(bundles: readonly EventBundle[], window: ExpandWindow): Occurrence[] {
  return bundles.flatMap((bundle) => expandBundle(bundle, window)).sort(compareOccurrences)
}
