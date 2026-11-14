import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { systemClock, type Clock } from '@/domain/time/clock'
import { mondayOf } from '@/domain/time/local-date'
import type { LocalDate } from '@/domain/time/types'
import { canNavigate, stepWeek, todayIn } from '@/domain/time/week'

/** Which modal is open (design 7.2, 7.3). Scope dialog and pending deletes arrive with later tasks. */
export type TimetableModal = 'none' | 'event-editor' | 'settings' | 'tag-management'

export interface TimetableUiState {
  /** Monday of the visible week, a civil date. Never derived from the display timezone after init (R14.5). */
  visibleMonday: LocalDate
  /** Occurrence key of the selected block, or null. */
  selectedOccurrenceKey: string | null
  openModal: TimetableModal
  goPrevious(): void
  goNext(): void
  /** Jumps to the week containing today in `zone`. The zone only decides what "today" is. */
  goToday(zone: string): void
  selectOccurrence(key: string | null): void
  openModalKind(modal: Exclude<TimetableModal, 'none'>): void
  closeModal(): void
}

export type TimetableUiStore = UseBoundStore<StoreApi<TimetableUiState>>

/** Detects the browser zone, falling back to UTC. */
function browserZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

/** Builds a store whose week starts at the current week in `zone`. Injectable for tests. */
export function createTimetableUiStore(
  clock: Clock = systemClock,
  zone: string = browserZone(),
): TimetableUiStore {
  return create<TimetableUiState>()((set, get) => ({
    visibleMonday: mondayOf(todayIn(zone, clock)),
    selectedOccurrenceKey: null,
    openModal: 'none',
    goPrevious: () => {
      const { visibleMonday } = get()
      if (canNavigate(visibleMonday, 'previous'))
        set({ visibleMonday: stepWeek(visibleMonday, 'previous') })
    },
    goNext: () => {
      const { visibleMonday } = get()
      if (canNavigate(visibleMonday, 'next'))
        set({ visibleMonday: stepWeek(visibleMonday, 'next') })
    },
    goToday: (z) => set({ visibleMonday: mondayOf(todayIn(z, clock)) }),
    selectOccurrence: (key) => set({ selectedOccurrenceKey: key }),
    openModalKind: (modal) => set({ openModal: modal }),
    closeModal: () => set({ openModal: 'none' }),
  }))
}

/** App store. Not persisted, so a reload starts at the current week (R2.7). */
export const useTimetableUiStore: TimetableUiStore = createTimetableUiStore()
