import type { Clock } from '@/domain/time/clock'
import { systemClock } from '@/domain/time/clock'
import type { Instant } from '@/domain/time/types'
import type { TimetableRepository } from '../repository'
import type {
  ChangePreview,
  EventBundle,
  InvitationSummary,
  PreferencesRow,
  RepositoryError,
  Result,
} from '../types'
import { MockStore, type StoredEvent } from './mock-store'
import { createSeedData } from './seed'
import { applySimulation, createSimulation, type Simulation } from './simulate'

export interface MockRepositoryOptions {
  /** Defaults to a store seeded for the current week. */
  store?: MockStore
  /** The signed-in mock user. Defaults to `user-a`. */
  userId?: string
  simulation?: Simulation
  clock?: Clock
}

const NOT_IMPLEMENTED: RepositoryError = {
  code: 'UNAVAILABLE',
  message: 'Not implemented in the mock repository yet',
}

const err = <T>(error: RepositoryError): Result<T> => ({ ok: false, error })
const ok = <T>(value: T): Result<T> => ({ ok: true, value })

/** In-memory implementation of the repository contract (design 5.1, R18.2). */
export class MockRepository implements TimetableRepository {
  readonly simulation: Simulation
  private readonly store: MockStore
  private readonly userId: string

  constructor(options: MockRepositoryOptions = {}) {
    this.store = options.store ?? new MockStore(createSeedData(options.clock ?? systemClock))
    this.userId = options.userId ?? 'user-a'
    this.simulation = options.simulation ?? createSimulation()
  }

  /** The same data with a different signed-in user. Shares the store and the simulation. */
  forUser(userId: string): MockRepository {
    return new MockRepository({ store: this.store, userId, simulation: this.simulation })
  }

  async getEventsInRange(range: { from: Instant; to: Instant }): Promise<Result<EventBundle[]>> {
    const failure = await applySimulation(this.simulation, 'read')
    if (failure) return err(failure)
    const from = Date.parse(range.from)
    const to = Date.parse(range.to)
    if (Number.isNaN(from) || Number.isNaN(to) || from > to) {
      return err({ code: 'VALIDATION', issues: [{ code: 'REPEAT_RANGE_INVALID', path: 'range' }] })
    }
    const bundles = this.store
      .eventsVisibleTo(this.userId)
      .filter((event) => touchesRange(event, from, to))
      .map((event) => this.store.bundleFor(this.userId, event))
    return ok(bundles)
  }

  async getEvent(eventId: string): Promise<Result<EventBundle>> {
    const failure = await applySimulation(this.simulation, 'read')
    if (failure) return err(failure)
    // Same answer for "does not exist" and "not yours" (R17.2, R17.3).
    const event = this.store.findVisible(this.userId, eventId)
    return event ? ok(this.store.bundleFor(this.userId, event)) : err({ code: 'NOT_FOUND' })
  }

  async getPreferences(): Promise<Result<PreferencesRow>> {
    const failure = await applySimulation(this.simulation, 'read')
    if (failure) return err(failure)
    return ok(this.store.getPreferences(this.userId))
  }

  async patchPreferences(patch: Partial<PreferencesRow>): Promise<Result<PreferencesRow>> {
    const failure = await applySimulation(this.simulation, 'write')
    if (failure) return err(failure)
    const next = { ...this.store.getPreferences(this.userId), ...patch }
    return ok(this.store.setPreferences(this.userId, next))
  }

  async resetPreferences(): Promise<Result<PreferencesRow>> {
    const failure = await applySimulation(this.simulation, 'write')
    if (failure) return err(failure)
    return ok(
      this.store.setPreferences(this.userId, {
        timeZone: null,
        timeFormat: null,
        intervalMinutes: null,
        wakeUpTime: null,
        bedtime: null,
      }),
    )
  }

  // Write paths for events, tags and invitations arrive in later tasks.
  createEvent(): Promise<Result<EventBundle>> {
    return Promise.resolve(err(NOT_IMPLEMENTED))
  }
  updateEvent(): Promise<Result<EventBundle>> {
    return Promise.resolve(err(NOT_IMPLEMENTED))
  }
  previewUpdate(): Promise<Result<ChangePreview>> {
    return Promise.resolve(err(NOT_IMPLEMENTED))
  }
  deleteEvent(): Promise<Result<void>> {
    return Promise.resolve(err(NOT_IMPLEMENTED))
  }
  setMyTag(): Promise<Result<void>> {
    return Promise.resolve(err(NOT_IMPLEMENTED))
  }
  respondToInvitation(): Promise<Result<void>> {
    return Promise.resolve(err(NOT_IMPLEMENTED))
  }
  listPendingInvitations(): Promise<Result<InvitationSummary[]>> {
    return Promise.resolve(err(NOT_IMPLEMENTED))
  }
}

const DAY_MS = 86_400_000

/** Half-open test: a slot touches `[from, to)` when `start < to` and `end > from` (R4.1). */
function touchesRange(event: StoredEvent, from: number, to: number): boolean {
  if (event.rule) {
    // Recurring events are expanded by the UI. Return any series that may reach the range.
    const first = Date.parse(`${event.rule.repeatFrom}T00:00:00Z`) - DAY_MS
    const last = Date.parse(`${event.rule.repeatUntil}T00:00:00Z`) + 2 * DAY_MS
    return first < to && last > from
  }
  return event.segments.some((segment) =>
    segment.slots.some(
      (slot) =>
        'startsAt' in slot && Date.parse(slot.startsAt) < to && Date.parse(slot.endsAt) > from,
    ),
  )
}
