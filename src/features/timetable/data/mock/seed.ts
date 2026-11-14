import { DateTime } from 'luxon'
import { addDays, mondayOf } from '@/domain/time/local-date'
import type { Clock } from '@/domain/time/clock'
import type { Instant, LocalDate } from '@/domain/time/types'
import type { Tag, TagColorKey } from '../types'
import type { MockStoreData, MockUser, StoredEvent, StoredParticipant } from './mock-store'

export const USER_A: MockUser = { id: 'user-a', displayName: 'Ana Kim', username: 'ana' }
export const USER_B: MockUser = { id: 'user-b', displayName: 'Ben Ortiz', username: 'ben' }
const USER_C: MockUser = { id: 'user-c', displayName: 'Cleo Park', username: 'cleo' }
const USER_D: MockUser = { id: 'user-d', displayName: 'Dev Rao', username: 'dev' }

export const TAG_WORK = 'tag-a-work'
export const TAG_STUDY = 'tag-a-study'
export const TAG_PERSONAL = 'tag-a-personal'
export const TAG_GYM = 'tag-a-gym'
export const TAG_SOCIAL = 'tag-a-social'

function tag(id: string, name: string, colorKey: TagColorKey): Tag {
  return { id, name, colorKey }
}

/** Instant of `minute` (0..1440) on `date` in `zone`. 1440 is 00:00 of the next day. */
export function instantAt(date: LocalDate, minute: number, zone: string): Instant {
  const day = DateTime.fromISO(date, { zone }).startOf('day')
  const local =
    minute >= 1440
      ? day.plus({ days: 1 })
      : day.set({ hour: Math.floor(minute / 60), minute: minute % 60 })
  return local.toUTC().toISO() ?? ''
}

const hm = (h: number, m = 0): number => h * 60 + m

interface OneTimeSlot {
  date: LocalDate
  start: number
  end: number
}

interface EventSpec {
  id: string
  title: string
  slots: OneTimeSlot[]
  creator?: MockUser
  tagId?: string | null
  participants?: StoredParticipant[]
}

/** Seed data for the one-time cases of R18.3, relative to the current week of `clock` in `zone`. */
export function createSeedData(clock: Clock, zone = 'UTC'): MockStoreData {
  const today = DateTime.fromISO(clock.now(), { zone }).toFormat('yyyy-LL-dd')
  const monday = mondayOf(today)
  const day = (offset: number): LocalDate => addDays(monday, offset)

  const build = (spec: EventSpec): StoredEvent => {
    const creator = spec.creator ?? USER_A
    return {
      row: {
        id: spec.id,
        creatorId: creator.id,
        timeZone: zone,
        isRecurring: false,
        teamId: null,
        version: 1,
      },
      segments: [
        {
          id: `${spec.id}-seg`,
          title: spec.title,
          validFrom: null,
          validUntil: null,
          slots: spec.slots.map((s, i) => ({
            id: `${spec.id}-slot-${i + 1}`,
            position: i,
            startsAt: instantAt(s.date, s.start, zone),
            endsAt: instantAt(s.date, s.end, zone),
          })),
        },
      ],
      exceptions: [],
      creator,
      participants: spec.participants ?? [],
      tagByUser: { [creator.id]: spec.tagId ?? null },
    }
  }

  const one = (
    id: string,
    title: string,
    offset: number,
    start: number,
    end: number,
    tagId?: string,
  ) => build({ id, title, slots: [{ date: day(offset), start, end }], ...(tagId ? { tagId } : {}) })

  const events: StoredEvent[] = [
    // Current-week events.
    one('ev-standup', 'Team standup', 0, hm(9), hm(9, 30), TAG_WORK),
    // Overlap cluster of 6 on Tuesday.
    one('ev-cluster-1', 'Design review', 1, hm(10), hm(11, 30), TAG_WORK),
    one('ev-cluster-2', 'Code review', 1, hm(10), hm(11), TAG_WORK),
    one('ev-cluster-3', 'Sprint planning', 1, hm(10, 15), hm(11, 15), TAG_WORK),
    one('ev-cluster-4', 'Workshop', 1, hm(10, 30), hm(12), TAG_STUDY),
    one('ev-cluster-5', 'Call with vendor', 1, hm(10, 45), hm(11, 45)),
    one('ev-cluster-6', 'Quick sync', 1, hm(10, 30), hm(11), TAG_PERSONAL),
    // Adjacent events on Wednesday.
    one('ev-adjacent-1', 'Lecture', 2, hm(9), hm(10), TAG_STUDY),
    one('ev-adjacent-2', 'Lab', 2, hm(10), hm(11), TAG_STUDY),
    one('ev-adjacent-3', 'Review session', 2, hm(11), hm(12), TAG_STUDY),
    // 12:20 to 13:15.
    one('ev-lunch', 'Lunch with Sam', 3, hm(12, 20), hm(13, 15), TAG_SOCIAL),
    // One-time event with several dates.
    build({
      id: 'ev-study-group',
      title: 'Study group',
      tagId: TAG_STUDY,
      slots: [0, 2, 4].map((offset) => ({ date: day(offset), start: hm(18), end: hm(19, 30) })),
    }),
    // Outside default visible hours (08:00 to 22:00).
    one('ev-early-run', 'Early run', 4, hm(6), hm(7, 30), TAG_GYM),
    one('ev-late-reading', 'Late reading', 4, hm(21, 30), hm(23), TAG_PERSONAL),
    // Near 00:00 and 24:00.
    one('ev-after-midnight', 'Night shift handover', 5, hm(0, 30), hm(2)),
    one('ev-until-midnight', 'Night shift', 5, hm(23), 1440, TAG_WORK),
    // Untagged event.
    one('ev-dentist', 'Dentist', 6, hm(15), hm(16)),
    // Shared event with pending, accepted and declined participants.
    build({
      id: 'ev-shared',
      title: 'Project kickoff',
      tagId: TAG_WORK,
      slots: [{ date: day(2), start: hm(14), end: hm(15) }],
      participants: [
        { ...USER_B, status: 'accepted' },
        { ...USER_C, status: 'pending' },
        { ...USER_D, status: 'declined' },
      ],
    }),
    // User B's own events. User A must never see these.
    build({
      id: 'ev-b-piano',
      title: 'Piano lesson',
      creator: USER_B,
      tagId: 'tag-b-music',
      slots: [{ date: day(1), start: hm(10), end: hm(11) }],
    }),
    build({
      id: 'ev-b-boundary',
      title: 'Ben secret errand',
      creator: USER_B,
      slots: [{ date: day(3), start: hm(8), end: hm(9) }],
    }),
  ]

  // Ben links his own tag to the shared event.
  const shared = events.find((e) => e.row.id === 'ev-shared')
  if (shared) shared.tagByUser[USER_B.id] = 'tag-b-music'

  return {
    users: [USER_A, USER_B],
    events,
    tags: {
      [USER_A.id]: [
        tag(TAG_WORK, 'Work', 'blue'),
        tag(TAG_STUDY, 'Study', 'deep_purple'),
        tag(TAG_PERSONAL, 'Personal', 'magenta'),
        tag(TAG_GYM, 'Gym', 'orange'),
        tag(TAG_SOCIAL, 'Social', 'yellow'),
      ],
      [USER_B.id]: [tag('tag-b-music', 'Music', 'magenta')],
    },
    preferences: {},
  }
}
