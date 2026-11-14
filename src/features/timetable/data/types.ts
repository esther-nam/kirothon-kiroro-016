/**
 * Data contract types between the timetable UI and its data layer (design 5.1, R18.1).
 * Rows mirror the normalized shape of design 4.3, in camelCase.
 */
import type { Instant, LocalDate, MinuteOfDay, Weekday } from '@/domain/time/types'
import type { TagColorKey } from '@/features/tags/palette'

export type { TagColorKey }

/** Error codes of every repository call (design 5.1). */
export const ERROR_CODES = [
  'VALIDATION',
  'FORBIDDEN',
  'NOT_FOUND',
  'STALE_VERSION',
  'LIMIT_EXCEEDED',
  'UNAVAILABLE',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

/** Validation issue codes (design 3.11). */
export type ValidationIssueCode =
  | 'TITLE_REQUIRED'
  | 'TITLE_TOO_LONG'
  | 'SLOT_END_NOT_AFTER_START'
  | 'SLOT_START_AT_24'
  | 'SLOT_NONEXISTENT_TIME'
  | 'SLOTS_OVERLAP'
  | 'SLOT_LIMIT'
  | 'REPEAT_RANGE_INVALID'
  | 'REPEAT_RANGE_TOO_LONG'
  | 'SLOT_NO_OCCURRENCE'
  | 'WEEKDAY_REQUIRED'
  | 'DATE_REQUIRED'
  | 'PARTICIPANT_LIMIT'
  | 'TIMEZONE_INVALID'
  | 'TAG_NAME_REQUIRED'
  | 'TAG_NAME_TAKEN'
  | 'TAG_COLOR_INVALID'

export interface ValidationIssue {
  code: ValidationIssueCode
  path: string
  slotIndexes?: number[]
}

export type RepositoryError =
  | { code: 'VALIDATION'; issues: ValidationIssue[] }
  | { code: Exclude<ErrorCode, 'VALIDATION'>; message?: string }

export type Result<T, E = RepositoryError> = { ok: true; value: T } | { ok: false; error: E }

/** Participant status (design 4.5). */
export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'left'

export type InvitationResponse = 'accept' | 'decline' | 'leave'

export type Scope = 'event' | 'occurrence' | 'following' | 'series'

export interface UserSummary {
  id: string
  displayName: string
  username: string
  avatarUrl?: string
}

export interface Tag {
  id: string
  name: string
  colorKey: TagColorKey
}

export interface EventRow {
  id: string
  creatorId: string
  /** IANA name, immutable (anchor timezone). */
  timeZone: string
  isRecurring: boolean
  teamId: string | null
  version: number
}

export interface RecurrenceRuleRow {
  /** Local dates in the event timezone. */
  repeatFrom: LocalDate
  repeatUntil: LocalDate
}

/** One slot. One-time slots carry instants, recurring slots carry weekday and minutes. */
export type SlotRow =
  | { id: string; position: number; startsAt: Instant; endsAt: Instant }
  | {
      id: string
      position: number
      weekday: Weekday
      startMinute: MinuteOfDay
      endMinute: MinuteOfDay
    }

export interface SegmentRow {
  id: string
  title: string
  /** Local timestamp 'YYYY-MM-DDTHH:mm' in the event timezone. Null for one-time events. */
  validFrom: string | null
  /** Exclusive. Null means until `repeatUntil`. */
  validUntil: string | null
  slots: SlotRow[]
}

export interface ExceptionRow {
  originalDate: LocalDate
  originalStartMinute: MinuteOfDay
  kind: 'cancelled' | 'modified'
  title: string | null
  startsAt: Instant | null
  endsAt: Instant | null
}

export interface ParticipantView {
  userId: string
  displayName: string
  username: string
  /** Present only when the viewer may see statuses (creator, design 9.3). */
  status?: ParticipantStatus
}

export interface TeamRef {
  id: string
  name: string
}

/** Everything needed to expand and render one event for one viewer (design 5.1). */
export interface EventBundle {
  event: EventRow
  rule?: RecurrenceRuleRow
  segments: SegmentRow[]
  exceptions: ExceptionRow[]
  creator: { id: string; displayName: string }
  myStatus: ParticipantStatus
  myTagId: string | null
  participants: ParticipantView[]
  team?: TeamRef
}

export interface EventSlotInput {
  /** Both stay on every slot in the form (D-13); `toEventInput` drops the inactive one. */
  date?: LocalDate
  weekday?: Weekday
  startMinute: MinuteOfDay
  endMinute: MinuteOfDay
}

export interface EventInput {
  title: string
  timeZone: string
  tagId?: string
  repeat?: { from: LocalDate; until: LocalDate }
  slots: EventSlotInput[]
  participantIds: string[]
}

export interface EventPatch {
  title?: string
  tagId?: string | null
  repeat?: { from: LocalDate; until: LocalDate } | null
  slots?: EventSlotInput[]
  participantIds?: string[]
}

export interface UpdateRequest {
  eventId: string
  expectedVersion: number
  requestId: string
  scope: Scope
  /** Local start of the selected occurrence. Required for occurrence and following. */
  occurrenceKey?: string
  patch: EventPatch
  dryRun?: boolean
}

export interface DeleteRequest {
  eventId: string
  expectedVersion: number
  requestId: string
  scope: Scope
  occurrenceKey?: string
  /** Delete one slot of a one-time event instead of the event (R12.3). */
  slotId?: string
}

/** Counts only (design 6.4, R11.11). */
export interface ChangePreview {
  created: number
  removed: number
  kept: number
  exceptionsRemoved: number
  completedAffected: number
}

export interface InvitationSummary {
  eventId: string
  title: string
  timeZone: string
  creator: { id: string; displayName: string }
  slots: SlotRow[]
  participants: ParticipantView[]
}

/** One row of `timetable_preferences`. Null means "use the default" (design 4.3). */
export interface PreferencesRow {
  timeZone: string | null
  timeFormat: '12h' | '24h' | null
  intervalMinutes: 15 | 30 | 60 | null
  visibleStartHour: number | null
  visibleEndHour: number | null
}
