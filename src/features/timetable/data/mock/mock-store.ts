import type {
  EventBundle,
  EventRow,
  ExceptionRow,
  ParticipantStatus,
  ParticipantView,
  PreferencesRow,
  RecurrenceRuleRow,
  SegmentRow,
  Tag,
  TeamRef,
} from '../types'

export interface MockUser {
  id: string
  displayName: string
  username: string
  avatarUrl?: string
}

export interface StoredParticipant extends MockUser {
  status: ParticipantStatus
}

/** One event in the normalized shape of design 4.3, plus per-user tag links. */
export interface StoredEvent {
  row: EventRow
  rule?: RecurrenceRuleRow
  segments: SegmentRow[]
  exceptions: ExceptionRow[]
  creator: MockUser
  participants: StoredParticipant[]
  /** Tag id per user. Tags are private to their owner (R17.2). */
  tagByUser: Record<string, string | null>
  team?: TeamRef
}

export interface MockStoreData {
  users: MockUser[]
  events: StoredEvent[]
  /** Tags per owner id. */
  tags: Record<string, Tag[]>
  preferences: Record<string, PreferencesRow>
}

export const EMPTY_PREFERENCES: PreferencesRow = {
  timeZone: null,
  timeFormat: null,
  intervalMinutes: null,
  wakeUpTime: null,
  bedtime: null,
}

/** In-memory rows. All reads go through a viewer id, so one user never sees another's data. */
export class MockStore {
  private readonly events: Map<string, StoredEvent>
  private readonly preferences: Map<string, PreferencesRow>
  private readonly tags: Map<string, Tag[]>
  readonly users: readonly MockUser[]

  constructor(data: MockStoreData) {
    const copy = structuredClone(data)
    this.users = copy.users
    this.events = new Map(copy.events.map((e) => [e.row.id, e]))
    this.preferences = new Map(Object.entries(copy.preferences))
    this.tags = new Map(Object.entries(copy.tags))
  }

  hasUser(userId: string): boolean {
    return this.users.some((u) => u.id === userId)
  }

  /** Events the viewer may read: creator, or participant who is pending or accepted (R17.3). */
  eventsVisibleTo(userId: string): StoredEvent[] {
    return [...this.events.values()].filter((e) => canRead(e, userId))
  }

  findVisible(userId: string, eventId: string): StoredEvent | undefined {
    const event = this.events.get(eventId)
    return event && canRead(event, userId) ? event : undefined
  }

  bundleFor(userId: string, event: StoredEvent): EventBundle {
    const isCreator = event.creator.id === userId
    const mine = event.participants.find((p) => p.id === userId)
    const myStatus: ParticipantStatus = isCreator ? 'accepted' : (mine?.status ?? 'pending')
    const bundle: EventBundle = structuredClone({
      event: event.row,
      segments: event.segments,
      exceptions: event.exceptions,
      creator: { id: event.creator.id, displayName: event.creator.displayName },
      myStatus,
      myTagId: event.tagByUser[userId] ?? null,
      participants: visibleParticipants(event, isCreator, myStatus),
    })
    if (event.rule) bundle.rule = structuredClone(event.rule)
    if (event.team) bundle.team = structuredClone(event.team)
    return bundle
  }

  getPreferences(userId: string): PreferencesRow {
    return { ...(this.preferences.get(userId) ?? EMPTY_PREFERENCES) }
  }

  setPreferences(userId: string, row: PreferencesRow): PreferencesRow {
    this.preferences.set(userId, { ...row })
    return { ...row }
  }

  tagsOf(userId: string): Tag[] {
    return structuredClone(this.tags.get(userId) ?? [])
  }

  addTag(userId: string, tag: Tag): void {
    this.tags.set(userId, [...(this.tags.get(userId) ?? []), { ...tag }])
  }

  replaceTag(userId: string, tag: Tag): void {
    const list = this.tags.get(userId) ?? []
    this.tags.set(
      userId,
      list.map((t) => (t.id === tag.id ? { ...tag } : t)),
    )
  }

  /** Removes the tag and only the assignments of this owner. Events stay unchanged (R22.6). */
  removeTag(userId: string, tagId: string): void {
    this.tags.set(
      userId,
      (this.tags.get(userId) ?? []).filter((t) => t.id !== tagId),
    )
    for (const event of this.events.values()) {
      if (event.tagByUser[userId] === tagId) event.tagByUser[userId] = null
    }
  }
}

function canRead(event: StoredEvent, userId: string): boolean {
  if (event.creator.id === userId) return true
  const mine = event.participants.find((p) => p.id === userId)
  return mine !== undefined && (mine.status === 'pending' || mine.status === 'accepted')
}

/** R17.4: the creator sees everyone with status, an accepted user sees accepted users only. */
function visibleParticipants(
  event: StoredEvent,
  isCreator: boolean,
  myStatus: ParticipantStatus,
): ParticipantView[] {
  if (isCreator) {
    return event.participants.map((p) => ({
      userId: p.id,
      displayName: p.displayName,
      username: p.username,
      status: p.status,
    }))
  }
  if (myStatus !== 'accepted') return []
  return event.participants
    .filter((p) => p.status === 'accepted')
    .map((p) => ({ userId: p.id, displayName: p.displayName, username: p.username }))
}
