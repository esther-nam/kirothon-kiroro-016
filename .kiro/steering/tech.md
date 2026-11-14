# Technology Stack

Frontend:
- React with TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Custom weekly grid (no FullCalendar; personal-weekly-timetable design D-1)
- Zustand for client-side UI state
- Runtime dependencies for the timetable: `luxon`, `@tanstack/react-query`, `react-hook-form`, `zod`

Backend:
- Supabase
- Supabase Edge Functions (TypeScript)
- PostgreSQL functions for atomic scheduling operations

Database:
- Supabase PostgreSQL
- Row Level Security (RLS)
- SQL migrations

Authentication:
- Supabase Auth

Realtime:
- Supabase Realtime (the personal-weekly-timetable feature does not use it)

Testing:
- Vitest
- React Testing Library
- Playwright

Deployment:
- Vercel (frontend)
- Supabase (backend and database)

Architecture principles:
- Feature-based frontend structure
- Strict TypeScript
- Store timestamps in UTC
- Use IANA timezone identifiers (e.g., Asia/Seoul, America/New_York).
- Use user timezone for display
- Keep timetable display preferences per user
- Never expose private event details to other users
- Validate scheduling conflicts on the server
- Use database transactions for group event creation
- Separate UI state from persisted server data
## Time model rules
- Absolute UTC instants are the source of truth.
- Display timezone is a per-user preference (IANA name), stored on that user's own preferences record. It controls rendering only. Changing it never modifies stored event times.
- Default display timezone is detected from the browser (`Intl.DateTimeFormat().resolvedOptions().timeZone`) at first sign-in. Later detection never silently overwrites a saved choice.
- Time slots are stored either as one-off `starts_at` / `ends_at` instants, or as recurring weekly rules (`day_of_week` Mon=1, `start_minute`, `end_minute`). Every event, recurring or not, stores an immutable `anchor_timezone`. The user selects it at creation, defaulting to the display timezone. The anchor is independent of the display timezone afterwards. Rules expand to UTC instants per concrete week, DST aware.
- Storage resolution is 1 minute. The 5/15/30 minute interval is a view preference only.
- Intervals are half-open `[start, end)`; adjacent blocks do not overlap.
- Team availability is computed only on absolute instants, then converted to the viewer's timezone at render time.
- The displayed week (Monday to Sunday) is defined in the viewer's display timezone. A block may change day column or be split at midnight when the viewer changes timezone. Splitting is render-only.
- Named-timezone conversion uses `luxon` in the domain layer.

## Event and tag model
- An **Event** has a `title`, optional `notes`, a creator and one or more **time slots**. A slot expands to one or more **occurrences** (concrete blocks in a week).
- Slots of the same event share an `event_id`. "Same thing" is an explicit link, not a title match.
- Editing event fields (title, notes) applies to all slots and occurrences. Editing the time of a slot affects only that slot (or the chosen recurrence scope).
- A **Tag** is user-owned with a case-insensitive unique name per user and a color. Tags are per user: each participant assigns their own tag to an event, and nobody sees another user's tag. An event without a tag has no color indicator.
- Event blocks are monochrome. Only the tag indicator is colored, derived from the user's own tag and never stored per occurrence.
- Deleting a tag requires reassigning or untagging its events. Deleting the last slot deletes the event.

## Concurrency rules
- Confirming a group event runs in one PostgreSQL function (single transaction) that locks the relevant members, re-checks every member's availability and existing events, and rejects on conflict.
- Mutable shared records carry a `version` column. Stale writes are rejected as conflicts.
- Confirm-event and accept-invite are idempotent. Team size (2 to 6) is enforced inside the same transaction as the invite acceptance.

## Privacy rules (enforced by RLS)
- Display preferences, including timezone, are readable only by their owner.
- An event is readable by its owner and by its participants. Non-participants can never read it. Pending invitees can read enough detail to decide.
- Tags and tag colors are readable only by their owner.
- Teammates get busy/free instants only, through a security-definer function or view that returns no task details. In the shared view, color identifies members and busy time is gray. Tag colors are personal-calendar only.
- Every table has RLS enabled, and RLS policies have automated tests.

## Testing expectations
- Every acceptance criterion maps to at least one automated test.
- Time logic lives in pure functions under the domain layer with unit tests, including DST and midnight-split cases.
- Concurrency and RLS behavior are tested against a real local Supabase/Postgres.
- A task is not done until build, lint and tests pass.
