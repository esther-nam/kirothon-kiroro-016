import type { Instant } from '@/domain/time/types'
import type {
  ChangePreview,
  DeleteRequest,
  EventBundle,
  EventInput,
  InvitationResponse,
  InvitationSummary,
  PreferencesRow,
  Result,
  UpdateRequest,
} from './types'

/** The only way the UI reads and writes timetable data (design 5.1, R18.1). */
export interface TimetableRepository {
  getEventsInRange(range: { from: Instant; to: Instant }): Promise<Result<EventBundle[]>>
  getEvent(eventId: string): Promise<Result<EventBundle>>
  createEvent(input: EventInput, requestId: string): Promise<Result<EventBundle>>
  /** Includes scope. */
  updateEvent(req: UpdateRequest): Promise<Result<EventBundle>>
  /** Counts only (R11.11). */
  previewUpdate(req: UpdateRequest): Promise<Result<ChangePreview>>
  deleteEvent(req: DeleteRequest): Promise<Result<void>>
  setMyTag(eventId: string, tagId: string | null): Promise<Result<void>>
  respondToInvitation(eventId: string, response: InvitationResponse): Promise<Result<void>>
  /** For the future Invitations spec. */
  listPendingInvitations(): Promise<Result<InvitationSummary[]>>
  getPreferences(): Promise<Result<PreferencesRow>>
  patchPreferences(patch: Partial<PreferencesRow>): Promise<Result<PreferencesRow>>
  resetPreferences(): Promise<Result<PreferencesRow>>
}
