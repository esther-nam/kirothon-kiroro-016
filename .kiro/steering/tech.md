# Technology Stack

Frontend:
- React with TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- FullCalendar (initial calendar implementation)
- Zustand for client-side UI state

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
- Supabase Realtime

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
- Occurrences are stored either as one-off `starts_at` / `ends_at` instants, or as recurring weekly rules (`day_of_week` Mon=1, `start_minute`, `end_minute`) with an immutable `anchor_timezone` captured at creation. The anchor is independent of the display timezone. Rules expand to UTC instants per concrete week, DST aware.
- Storage resolution is 5 minutes. The 5/15/30 minute interval is a view preference only.
- Intervals are half-open `[start, end)`; adjacent blocks do not overlap.
- Team availability is computed only on absolute instants, then converted to the viewer's timezone at render time.
- The displayed week (Monday to Sunday) is defined in the viewer's display timezone. A block may change day column or be split at midnight when the viewer changes timezone. Splitting is render-only.
- Design check: FullCalendar needs a named-timezone plugin (for example its Luxon adapter) to render in an IANA zone. Confirm this in the timezone design.

## Task and tag model
- A **Task** is user-owned: `title`, optional `notes`, one `tag`. It has one or more **occurrences** (time blocks).
- Occurrences of the same task on different days share a `task_id`. "Same thing" is an explicit link, not a title match. Creating a task can select several days, and "duplicate to another day" keeps the `task_id`.
- Editing task fields (title, tag) applies to all occurrences. Editing the time of an occurrence affects only that occurrence.
- A **Tag** is user-owned with a case-insensitive unique name per user and a color. A task has one tag in the MVP. Untagged tasks use a neutral color.
- Color derives from the tag, never stored per occurrence. All occurrences of a task share one color, and different tasks with the same tag share it too.
- Deleting a tag requires reassigning or untagging its tasks. Deleting the last occurrence deletes the task.

## Concurrency rules
- Confirming a group event runs in one PostgreSQL function (single transaction) that locks the relevant members, re-checks every member's availability and existing events, and rejects on conflict.
- Mutable shared records carry a `version` column. Stale writes are rejected as conflicts.
- Confirm-event and accept-invite are idempotent. Team size (2 to 6) is enforced inside the same transaction as the invite acceptance.

## Privacy rules (enforced by RLS)
- Display preferences, including timezone, are readable only by their owner.
- Tasks, titles, notes, tags and tag colors are readable only by their owner.
- Teammates get busy/free instants only, through a security-definer function or view that returns no task details. In the shared view, color identifies members and busy time is gray. Tag colors are personal-calendar only.
- Every table has RLS enabled, and RLS policies have automated tests.

## Testing expectations
- Every acceptance criterion maps to at least one automated test.
- Time logic lives in pure functions under the domain layer with unit tests, including DST and midnight-split cases.
- Concurrency and RLS behavior are tested against a real local Supabase/Postgres.
- A task is not done until build, lint and tests pass.
