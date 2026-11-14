# Requirements: Personal Weekly Timetable

Status: DRAFT v6, awaiting product review. Product decisions OQ-1 to OQ-35 and the Figma-audit decisions FD-1 to FD-8 (section 8) are applied. FD-9 (Daily Routine settings replace Visible Hours) is applied in this revision. `design.md` and `tasks.md` have NOT been reconciled with FD-9 yet (section 10).

## 0. How to read this document

- Acceptance criteria are numbered `R<requirement>.<n>` and use EARS form: "WHEN <condition> THEN the system SHALL <behavior>".
- `[F]` marks a visual or layout detail that must be confirmed against the approved Figma designs. Figma is the visual source of truth. Figma was audited in task 1.4 (`figma-audit.md`). Where a value was approved it is written into the criterion and marked `[FC-n]` (an initial value, pending visual QA against Figma; the constants table is `figma-audit.md` section 9). A bare `[F]` still has no approved value.
- `[P]` marks a criterion that depends on a screen or component that is not yet designed in Figma (section 2.4). Implementation of that part must not start until the design is approved.
- `[OQ-n]` marks a criterion that still depends on an unresolved question (section 9.1; only OQ-36 to OQ-39, OQ-41 and OQ-42 are open; OQ-40 is resolved by FD-3). Do not design it until answered. Where "decision OQ-n" appears, the question was resolved and is recorded in the decision log (section 8).
- `[A-n]` marks an assumption (section 9.2). `[C-n]` marks an interpretation I made to resolve a conflict between decisions (section 9.3). Both need your confirmation.
- Requirements avoid implementation detail. Technology, data model and component structure belong in `design.md`.
- Cross-feature rules (UTC storage, privacy, concurrency, naming) live in steering and are referenced, not repeated.

---

## 1. Feature Overview, Scope and Dependencies

### 1.1 Overview
A signed-in user manages a personal Monday-to-Sunday timetable. The user creates **events** that have one or more **time slots**, an event timezone, an optional tag, optional weekly recurrence and optional participants (at most 5 people in total including the creator). Events appear as blocks positioned by exact start and end time. The user can view, edit and delete events, and configures the display (grid interval, 12/24-hour format, Daily Routine wake-up time and bedtime, timezone). The timetable always shows the full 24 hours of each day. Times are stored in UTC and shown in the viewer's timezone. Events with participants use an invitation-and-acceptance workflow, and unaccepted invitations never appear on another user's calendar.

### 1.2 In scope
- Weekly calendar: header, navigation, time labels, day columns (always the full 24 hours), scrolling, initial scroll to the wake-up time, sticky headers
- Event blocks and their states (Default, Hover, Selected), compact layout and overlap layout
- Add Event and Edit Event: title, tag, event timezone, multiple time slots, optional weekly recurrence, participant selection
- Delete, undo, and recurring-event scopes (This occurrence, This and following, Entire series)
- Timetable Settings (interval 15, 30 or 60 minutes, time format, Daily Routine (wake-up time and bedtime), timezone, reset to defaults), private per user `[P]`
- Tag Management (create, rename, change color, delete, view own tags), reached from the Event Tag selector in Add and Edit Event (R22) `[P]`
- Timezone and DST correctness
- UI states: Default, Empty, Event selected, Dragging, Loading, Error, Form validation, Invitation pending
- Desktop and mobile layouts (mobile: horizontally scrollable weekday columns, R16)
- The interfaces this feature needs from, and offers to, other features (R18)

### 1.3 Out of scope
- Authentication and profile (`authentication` spec)
- Friend management and user search rules (Friend Management spec)
- Team management and team scheduling (Team Management and Team Scheduling specs)
- Shared availability calculation and views (Shared Availability spec)
- Notification delivery (Notifications spec)
- The Invitations screen or panel (pending list, accept, decline, details) (future Invitations spec). This spec provides only the contract it needs (R9.20, R18)
- Tag management as a reusable component for other features, and any entry point to it other than the Event Tag selector (R22 covers the MVP entry point only)
- A Calendar selector in Add and Edit Event. Events belong to the creator's personal timetable. Shared events are created by adding participants. Team scheduling is handled by Team Management (decision FD-5)
- A 5-minute grid interval (decision FD-4) and a day-at-a-time mobile layout (decision FD-7)
- Member-color assignment and the shared availability views that use member colors (Shared Availability and Team specs). This spec only fixes the color rule (R5.17)
- Moving or resizing existing events by drag. Users edit times in the Edit Event modal
- Overnight slots (a single slot crossing midnight) and open-ended recurrence
- Any use of Bedtime beyond storing it (dimming, reminders, restricting the range, sleep tracking, suggestions), and any automatic scrolling after the first render (decision FD-9)
- A configurable visible range of hours (replaced by the always-24-hour grid, FD-9)
- A date picker for jumping to a week
- Week numbers
- Localized interface languages other than English (formatting must be locale-ready, R20)
- Reminders, import/export, calendar sync, per-event color, attachments
- Native mobile apps

### 1.4 Dependencies on other features
| Feature | What this spec needs or offers | State |
|---|---|---|
| Authentication | Current user identity | Separate spec |
| Friend Management | Search among the user's friends by display name or username; returns identifier, display name and username only | Separate spec |
| Team Management / Team Scheduling | Optional team reference (id, name) on an event; any rule that bypasses invitation acceptance | Separate specs; not defined yet |
| Notifications | Consumes change records this spec emits (R18.6) | Separate spec |
| Invitations screen | Consumes accept, decline and details operations (R9.20) | Future spec |
| Shared Availability | Reads this user's busy intervals (R18.4) | Separate spec |
| Tag Management screen | Create, rename, change color, delete and view tags; reached from the tag selector (R22) | Screen not yet designed in Figma `[P]`; behavior specified in R22 |

### 1.5 Delivery phases (from decision OQ-30)
| Phase | Content | Requirements |
|---|---|---|
| 1 | Calendar UI on mock data. Event editor interactions on local state. Verify against Figma | R1 to R7 and R10 to R16, R20, R21 on mock-backed data; the data boundary R18.1 to R18.3 |
| 2 | Authentication, persistence, event CRUD, settings persistence, tag management | R13 persistence, R17, R18 persistence criteria, R22 (after its screen is approved) |
| 3 | Recurring events, participants and invitations | R8, R9, R11 and the recurrence and invitation parts of R12, R15 |

The phase mapping is my reading of the decision and is `[OQ-42]` to confirm. Requirements are written for the finished feature; phases only order delivery.

### 1.6 Glossary
| Term | Meaning |
|---|---|
| Event | A user-created item with a title, one or more time slots, an event timezone, an optional tag, optional recurrence and optional participants |
| Time slot | One entry in an event: either a Specific Date (when Repeat is OFF) or one Day of Week (when Repeat is ON), plus one start time and end time |
| Occurrence | One concrete instance of an event on the calendar with an exact start and end instant. Each calendar block is one occurrence |
| Series | An event with Repeat ON. Its occurrences come from its slots between Repeat From and Repeat Until, inclusive |
| Completed occurrence | An occurrence whose end instant is not later than the current instant `[A-14]` |
| Personal event | An event whose only participant is its creator |
| Participant | A user other than the creator who is invited to an event. An event has at most 5 people in total, counting the creator |
| Member color | One of the five palette primaries used as a small indicator that identifies a participant in shared views (R5.17) |
| Team event | An event that carries a team reference from the team features. An event with participants is not automatically a team event |
| Tag | A user-owned label with a name and a color chosen from the five-color palette. Shown only as a small circular indicator beside the event title |
| Viewer | The signed-in user looking at the timetable |
| Display timezone | The viewer's preferred IANA timezone. Controls rendering only |
| Event timezone (anchor timezone) | The IANA timezone in which an event's slot times and dates are defined. Chosen at creation |
| Grid interval | Row length in minutes: 15, 30 or 60 (default 15). A display and selection preference only. It never limits event time precision |
| Daily Routine | The pair of per-user preferences Wake-up time and Bedtime. A display preference only |
| Wake-up time | A time of day in whole minutes (`HH:mm`, 00:00 to 23:59). Default 07:00. Sets the vertical scroll position of the first render of the timetable (R3.10) and nothing else |
| Bedtime | A time of day in whole minutes (`HH:mm`, 00:00 to 23:59). Default 23:00. Stored only. It has no effect on the grid, on the scroll position or on any event |
| Initial scroll | The one-time setting of the vertical scroll position to the wake-up time when the timetable first renders (R3.10) |
| Full-day grid | The vertical axis from 00:00 to 24:00 of every day in the display timezone. It is always shown in full (R3.16) |
| Visible week | Monday 00:00 (inclusive) to next Monday 00:00 (exclusive) in the display timezone |

---

## 2. Review Inputs, Discrepancies and Required Steering Changes

### 2.1 What I reviewed
- **Steering:** `product.md`, `tech.md`, `structure.md`, `spec-workflow.md`.
- **Project:** The workspace contains only `.kiro/` (steering, empty spec folders) and `.gitignore`. There is no application code or build setup. The stack in `tech.md` is React, TypeScript, Vite, Tailwind, shadcn/ui, a custom weekly grid (no FullCalendar), Zustand, Supabase, Vitest and Playwright.
- **Figma:** Audited in task 1.4 (`figma-audit.md`). The file has the Personal Weekly Timetable (desktop and mobile), the Add Event modal states, mobile Add and Edit Event pages, confirmation dialogs and the component library. It has no Timetable Settings screen, no desktop Edit Event modal and no Tag Management screen (section 2.4). No visual design is invented in this document.

### 2.2 UI elements required by the decisions that may not exist in Figma
These are needed by your answers but were not in the five listed screens. The Figma audit found some of them (items 1, 2, 3, 5 in part, 12, 13) and not others. Section 2.4 lists what is still missing. Behavior is specified; layout is not.
1. Event timezone selector with the timezone name visible, in the Add and Edit Event modals (decision OQ-8)
2. Tag selector in the Add and Edit Event modals (decision OQ-17)
3. Recurring scope chooser for edit and for delete (decision OQ-9)
4. Delete choice for a multi-date non-recurring event: selected slot or entire event (decision OQ-9)
5. Confirmation dialogs: delete, modifying past recurring occurrences, discarding unsaved changes (decision OQ-10, OQ-28)
6. Undo action after delete (decision OQ-9)
7. "+N more" overflow indicator and its list (decision OQ-20)
8. ~~Indicator for events outside visible hours (decision OQ-22)~~ Removed by FD-9: the grid always shows 24 hours
9. Reset to Defaults in Timetable Settings (decision OQ-28)
10. Read-only event view for participants, with a Leave action and the viewer's own tag selector (decision OQ-13)
11. Participant chips with invitation status (pending, accepted, declined), and the invitation-pending state (brief section 7)
12. An Add Event control that does not require dragging (accessibility, `structure.md`)
13. Validation messages, empty, loading and error states

### 2.3 Required steering changes (steering is not edited by this task)
| # | Existing steering | Conflict with the decisions | Needed change |
|---|---|---|---|
| S-1 | `product.md`, `tech.md` Privacy: tasks, titles, notes and tags readable only by their owner | Accepted participants see an event's title and time. Pending invitees need enough detail to decide | Owner plus participants may read an event. Non-participants never can. Tags stay per user |
| S-2 | `product.md` Non-goals: "Recurring group events" | Recurring events can have participants | Remove or narrow the non-goal |
| S-3 | `tech.md` Task and tag model: Task with occurrences, one tag per task, color tints the occurrence | Event with time slots; per-user tags; blocks are monochrome; only the indicator is colored | Rewrite the model and the color rule |
| S-4 | `product.md`: confirmed group events appear on every member's calendar | Participant events need acceptance | Limit that sentence to team-confirmed events, subject to the Team Scheduling spec |
| S-5 | `tech.md` Time model: "Storage resolution is 5 minutes" | OQ-31 requires 1-minute precision | Change storage resolution to 1 minute. The 15/30/60 interval stays a view preference |
| S-6 | `tech.md` Time model: anchor timezone captured at creation | OQ-8: the user selects the event timezone at creation | Clarify that the anchor is user-selected, defaulting to the display timezone |
| S-7 | `tech.md` Time model: one-off events stored as instants, recurring as rules | OQ-8 gives every event an anchor timezone | Record that every event, not only recurring ones, stores its anchor timezone |
| S-12 | `product.md` and `tech.md`: teams and events of 2 to 6 members; `spec-workflow.md` checklist: "Team size limits (2 to 6)" | FD-2: at most 5 people per event in this feature, using five member colors | Decide whether the product-wide limit becomes 5 (team size 2 to 5) or only this feature uses 5. Update the three files accordingly |
| S-13 | `product.md` Core capabilities 2: grid interval 5, 15 or 30; Deferred: 5-minute interval | FD-4: intervals are 15, 30, 60 | Change to 15, 30 or 60 and drop 5-minute from the deferred list |
| S-14 | `tech.md` Event and tag model: "Deleting a tag requires reassigning or untagging its events" | FD-3: deleting a tag leaves events unchanged and only stops showing that tag's indicator (R22.6) | Replace the rule in `tech.md` (and check the database design for a restrictive foreign key) |
| S-15 | `tech.md` Privacy and `product.md`: color is only the tag indicator; "in the shared view, color identifies members" | FD-2 allows small member-identification indicators (R5.17) | Add the member-indicator exception to the color rule. Check `product.md` "Per-member colors and filtering" for the 5-member limit |

### 2.4 Pending Figma designs (dependencies; implementation must not start until approved)
The user designs these with Figma AI and approves them before implementation. This document specifies behavior only and does not define their visual design. Components that are already designed and approved (see `figma-audit.md` section 1.1) may proceed.

| # | Missing screen or component | Requirements that depend on it | Status |
|---|---|---|---|
| P-1 | Timetable Settings screen (desktop and mobile): interval 15/30/60, 12/24-hour, Daily Routine (wake-up, bedtime), timezone, Reset to Defaults | R13, R14.19, R16.8 | Not designed. Blocks the Settings UI only. The settings data and logic may proceed |
| P-2 | Tag Management (desktop and mobile): create, rename, change color, delete, view tags; opened from the Event Tag selector | R7.19, R22 | Not designed. Blocks R22 and the selector's link to it |
| P-3 | Tag delete confirmation | R22.5 | Not designed |
| P-4 | Confirmation for modifying completed occurrences of a series | R11.10 | Not designed |
| P-5 | Delete choice for a multi-date one-time event (this slot or the whole event) | R12.3 | Not designed |
| P-6 | Undo action on the delete toast | R12.9, R12.10 | Not designed (Figma toast has no action; the delete dialog says "cannot be undone") |
| P-7 | Occurrence-count preview when changing recurrence | R8.21, R8.22, R11.11 | Not designed |
| P-8 | Desktop Edit Event modal and read-only event view (with Leave and own-tag selector) | R7.25, R10.7 to R10.9 | Edit exists on mobile only. Read-only view not designed |
| P-9 | `+N more` indicator and its list (desktop popover, mobile sheet) | R4.6, R4.7 | Not designed |
| P-10 | ~~Outside-visible-hours indicator~~ | ~~R3.12, R3.13~~ | Removed by FD-9. The grid always shows 24 hours, so no indicator is needed. Do not design it |
| P-11 | Participant status chips: pending, accepted, declined, left | R9.28, R15.23, R15.25 | Not designed (Figma chips: Invited, Creator, Disabled) |
| P-12 | Missing mobile interaction states: overflow list, settings, tag management, read-only view, desktop-only dialogs on mobile | R16 | Not designed |
| P-13 | Block states: Hover versus Default and Focus versus Selected are not distinguishable in Figma | R5.7, R21.8 | Open Figma fix (`figma-audit.md` section 7, item 7) |

Figma changes also required by decisions made after the audit (not new screens): remove the "Calendar" field from the Add Event forms (FD-5); change the participant counter from "n/6, up to 5 invitations" to "n/5, up to 4 invitations" (FD-2); add the 1px `#171717` outline to Orange and Yellow tag indicators (FD-1); remove the 5-minute option wherever it appears (FD-4).

---

## 3. User Stories

- **US-1** As a user, I want to see my week from Monday to Sunday with time labels down the side, so that I can read my schedule at a glance.
- **US-2** As a user, I want the header to show month, year and date range, so that I know which week I am viewing.
- **US-3** As a user, I want previous week, next week and Today controls, so that I can move through time and return quickly.
- **US-4** As a user, I want event blocks drawn at their exact start and end times, so that the calendar is accurate even when times do not match the grid.
- **US-5** As a user, I want each block to show title, tag indicator, exact times and team name, so that I can identify it without opening it.
- **US-6** As a user, I want overlapping events to stay readable, so that I do not lose information about conflicts.
- **US-7** As a user, I want to create an event by clicking or dragging on empty time, so that adding one is fast.
- **US-8** As a user, I want one event to have several time slots, so that I can describe a schedule once.
- **US-9** As a user, I want to repeat an event weekly between two dates, so that I do not re-enter regular commitments.
- **US-10** As a user, I want to invite friends to an event, so that we share one plan.
- **US-11** As an invited user, I want events to enter my calendar only after I accept, so that nothing is added without my consent.
- **US-12** As an event creator, I want to edit and delete my event, so that my calendar stays accurate.
- **US-13** As a user, I want to choose whether a change to a recurring event affects one occurrence, this and following, or the entire series, so that I never change more than I intend.
- **US-14** As a user, I want to tag events with my own tags, so that I can see where my time goes. As a participant I want my own tag on a shared event.
- **US-22** As a user, I want to create, rename, recolor and delete my own tags from the tag selector, so that I can organize events without leaving the event form.
- **US-15** As a user, I want to set interval, time format, my daily routine (wake-up time and bedtime) and timezone, so that the timetable opens at the hour my day starts and fits how I work.
- **US-16** As a user, I want my settings to be private and to persist, so that nobody else is affected and my setup survives sign-out.
- **US-17** As a user in a different timezone from other participants, I want events shown in my local time, so that I never convert by hand.
- **US-18** As a user, I want a weekly event to keep its local clock time across daylight saving changes, so that "Tuesday 09:00" stays at 09:00 in its own timezone.
- **US-19** As a mobile user, I want a layout that works on a phone, so that I can use the timetable anywhere.
- **US-20** As a developer, I want the UI separated from the data source, so that mock data can be replaced by persistence without UI rewrites.
- **US-21** As an owner of another feature (friends, teams, availability, notifications, invitations), I want clear interfaces into the timetable, so that I can integrate without changing it.

---

## 4. Functional Requirements and Acceptance Criteria

Defaults from steering and the decisions: weeks run Monday to Sunday on the local calendar of the display timezone; intervals are half-open `[start, end)`; instants are stored in UTC; event times have 1-minute precision (seconds are always zero).

### R1. Header and layout (US-1, US-2)
- R1.1 WHEN the timetable opens THEN the system SHALL show seven day columns left to right in the order Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, with time labels running top to bottom. `[F]`
- R1.2 WHEN the timetable opens THEN the system SHALL show the week containing the current instant, evaluated in the display timezone.
- R1.3 WHEN a week is shown THEN the header SHALL show the month, the year and the date range of the visible Monday-to-Sunday week, in the format `<month(s) and year(s)> — <date range>`. Separator and styling: `[F]`.
- R1.4 WHEN the week lies within one month THEN the header SHALL read, for the week starting 2026-11-09: `November 2026 — Nov 9–15`.
- R1.5 WHEN the week spans two months of one year THEN the header SHALL read, for the week starting 2026-11-30: `Nov–Dec 2026 — Nov 30–Dec 6`.
- R1.6 WHEN the week spans two years THEN the header SHALL read, for the week starting 2026-12-28: `Dec 2026–Jan 2027 — Dec 28–Jan 3`.
- R1.7 The header and timetable SHALL NOT display a week number.
- R1.8 WHEN a day column header is rendered THEN it SHALL show the weekday and the day of the month in the display timezone. `[F]`
- R1.9 The system SHALL NOT require a date picker for navigation. A date picker is not provided in the MVP.
- R1.10 All month, weekday, date and time text SHALL be produced through locale-aware formatting (R20).

### R2. Week navigation (US-3)
- R2.1 WHEN the user activates "previous week" THEN the system SHALL show the week starting on the previous local Monday.
- R2.2 WHEN the user activates "next week" THEN the system SHALL show the week starting on the next local Monday.
- R2.3 WHEN the user activates "Today" THEN the system SHALL show the week containing the current instant.
- R2.4 WHEN the displayed week is the current week THEN the Today control SHALL be shown inactive. `[A-2]` `[F]`
- R2.5 WHEN navigation crosses a DST change THEN the new week SHALL still start on a local Monday (R14.9).
- R2.6 WHEN the user activates navigation several times before data arrives THEN the system SHALL show only the data for the last requested week.
- R2.7 WHEN the user reloads the page THEN the system SHALL show the current week.
- R2.8 WHEN the user navigates between weeks THEN the vertical scroll position SHALL be preserved and the system SHALL NOT scroll to the wake-up time (R3.17). `[A-9]`
- R2.9 The system SHALL NOT impose a product-level limit on past or future weeks. WHEN a technical limit of the date handling is reached THEN the navigation control in that direction SHALL be inactive with an explanatory message, and the system SHALL NOT fail. The limit is documented in the design.
- R2.10 Previous, next and Today SHALL be operable by keyboard.

### R3. Grid, time axis and positioning (US-4)
- R3.1 WHEN a new user opens the timetable THEN the grid interval SHALL be 15 minutes, the wake-up time 07:00 and the bedtime 23:00 (R13.12). The selectable intervals are 15, 30 and 60 minutes (R13.3).
- R3.2 WHEN the grid is rendered THEN each row SHALL represent one interval, aligned to the local clock of the display timezone, not to UTC. Example: in `Asia/Kathmandu` (UTC+05:45) a 30-minute grid has rows at :00 and :30 local time.
- R3.3 WHEN an occurrence is rendered THEN its top edge SHALL correspond to its exact start time and its bottom edge to its exact end time, including times that do not align with rows. Example: an event from 12:20 to 13:15 on a 30-minute grid starts two thirds of the way down the 12:00 row and ends at the midpoint of the 13:00 row. Its height is 55/30 of a row (55 px at 1 px per minute).
- R3.4 WHEN two occurrences have different durations THEN their drawn heights SHALL be in the ratio of their durations. The system SHALL NOT enlarge a block beyond its true duration. Selection of very small blocks: R5.12.
- R3.5 WHEN the grid interval changes THEN every block SHALL keep its exact time-based position and height; only row granularity changes.
- R3.15 The grid SHALL use one time-based vertical scale of 1 pixel per minute for every interval: a 60-minute row is 60 px, a 30-minute row is 30 px and a 15-minute row is 15 px. A 5-minute span is 5 px (internal positioning only; 5 minutes is not a selectable interval). Event position and height SHALL follow the actual start and duration on this scale. `[FC-4]` Known deviation to check in visual QA: Figma draws 64 px per hour on desktop and 80 px per hour on mobile. The values may be adjusted after visual QA against Figma.
- R3.16 The timetable SHALL always show the full 24 hours of each day, from 00:00 to 24:00 in the display timezone, for every user, every interval and every setting value. The timetable SHALL NOT clip, hide or dim any part of the day, and SHALL NOT show an indicator for time outside a range. Bedtime SHALL NOT change the grid in any way (R13.19).
- R3.17 WHILE the timetable is displayed after its first render THEN the system SHALL NOT change the vertical scroll position by itself. The scroll position SHALL be preserved across: week navigation (R2.8), a change of grid interval, a change of time format, a change of display timezone, any settings change including a change of wake-up time or bedtime and Reset to Defaults, opening and closing any dialog, creating, editing or deleting an event, Undo, and any data refresh or refetch. Only the user's own scrolling, or a layout change that makes the previous position impossible (the position is then limited to the maximum), SHALL change it.
- R3.18 WHEN the grid is positioned by the wake-up time in a week that contains a DST change (a 23-hour or 25-hour local day) THEN the scroll offset SHALL be the position of the wake-up row on the local-clock time axis (R3.15, R14.9), the same value as in a week without a DST change, and SHALL NOT be computed from elapsed time since the start of the day. WHEN the wake-up time falls in a skipped or repeated local hour on a day of that week THEN the position of the labelled wake-up row on the axis SHALL be used and the system SHALL NOT fail.
- R3.6 Event time precision SHALL be independent of the grid interval. An event from 12:20 to 13:15 SHALL be creatable and editable with any interval.
- R3.7 WHEN the grid is taller than its container THEN it SHALL scroll vertically.
- R3.8 WHILE the grid scrolls vertically THEN the day header row and the toolbar (month, year, range, navigation) SHALL remain visible. `[F]`
- R3.9 WHILE the grid scrolls horizontally on a narrow viewport THEN the time labels SHALL remain visible. `[F]`
- R3.10 WHEN the timetable renders for the first time THEN the system SHALL set the vertical scroll position once so that the row of the user's wake-up time is at the top of the scrollable grid area, directly below the sticky header. The scroll offset SHALL be the wake-up time in minutes since 00:00 multiplied by 1 px per minute (R3.15), so it is the same for every grid interval. WHEN the grid cannot scroll that far THEN the scroll position SHALL be the maximum possible. Example: wake-up 07:00 gives an offset of 420 px on the 15, 30 and 60-minute intervals. "First render" means the first render of the timetable after the user's settings have loaded or have failed to load (R13.16, using the default wake-up time of 07:00 without saving it) in one page load. Mobile uses the same rule (R16.7).
- R3.11 ~~Clip a block to the visible range.~~ **Removed** (FD-9). The grid always shows 00:00 to 24:00, so blocks are never clipped to a range. The number is not reused.
- R3.12 ~~Outside-hours indicator.~~ **Removed** (FD-9). The number is not reused.
- R3.13 ~~Accessible name of the outside-hours indicator.~~ **Removed** (FD-9). The number is not reused.
- R3.14 ~~Text of a clipped block.~~ **Removed** (FD-9): no block is clipped by a range. Blocks that cross local midnight keep the full time range in each segment (R5.15). The number is not reused.

### R4. Overlapping events (US-6)
- R4.1 Two occurrences overlap IF AND ONLY IF `start1 < end2` AND `start2 < end1`. Occurrences that touch (one ends when the next starts) do not overlap.
- R4.2 The system SHALL allow overlapping occurrences from different events.
- R4.3 WHEN occurrences overlap and there is enough horizontal space THEN the system SHALL render them side by side within the day column so that no block covers another.
- R4.4 WHEN occurrences chain-overlap (A overlaps B, B overlaps C, A does not overlap C) THEN the layout SHALL ensure no two overlapping blocks cover each other.
- R4.5 WHEN non-overlapping occurrences are rendered THEN each SHALL use the full column width.
- R4.6 WHEN overlapping blocks would become narrower than the minimum legible width THEN the system SHALL show as many blocks as fit at that width and SHALL show an overflow indicator reading `+N more`, where N is the number of occurrences not shown. The minimum width is 64 px. `[FC-3]` This applies on every viewport, and especially on narrow mobile screens.
- R4.7 WHEN the user activates the overflow indicator THEN the system SHALL list the hidden occurrences, each selectable, through an interaction that works by pointer, touch and keyboard.
- R4.8 WHEN occurrences are ordered for display THEN the order SHALL be: earlier start first, then later end first, then a stable identifier. The first ones that fit are shown, the rest go to the overflow. The same set of occurrences SHALL always give the same arrangement.
- R4.9 Overlapping blocks SHALL NOT be drawn so that important information (title and time) of one is hidden by another.
- R4.10 WHEN an occurrence is created, edited or deleted, or a setting changes THEN the layout SHALL be recomputed.
- R4.11 WHEN an overlapping occurrence is Selected THEN its full extent SHALL be visually clear. `[F]`
- R4.12 Overlapping or duplicate time slots within one event are not allowed (R7.17). Overlap between different events is allowed and SHALL be displayed (this requirement).

### R5. Event block (US-5)
- R5.1 WHEN an occurrence is rendered with enough height THEN its block SHALL show: the event title; a small colored circular tag indicator beside the title; the exact start and end times; and, if the event has a team, the team name below the time range. `[F]`
- R5.2 WHEN times are shown THEN they SHALL be the occurrence's exact start and end in the display timezone and the viewer's time format, separated by an en dash. Examples: `12:20–13:15` (24-hour); `12:20 PM–1:15 PM` (12-hour). An end at midnight shows as `24:00` in 24-hour format. In 12-hour format it follows `[F]`.
- R5.3 WHEN an event has no team THEN the block SHALL NOT show a team name or an empty team line. This includes events that have participants but no team.
- R5.4 Event block backgrounds SHALL be monochrome. Only the tag indicator SHALL use a color. No other part of the block SHALL use a tag color.
- R5.5 WHEN the viewer has not assigned a tag to the event THEN the block SHALL show no colored indicator.
- R5.6 WHEN the viewer has assigned a tag THEN the indicator color SHALL be the color of the viewer's own tag for that event, taken from the five-color palette in the Figma design system (Blue, Deep purple, Magenta, Orange, Yellow). Another participant's tag SHALL NOT be shown.
- R5.6a WHEN the indicator color is Orange or Yellow THEN the indicator SHALL have a 1 px `#171717` outline. The tag colors themselves SHALL NOT change, and other colors SHALL NOT get an outline. `[FC-7]` The outline is the contrast fix for the failing 3:1 ratio of these two colors (FD-1).
- R5.7 Blocks SHALL have three states: Default, Hover and Selected, each distinguishable without relying on color. `[F]`
- R5.8 WHEN a pointer hovers over a block THEN it SHALL enter Hover, and WHEN it leaves THEN it SHALL return to Default unless Selected. Touch devices have no Hover.
- R5.9 WHEN the block height cannot fit all lines THEN the system SHALL show information in this priority order: (1) title and tag indicator, (2) exact time range, (3) team name; and SHALL hide lower-priority lines first. WHEN even two lines do not fit THEN the system SHALL use a compact single-line layout showing the title first. Initial height thresholds, pending visual QA `[FC-6]`: full (title, time, team) at 78 px or more; title and time at 58 px or more; single line (title and indicator) at 32 px or more; indicator only below 32 px, with the full title and time in a tooltip or popover. Typography: `[F]`.
- R5.10 WHEN text is hidden or shortened THEN no text SHALL overflow outside the block, and the full title, times and team name SHALL be available when the event is selected and in its accessible name.
- R5.11 The block's position and drawn duration SHALL remain exact even when the block is very small (R3.4).
- R5.12 WHEN a block is smaller than the minimum touch or click target THEN the system SHALL keep it selectable by extending its interactive area without changing its drawn geometry. The minimum target size: `[F]`. WHEN interactive areas of adjacent tiny blocks overlap THEN the block under the pointer SHALL receive the interaction.
- R5.13 WHEN a title is very long THEN it SHALL be truncated inside the block without changing the block's size.
- R5.14 WHEN a title contains emoji, non-Latin characters or markup-like text (for example `<b>x</b>`) THEN the system SHALL show it as plain text.
- R5.15 WHEN an occurrence crosses local midnight in the display timezone (possible when the viewer's timezone differs from the event's timezone) THEN the system SHALL draw one segment in each day column, each segment SHALL show the occurrence's full original time range, and selecting either SHALL select the same occurrence. `[C-1]` Example: an event Monday 2025-01-13 08:00–10:00 in `Asia/Seoul` (2025-01-12T23:00Z to 2025-01-13T01:00Z) viewed in `UTC` appears as a segment Sunday 23:00–24:00 and a segment Monday 00:00–01:00, both labeled `23:00–01:00`.
- R5.16 WHEN a block belongs to a series THEN it MAY be visually marked as repeating. `[F]`
- R5.17 Color SHALL be used only for the tag indicator (R5.4 to R5.6) and for small member-identification indicators in shared views, such as avatar rings and small dots, drawn from the same five palette primaries. The UI SHALL remain monochrome otherwise: there SHALL be no large colored backgrounds and no colorful event blocks. A shared view shows at most 5 members, so each member can have a distinct primary and no sixth color exists. Member-color assignment and the shared views belong to other specs. `[FD-2]`

### R6. Calendar interaction: click, drag, long press (US-7)
- R6.1 WHEN the user clicks an existing event block THEN the system SHALL open the Edit Event modal for it (for non-creators, the read-only view, R10.10), and the block SHALL be Selected while the modal is open.
- R6.2 WHEN the Edit Event modal closes THEN the block SHALL return to Default and keyboard focus SHALL return to the block.
- R6.3 WHEN the user clicks an empty time slot THEN the system SHALL open the Add Event modal with the date and start time of that slot prefilled and an end time 30 minutes after the start. WHEN the start plus 30 minutes would pass 24:00 THEN the end SHALL be 24:00. Example: a click on the 09:00 row of a 15-minute grid prefills 09:00–09:30; a click on the 23:45 row prefills 23:45–24:00.
- R6.4 WHEN the user presses on an empty time slot and drags vertically THEN the system SHALL show a live preview of the selected range snapped to the grid interval, and WHEN the drag ends THEN it SHALL open the Add Event modal with that date, start and end prefilled in the first slot.
- R6.5 WHEN the user drags upward THEN the earlier time SHALL be the start and the later time the end.
- R6.6 WHEN the selection is a single row THEN the range SHALL be one grid interval long.
- R6.7 WHEN the pointer moves into another day column during a drag THEN the selection SHALL stay in the day where the drag started, and the drag SHALL stay active.
- R6.8 WHEN the pointer leaves the 24-hour grid vertically during a drag THEN the selection SHALL clamp to the grid, with the start no earlier than 00:00 and the end no later than 24:00 of the day where the drag started.
- R6.9 WHEN a press starts on an existing event block THEN the system SHALL NOT start a time-range selection and SHALL NOT move or resize the event. A click opens it (R6.1).
- R6.10 WHEN the user presses Escape during a drag THEN the drag SHALL cancel and nothing SHALL be created.
- R6.11 WHEN on a touch device and the user long-presses an empty time slot THEN the system SHALL begin time-range selection, show a preview, and WHEN the finger lifts THEN open the Add Event modal as in R6.4. Normal vertical scrolling by touch SHALL NOT start a selection. The long-press duration is 400 ms. `[FC-2]`
- R6.12 WHEN on a touch device and the user taps an empty time slot THEN the system SHALL behave as in R6.3. `[A-17]`
- R6.13 The system SHALL NOT support moving or resizing an existing event by dragging.
- R6.14 An Add Event control SHALL be available that opens the Add Event modal without any slot or time prefilled, so that events can be created without pointer dragging. `[F]`
- R6.15 WHEN the display interval is changed during a drag THEN the drag SHALL end or cancel without creating invalid values.
- R6.16 The prefilled values from R6.3 and R6.4 are in the display timezone. WHEN the event timezone differs from the display timezone THEN `[OQ-39]` applies.

### R7. Add and Edit Event form (US-7, US-8, US-14)
- R7.1 WHEN the Add Event modal opens THEN it SHALL contain: an Event Title field; a Tag selector; an event timezone selector with the timezone name visible; a list of time slots with an Add Time Slot control; a Repeat Event toggle; and a participants field. It SHALL NOT contain a Calendar selector (R7.27). `[F]`
- R7.2 WHEN the Add Event modal opens THEN it SHALL contain exactly one time slot, the Repeat Event toggle SHALL be OFF, and the event timezone SHALL default to the display timezone.
- R7.3 WHEN the title is empty or only whitespace and the user submits THEN the system SHALL reject it and show an error on the title.
- R7.4 WHEN the title is 100 characters THEN it SHALL be accepted. WHEN it is 101 characters THEN it SHALL be rejected with an error. How characters made of several code points are counted is decided in design.
- R7.5 WHEN the user activates the Add Time Slot (+) control THEN the system SHALL append a slot without changing existing slots. WHEN the event has 20 slots THEN the control SHALL be unavailable, and an explanation SHALL be shown.
- R7.6 WHEN the user removes a time slot THEN the system SHALL remove only that slot. WHEN one slot remains THEN it SHALL NOT be removable. `[A-10]`
- R7.7 Each slot SHALL represent exactly one time range and, depending on the Repeat toggle, exactly one Specific Date or exactly one Day of Week (R8).
- R7.8 WHEN a slot's end is not later than its start THEN the system SHALL reject it and show an error on that slot. End equal to start is rejected.
- R7.9 WHEN a slot's end is 24:00 THEN the system SHALL accept it as the end of the selected day. WHEN a slot's start is 24:00 THEN it SHALL be rejected.
- R7.10 A single slot SHALL NOT cross midnight. WHEN a user needs an event spanning two dates THEN the user SHALL create two slots.
- R7.11 Times SHALL be accepted to 1-minute precision, for any grid interval. WHEN a time includes seconds or is not a valid time THEN it SHALL be rejected.
- R7.12 WHEN a date or time field is empty or unparsable THEN the system SHALL reject it and show an error on that field.
- R7.13 WHEN a one-time slot's local time does not exist in the event timezone (DST gap) THEN the system SHALL reject it with a message and SHALL NOT shift it silently. Example: 02:30 on 2026-03-08 in `America/New_York`. `[C-2]`
- R7.14 WHEN a one-time slot's local time occurs twice in the event timezone (DST fall-back) THEN the system SHALL use the earlier occurrence. Example: 01:30 on 2025-11-02 in `America/New_York` is `2025-11-02T05:30:00Z`.
- R7.15 WHEN a slot is checked for validity THEN date, weekday and DST checks SHALL be made in the event timezone, not the display timezone.
- R7.16 WHEN the user selects an event timezone THEN the options SHALL be IANA identifiers and any other value SHALL be rejected. The event timezone SHALL be shown by name wherever the event's schedule is edited.
- R7.17 WHEN two slots of the same event overlap, or are duplicates (same date or weekday with intersecting time ranges) THEN the system SHALL reject the form and show a message that names the slots that conflict, for example "Slot 2 and Slot 4 overlap". Slots on the same date or weekday whose ranges touch (one ends when the next starts) SHALL be accepted.
- R7.18 WHEN a slot overlaps a slot of a different event THEN the system SHALL accept it (R4.2).
- R7.19 WHEN the user selects a tag THEN the system SHALL store it as the user's own tag for that event. WHEN no tag is selected THEN the event SHALL have no tag for that user. The selector SHALL list only the user's own tags and SHALL give access to Tag Management (R22.1). `[P]`
- R7.20 WHEN the user submits a valid form THEN the system SHALL create the event, close the modal, and show the new occurrences on the calendar without a reload.
- R7.21 WHEN the user closes the modal (cancel, Escape, or outside click) and the form has unsaved changes THEN the system SHALL ask for confirmation before discarding them. WHEN the form has no changes THEN the modal SHALL close without asking. WHEN the user declines THEN the modal SHALL stay open with the values intact.
- R7.22 WHEN the same submission is sent twice (double activation or retry) THEN the system SHALL create exactly one event.
- R7.23 WHEN creation fails THEN the system SHALL keep the modal open with all input intact and show an error.
- R7.24 WHEN the form is invalid THEN the system SHALL meet R15.19 to R15.22.
- R7.25 The Edit Event modal SHALL contain the same fields as Add Event, filled with the stored values, shown in the event timezone, and SHALL show the event timezone name.
- R7.26 WHEN the event timezone of an existing event is displayed in the modal THEN it SHALL NOT be editable after creation. `[A-15]`
- R7.27 The Add Event and Edit Event forms SHALL NOT offer a Calendar selector. WHEN an event is created THEN it SHALL belong to the creator's personal timetable. WHEN the creator adds participants THEN the event SHALL become shared through the invitation workflow (R9), not through a calendar choice. Team scheduling is handled by Team Management. `[FD-5]`

### R8. Recurrence (US-9)
- R8.1 WHEN the modal opens THEN the Repeat Event toggle SHALL be OFF.
- R8.2 WHILE Repeat is OFF THEN every slot SHALL offer Specific Date selection only, and Day of Week selection SHALL NOT be available.
- R8.3 WHILE Repeat is OFF THEN each slot SHALL produce exactly one occurrence, on its date, in the event timezone.
- R8.4 WHEN the user turns Repeat ON THEN the system SHALL show the Repeat From and Repeat Until date pickers, SHALL switch every slot to Day of Week selection, and SHALL stop offering Specific Date selection. `[F]`
- R8.5 WHEN Repeat is turned ON and a slot has a date and no weekday chosen by the user THEN the slot's weekday SHALL be preselected as the weekday of that date in the event timezone, and the slot's start and end SHALL be unchanged. Example: a slot dated 2026-11-16 becomes Monday.
- R8.6 WHEN Repeat is turned ON and a slot has no date and no weekday THEN no weekday SHALL be preselected and the slot SHALL require one before submission.
- R8.7 WHEN Repeat is turned OFF THEN the system SHALL switch every slot back to Specific Date selection, restore each slot's previously entered date, and keep start and end times. WHEN a slot has no previously entered date (for example it was added while Repeat was ON) THEN its date SHALL be empty and required.
- R8.8 WHEN the user toggles Repeat ON and OFF repeatedly THEN the system SHALL keep each slot's date, weekday, start and end, and Repeat From and Repeat Until, and SHALL NOT discard any of them. A weekday the user chose explicitly SHALL NOT be replaced by a conversion from the date.
- R8.9 WHEN converting dates to weekdays makes two slots identical or overlapping THEN the system SHALL NOT merge or remove them, and SHALL show the message from R7.17.
- R8.10 Each slot SHALL represent exactly one weekday and one time range. A user who wants several weekdays SHALL add several slots.
- R8.11 WHEN Repeat is ON THEN Repeat From and Repeat Until SHALL both be required.
- R8.12 WHEN Repeat is turned ON THEN Repeat From SHALL default to the selected date (the date of the prefilled or first slot), or to today in the event timezone if no date exists. Repeat Until SHALL default to the same day of month three months later, using the last day of the month when that day does not exist. Examples: From 2026-11-16 gives Until 2027-02-16. From 2026-11-30 gives Until 2027-02-28. From 2026-05-31 gives Until 2026-08-31.
- R8.13 WHEN Repeat Until is earlier than Repeat From THEN the system SHALL reject the form with an error. Repeat Until equal to Repeat From is valid.
- R8.14 WHEN Repeat Until is later than two years after Repeat From (same day and month two years later, using the last day of the month if needed) THEN the system SHALL reject the form with an error. Example: From 2026-11-16 allows Until up to 2028-11-16 and rejects 2028-11-17.
- R8.15 The system SHALL NOT offer open-ended recurrence.
- R8.16 WHEN Repeat is ON THEN each slot SHALL produce one occurrence on its weekday for every such weekday from Repeat From through Repeat Until inclusive, at the slot's start and end times in the event timezone.
- R8.17 WHEN Repeat From falls after a slot's weekday in its week THEN the slot's first occurrence SHALL be the next matching weekday on or after Repeat From. Example: From Wednesday 2026-11-18 and weekday Monday gives first occurrence Monday 2026-11-23.
- R8.18 WHEN a range contains no matching weekday for a slot THEN the system SHALL reject the form and say which slot produces no occurrences. Example: From Monday 2026-11-16 to Tuesday 2026-11-17 with a Friday slot.
- R8.19 WHEN a series occurrence's local start or end falls in a DST gap THEN that time SHALL shift forward to the next valid local time. WHEN it falls in a repeated hour THEN the earlier occurrence SHALL be used. Other occurrences SHALL keep their local clock time. Exact handling of the end time and of zero duration: `[OQ-36]`. Example: a series slot 02:30–03:30 on 2026-03-08 in `America/New_York` starts at 03:00 EDT.
- R8.20 WHEN a Specific Date event is saved with Repeat OFF THEN it SHALL remain a set of one-time events. It SHALL NOT become recurring unless the user edits it, turns Repeat ON, and saves.
- R8.21 WHEN the user edits an existing one-time event, turns Repeat ON and saves THEN the system SHALL replace its dated occurrences with the series and, before saving, SHALL tell the user how many occurrences will be created and replaced. `[F]`
- R8.22 WHEN the user edits an existing series and turns Repeat OFF THEN the dates SHALL be empty and required, and saving SHALL replace the series with one-time occurrences after the same preview. This change applies to the entire series only (R11.4).
- R8.23 WHEN a series is saved THEN the Edit Event modal SHALL show a summary of its weekdays, times, event timezone and date range.
- R8.24 WHEN a series' occurrences are displayed THEN exactly the occurrences whose local start date in the event timezone lies from Repeat From through Repeat Until inclusive SHALL be shown, minus any deleted occurrences.

### R9. Participants and invitations (US-10, US-11)
- R9.1 WHEN the user types in the participants field THEN the system SHALL search the user's friends by display name or username. Search SHALL NOT start until at least 2 characters are entered, and a hint SHALL tell the user so.
- R9.2 WHEN a search returns results THEN the system SHALL show at most 10, and each result SHALL show only the display name and username (and an avatar if the friend feature provides one). Phone numbers, email addresses and other private data SHALL NOT be shown.
- R9.3 WHEN the user selects a result THEN the system SHALL add the friend as a removable chip.
- R9.4 WHEN a participant chip is removed THEN only that participant SHALL be removed, and removal SHALL be operable by keyboard.
- R9.5 WHEN search results are shown THEN they SHALL exclude the creator and already selected users.
- R9.6 The creator SHALL be included in every event automatically, SHALL NOT appear as a removable chip, and SHALL count toward the limit of 5.
- R9.7 WHEN the event has 5 people including the creator (the creator plus 4 added friends) THEN the system SHALL NOT allow another to be added and SHALL explain why. WHEN the user attempts to add a fifth friend THEN it SHALL be rejected with the participant-limit error. The counter shown in the form SHALL read "n/5 including you". The limit SHALL be a single configured value so it can change later without changing logic.
- R9.8 WHEN an event has no participant other than the creator THEN it SHALL be a personal event: no invitation SHALL exist and no participant list SHALL be shown.
- R9.9 WHEN an event with participants is saved THEN the system SHALL create one pending invitation per added participant, applying to the entire event (or entire series), and the event SHALL appear on the creator's calendar.
- R9.10 WHILE an invitation is pending THEN the event SHALL NOT appear on that participant's calendar and SHALL NOT count as that participant's busy time.
- R9.11 WHEN a participant accepts THEN the invitation SHALL become accepted and the event SHALL appear on the participant's calendar in the participant's display timezone and time format.
- R9.12 WHEN a participant declines THEN the invitation SHALL become declined and the event SHALL NOT appear on the participant's calendar.
- R9.13 WHEN a participant who declined is invited again by the creator THEN the system SHALL create a new pending invitation.
- R9.14 Invitations SHALL NOT expire automatically.
- R9.15 WHEN the creator adds a participant to an existing event THEN the system SHALL create a pending invitation for that participant only, and existing participants' invitations SHALL stay unchanged.
- R9.16 WHEN the creator changes an event's title or schedule THEN accepted participants SHALL remain accepted and SHALL NOT need to accept again, and the system SHALL emit a change record for each (R18.6).
- R9.17 WHEN the creator removes a participant THEN that participant's pending invitation SHALL be withdrawn and an accepted event SHALL be removed from the participant's calendar.
- R9.18 WHEN an accepted participant leaves the event THEN the event SHALL be removed from the participant's calendar for the whole series, and the creator SHALL be able to see that the participant left. Leaving one occurrence only is not supported.
- R9.19 WHEN a participant's response (accept, decline, leave) is repeated THEN the result SHALL be identical to applying it once.
- R9.20 The system SHALL provide operations to list a user's pending invitations with the details needed to decide (title, schedule in the invitee's timezone, creator, participants as allowed by R17.4), and to accept or decline one. No screen for them is part of this spec.
- R9.21 WHEN a participant responds to an invitation for an event that has been deleted, or from which they were removed THEN the system SHALL reject the response with a clear message and change nothing.
- R9.22 WHEN the creator deletes the event THEN it SHALL be removed from every participant's calendar and pending invitations SHALL be withdrawn.
- R9.23 WHEN adding participants would exceed the limit at the moment of saving (for example because of a concurrent change from another session of the creator) THEN the system SHALL reject the save and explain why.
- R9.24 WHEN an invited user already has an event overlapping the new event THEN the invitation SHALL still be creatable, and acceptance SHALL be allowed.
- R9.25 An event with participants SHALL NOT be treated as a team event, and no team name SHALL be displayed, unless it carries a team reference from the team features.
- R9.26 WHEN the user lookup is unavailable THEN the participants field SHALL show an unavailable message and the rest of the form SHALL remain usable.
- R9.27 WHEN a search returns no results THEN a message SHALL say so. WHEN the search fails THEN an error SHALL be shown and already selected chips SHALL be kept.
- R9.28 The status of each participant's invitation SHALL be shown to the creator on their chip (pending, accepted, declined). `[F]` How a participant who left appears and how participants count toward the limit of 5: `[OQ-38]`.

### R10. View, select and edit events (US-12)
- R10.1 WHEN the creator saves changes in the Edit Event modal THEN the system SHALL validate with the rules of R7 and R8, persist valid changes, and re-render the calendar without a reload.
- R10.2 WHEN validation fails on edit THEN stored values SHALL remain unchanged and the modal SHALL stay open.
- R10.3 WHEN an edit is saved for an event changed or deleted since the modal opened THEN the system SHALL reject the save, tell the user, show the latest data, and SHALL NOT overwrite the other change or recreate a deleted event.
- R10.4 WHEN a save fails for another reason THEN the modal SHALL stay open with input intact and show an error.
- R10.5 WHEN the event is a recurring series and the user saves THEN R11 SHALL apply.
- R10.6 WHEN the schedule of an event with accepted participants changes THEN accepted participants SHALL keep their acceptance (R9.16).
- R10.7 WHEN a user other than the creator opens an event THEN the system SHALL show a read-only view with title, schedule in the viewer's display timezone, event timezone name, creator, team name (if any) and the participants permitted by R17.4. Title, schedule, recurrence and participants SHALL NOT be editable.
- R10.8 WHEN a participant opens the read-only view THEN the participant's own tag selector SHALL be available and changing it SHALL change only that participant's tag.
- R10.9 WHEN an accepted participant opens the read-only view THEN a Leave action SHALL be available (R9.18). `[F]`
- R10.10 WHEN a non-creator attempts to edit or delete a shared event by any route THEN the system SHALL reject it and change nothing.
- R10.11 WHEN only the viewer's tag is changed THEN no scope question SHALL be asked, and the tag SHALL apply to the whole event for that user.
- R10.12 WHEN the user changes the title, tag or schedule of an event THEN the viewer's calendar SHALL show the change, and all blocks of the event SHALL show the same title.

### R11. Recurring events: scope of edit and delete (US-13)
Scope applies only to events with Repeat ON.

- R11.1 WHEN the user saves an edit to, or deletes, an occurrence of a recurring event THEN the system SHALL ask which scope applies: This occurrence, This and following occurrences, or Entire series. `[F]`
- R11.2 WHEN the user cancels the scope question THEN nothing SHALL change.
- R11.3 The scope choices offered SHALL depend on what was changed `[C-3]`:
  - Title, or a slot's start or end time: This occurrence, This and following occurrences, Entire series.
  - Adding or removing slots, or changing a slot's weekday: This and following occurrences, Entire series.
  - Repeat From, Repeat Until, the Repeat toggle, or participants: Entire series only.
  - Only the viewer's own tag: no question (R10.11).
- R11.4 WHEN the scope is **This occurrence** and the action is edit THEN only that occurrence SHALL change, with title, date, start and end as modified by the user, and all other occurrences SHALL be unchanged.
- R11.5 WHEN the scope is **This occurrence** and the action is delete THEN only that occurrence SHALL be removed, and the series SHALL otherwise continue.
- R11.6 WHEN the scope is **This and following occurrences** THEN the change or deletion SHALL apply to the selected occurrence and to every occurrence of every time slot of the series whose start is not earlier than the start of the selected occurrence. Occurrences that start earlier SHALL be unchanged. Example: a Monday, Wednesday and Friday series, with Wednesday 2026-11-18 selected, changes Wednesday 11-18, Friday 11-20, Monday 11-23 and later, and leaves Monday 11-16 unchanged.
- R11.7 WHEN the scope is **This and following occurrences** and the action is delete and the selected occurrence is the first of the series THEN the whole series SHALL be removed.
- R11.8 WHEN the scope is **Entire series** THEN the change or deletion SHALL apply to the whole series, including completed occurrences, subject to R11.10.
- R11.9 WHEN a series edit is applied THEN occurrences that were individually modified SHALL be preserved unless the chosen operation explicitly affects them. How "explicitly affects" is determined: `[OQ-37]`.
- R11.10 WHEN the chosen scope would modify or delete at least one completed occurrence of a recurring series THEN the system SHALL show a confirmation stating how many completed occurrences are affected, before applying. WHEN the user declines THEN nothing SHALL change.
- R11.11 WHEN an edit changes the recurrence range or slots THEN, before confirming, the system SHALL show how many occurrences will be created, removed or kept. `[F]`
- R11.12 WHEN a change affects participants of a series THEN invitations SHALL follow R9 and apply to the entire series.
- R11.13 WHEN the scope is applied and local times fall in a DST gap or repeated hour THEN R8.19 SHALL apply.
- R11.14 WHEN the same scoped action is retried THEN the result SHALL be identical to applying it once.
- R11.15 WHEN two sessions apply scoped actions to the same series concurrently THEN the second SHALL be rejected as stale (R10.3) and SHALL NOT silently merge.
- R11.16 WHEN a user deletes an occurrence that is individually modified THEN it SHALL be removed and SHALL stay removed after later series edits.
- R11.17 WHEN a series is deleted with Entire series or This and following THEN the deletion SHALL also apply to its participants' calendars (R9.22).

### R12. Delete and undo (US-12)
- R12.1 WHEN the creator chooses Delete THEN the system SHALL ask for confirmation before deleting, and SHALL delete only after confirmation. `[F]`
- R12.2 WHEN the event is recurring THEN the scope question (R11.1) SHALL be part of the deletion flow, and one combined confirmation is acceptable. `[F]`
- R12.3 WHEN the event is not recurring and has several time slots THEN the system SHALL ask whether to delete the selected time slot or the entire event.
- R12.4 WHEN the event has only one time slot THEN deleting it SHALL delete the event.
- R12.5 WHEN deletion is confirmed THEN the occurrences SHALL disappear from the calendar without a reload.
- R12.6 WHEN the user declines THEN nothing SHALL be deleted.
- R12.7 WHEN a delete is repeated for something already deleted THEN the system SHALL report success without changing other data.
- R12.8 WHEN deletion fails THEN the event SHALL remain and an error SHALL be shown.
- R12.9 WHEN deletion succeeds THEN the system SHALL show an Undo action for a short period. WHEN the user activates Undo within that period THEN the system SHALL restore exactly the deleted occurrences, slots or event, with the same title, schedule, tag and participants. The period is set in design `[A-16]`.
- R12.10 WHEN Undo is not technically feasible for an event (for example one with participants) THEN the system SHALL NOT offer it, and the deletion confirmation SHALL say the deletion cannot be undone. Whether it is feasible for shared events: `[OQ-41]`.
- R12.11 WHEN the Undo period ends THEN the Undo action SHALL disappear and the deletion SHALL stand.
- R12.12 WHEN the user deletes or modifies a one-time event in the past THEN the system SHALL allow it without extra confirmation. Past recurring occurrences: R11.10.
- R12.13 The system SHALL allow creating events in the past without restriction.

### R13. Timetable settings (US-15, US-16)
- R13.1 WHEN the user opens Timetable Settings THEN it SHALL offer: time interval (15, 30, 60 minutes), time format (12-hour, 24-hour), Daily Routine with a Wake-up time and a Bedtime, timezone (IANA identifier), and a Reset to Defaults action. Timetable Settings SHALL NOT offer a visible start time or a visible end time. `[P]`
- R13.2 WHEN the user changes a setting THEN the system SHALL apply it immediately and persist it automatically, without a Save action.
- R13.3 WHEN the user selects an interval THEN the grid SHALL use it. Values other than 15, 30 and 60 SHALL be rejected. The 5-minute interval is not offered. Event start and end times keep 1-minute precision whatever interval is selected (R3.6).
- R13.4 WHEN the user selects 24-hour THEN all times in the timetable, modals and settings SHALL show as `HH:mm` (for example `13:05`).
- R13.5 WHEN the user selects 12-hour THEN all times SHALL show with AM/PM (for example `1:05 PM`), with midnight as `12:00 AM` and noon as `12:00 PM`.
- R13.6 WHEN the user sets Wake-up time or Bedtime to a valid time of day THEN the system SHALL accept and save it. A valid time of day is a whole minute from 00:00 to 23:59, independent of the grid interval (the user can set 07:20 on a 30-minute grid). The value is shown in the viewer's time format (R13.4, R13.5). `[A-4]`
- R13.7 IF the user enters a Wake-up time or Bedtime that is empty, not a time of day, or outside 00:00 to 23:59 (including 24:00), THEN the system SHALL reject it, show an error, and keep the previous value. IF the user sets Bedtime equal to Wake-up time THEN the system SHALL reject it in the same way. A Bedtime earlier than the Wake-up time SHALL be accepted (R13.18).
- R13.8 WHEN the user selects a timezone THEN the options SHALL be IANA identifiers, and any other value SHALL be rejected.
- R13.9 WHEN a setting changes THEN no stored event time SHALL change (R3.5, R14.4).
- R13.10 Settings SHALL apply only to the current user. No other user's timetable, including a participant's, SHALL change, and no other user SHALL be able to read the settings.
- R13.11 WHEN the user signs out and back in, or uses another device, THEN the saved settings SHALL apply.
- R13.12 WHEN a new user has no saved settings THEN the defaults SHALL be: time format 24-hour; interval 15 minutes; Wake-up time 07:00; Bedtime 23:00; timezone from R14.17; initial week the current week; initial scroll at the wake-up time (R3.10).
- R13.13 WHEN the user activates Reset to Defaults THEN all five settings (interval, time format, Wake-up time, Bedtime, timezone) SHALL return to R13.12 values (timezone by R14.17, independent of the previously saved timezone), applied immediately and persisted. Reset to Defaults SHALL NOT change the vertical scroll position (R3.17).
- R13.14 WHEN a stored setting is missing or invalid THEN the system SHALL use the default for that field only and SHALL still render.
- R13.15 WHEN saving a setting fails THEN the system SHALL return to the last saved value, show an error, and allow retry.
- R13.16 WHEN settings fail to load THEN the system SHALL show an error state and SHALL NOT save default values over stored settings.
- R13.17 Settings SHALL be stored separately from event data.
- R13.18 WHEN Bedtime is earlier than Wake-up time THEN the system SHALL treat Bedtime as falling after midnight and SHALL accept the pair. Example: Wake-up 09:00 and Bedtime 01:30 are valid. Wake-up 07:00 and Bedtime 07:00 are not valid (R13.7). The pair has no other validation, and no minimum or maximum waking duration is enforced.
- R13.19 The system SHALL store Bedtime as a per-user preference only. WHEN Bedtime has any value or changes THEN the grid, the visible time range, the scroll position, event blocks and stored event times SHALL remain unchanged.
- R13.20 WHEN the user changes Wake-up time THEN the system SHALL apply and persist it (R13.2) and SHALL use it for the next first render (R3.10), and SHALL NOT scroll the open timetable (R3.17). Wake-up time and Bedtime SHALL be private to their owner (R13.10, R17.6) and restored by Reset to Defaults (R13.13).

### R14. Timezone and date handling (US-17, US-18)
- R14.1 The system SHALL store every event timestamp as a UTC instant, with an event timezone stored alongside it.
- R14.2 WHEN an occurrence is displayed THEN its day, time and date SHALL be computed from its UTC instants in the viewer's display timezone.
- R14.3 WHEN two users in different timezones view the same event THEN each SHALL see the same instants in their own timezone. Example: an event at `2025-01-12T23:00:00Z` appears Monday 2025-01-13 08:00 for a viewer in `Asia/Seoul` and Sunday 2025-01-12 15:00 for a viewer in `America/Los_Angeles`.
- R14.4 WHEN the user changes the display timezone THEN no stored instant and no event schedule (slots, weekday, recurrence, event timezone) SHALL change. Every block SHALL be re-rendered at its converted position. Changing back SHALL restore the original rendering.
- R14.5 WHEN the display timezone changes THEN the system SHALL keep the same Monday-to-Sunday calendar dates in view and SHALL NOT navigate to another week. Example: viewing Nov 9–15, 2026 in `Asia/Seoul` and switching to `America/Los_Angeles` keeps Nov 9–15; an event Monday 2026-11-09 08:00 Seoul (`2026-11-08T23:00Z`) now appears in Nov 2–8 at Sunday 15:00 and no longer appears in Nov 9–15. The user can navigate explicitly.
- R14.6 WHEN a user edits an event THEN the schedule SHALL be displayed and interpreted in the event timezone, with the timezone name visible. WHEN the event timezone differs from the display timezone THEN the display of blocks on the calendar SHALL still use the display timezone.
- R14.7 WHEN a series is created THEN each slot's weekday and times SHALL be fixed in the event timezone and every occurrence SHALL keep that local clock time across DST changes. Example: a weekly Tuesday 09:00–10:00 series in `America/New_York` occurs at `2025-03-04T14:00:00Z` (EST) and `2025-03-11T13:00:00Z` (EDT). A viewer in `America/New_York` sees 09:00 both weeks. A viewer in `Asia/Seoul` sees 23:00, then 22:00.
- R14.8 WHEN a display timezone change occurs THEN the event timezone of every event SHALL stay unchanged.
- R14.9 WHEN a week boundary is computed THEN it SHALL use the local calendar of the display timezone, never 168 hours added to an instant. A week with a spring-forward change SHALL contain 167 hours and a week with a fall-back change SHALL contain 169 hours. Examples in `America/New_York`: the week starting 2025-03-03 has 167 hours; the week starting 2025-10-27 has 169 hours.
- R14.10 WHEN an occurrence starts exactly at the Monday 00:00 boundary THEN it SHALL belong to that week. WHEN it ends exactly at that boundary THEN it SHALL NOT appear in the next week.
- R14.11 WHEN a duration is shown or computed THEN it SHALL be the real elapsed time. Example: 01:00 to 04:00 local on 2025-03-09 in `America/New_York` is 2 hours.
- R14.12 WHEN a zone changes its clock at local midnight (so 00:00 does not exist on that day) THEN that day's column SHALL start at its first existing local time.
- R14.13 WHEN a zone has a non-whole-hour offset (for example `Asia/Kolkata`, `Asia/Kathmandu`) THEN conversion and grid alignment SHALL remain correct.
- R14.14 WHEN a date in the past is converted THEN the zone rules in force at that date SHALL be used.
- R14.15 WHEN a form is open and the display timezone changes THEN values already entered SHALL keep their absolute instants, or the user SHALL be warned before the change. Because forms are edited in the event timezone, the entered wall-clock values SHALL NOT change when the display timezone changes.
- R14.16 WHEN a time falls in a DST gap or repeated hour THEN the rules are: one-time slot in a gap is rejected (R7.13); one-time slot in a repeated hour uses the earlier occurrence (R7.14); series occurrence in a gap shifts forward and in a repeated hour uses the earlier (R8.19). These SHALL be documented in the design and applied by one shared mechanism.
- R14.17 WHEN the display timezone is determined THEN the system SHALL use: the saved timezone if one exists and is valid; otherwise the browser-detected timezone if valid; otherwise `UTC`. A timezone is valid if it is a recognized IANA identifier.
- R14.18 WHEN the browser-detected timezone differs from the saved timezone THEN the system SHALL keep using the saved timezone, SHALL NOT overwrite it, and SHALL NOT prompt. The user changes it in Timetable Settings.
- R14.19 WHEN a saved timezone is no longer recognized THEN the system SHALL fall back as in R14.17 for display and tell the user.
- R14.20 Time logic SHALL be verifiable with fixed instants and explicit zones, and tests SHALL give identical results when run under a different machine timezone.
- R14.21 Grid interval and event time precision SHALL be independent (R3.5, R3.6).
- R14.22 The occurrence rules for the event timezone SHALL apply to events created by other features (R18.5).

### R15. UI states
Each lists entry, behavior and exit. Visual treatment is `[F]`.

**Default calendar**
- R15.1 WHEN the visible week has at least one occurrence and data has loaded THEN the system SHALL show the grid, blocks, header, enabled navigation, Add Event and settings controls.

**Empty calendar**
- R15.2 WHEN the visible week has no occurrences and data has loaded THEN the system SHALL show the empty state with a visible control to add an event, and SHALL still show the grid, header and navigation. The empty state SHALL NOT appear while loading or after an error.

**Event selected**
- R15.3 WHEN an event is Selected THEN exactly one occurrence SHALL be Selected, and the Edit Event modal (or read-only view) SHALL be open (R6.1).
- R15.4 WHEN the modal closes THEN the Selected state SHALL end (R6.2).

**Dragging a time range**
- R15.5 WHILE the user drags or long-presses and drags on an empty slot THEN the system SHALL show the preview of the range, with its start and end times in the viewer's time format. Entry, clamping and exit follow R6.4 to R6.11.
- R15.6 WHEN the drag ends outside the grid THEN the selection SHALL clamp (R6.8).

**Loading**
- R15.7 WHILE the visible week's data is loading THEN the system SHALL show a loading state, keep the header and navigation usable, and SHALL NOT show the empty state.
- R15.8 WHILE a save or delete is in progress THEN the initiating control SHALL be inactive to prevent duplicates, and progress SHALL be visible.

**Error**
- R15.9 IF loading the week fails THEN the system SHALL show an error state with a retry control, and SHALL NOT show previously loaded data as this week's data.
- R15.10 WHEN retry succeeds THEN the error state SHALL be replaced by the Default or Empty state.
- R15.11 WHEN an error message is shown THEN it SHALL say in plain language what failed, and SHALL NOT expose internal identifiers or technical details.

**Form validation**
- R15.12 WHEN the user submits an invalid form THEN the system SHALL keep the modal open, show an error next to each invalid field, and move focus to the first invalid field.
- R15.13 WHEN a field's error relates to a slot THEN it SHALL identify the slot.
- R15.14 WHEN the user corrects a field THEN its error SHALL clear no later than the next submit.
- R15.15 WHEN two slots overlap THEN the message SHALL name both slots (R7.17).
- R15.16 Validation SHALL also be performed on the receiving side. An invalid request that bypasses the form SHALL be rejected with no stored change.
- R15.17 WHEN there are several errors THEN each problem SHALL appear once.
- R15.18 WHEN the form is valid THEN no error SHALL be shown.
- R15.19 Validation SHALL cover: title (R7.3, R7.4), slot count (R7.5), times (R7.8 to R7.14), duplicate and overlapping slots (R7.17), recurrence (R8.11 to R8.18), and participants (R9.7).
- R15.20 WHEN the user attempts to submit while a request is in flight THEN the second attempt SHALL be ignored.
- R15.21 Errors SHALL be exposed to assistive technology (R21.7).
- R15.22 WHEN a validation error exists on a hidden field (for example Repeat dates while Repeat is OFF) THEN it SHALL NOT block submission.

**Invitation pending**
- R15.23 WHEN an event has at least one pending invitation THEN the creator SHALL see the pending status on that participant's chip in the event modal. `[F]`
- R15.24 WHEN a user has a pending invitation THEN the event SHALL NOT appear on that user's calendar (R9.10). The way the invitee sees the invitation belongs to the Invitations spec.
- R15.25 WHEN an invitation is accepted or declined THEN the creator's chip SHALL change to accepted or declined.
- R15.26 WHEN no invitation is pending THEN no pending indicator SHALL be shown.

### R16. Desktop and mobile layouts (US-19)
Breakpoints and layouts come from Figma. Criteria are behavioral.
- R16.1 WHEN the viewport is at least 1024 px wide THEN the system SHALL show the Desktop layout with all seven day columns. `[FC-1]`
- R16.2 WHEN the viewport is narrower than 1024 px THEN the system SHALL show the Mobile layout described in R16.9 to R16.14, and every day of the visible week SHALL be reachable by horizontal scrolling without leaving the page. `[FC-1]`
- R16.3 WHEN on a touch device THEN creating an event SHALL be possible by tap (R6.12), by long press and drag (R6.11), and through the Add Event control (R6.14).
- R16.4 WHEN the viewport is resized or rotated THEN the displayed week, selection and unsaved form values SHALL be preserved.
- R16.5 WHEN on mobile THEN modals SHALL be usable without horizontal scrolling and SHALL stay reachable when the on-screen keyboard is open.
- R16.6 WHEN on mobile THEN every interactive control SHALL have a touch target of at least 44 by 44 CSS pixels.
- R16.7 WHEN on mobile THEN sticky headers (R3.8, R3.9), overflow handling (R4.6, R4.7) and settings SHALL work.
- R16.8 The Timetable Settings, Add Event and Edit Event screens SHALL be usable on both desktop and mobile.
- R16.9 WHEN the Mobile layout is shown THEN the grid SHALL have seven weekday columns, Monday to Sunday, each about 140 px wide `[FC-5]`, so that roughly 2 to 3 columns are visible at once depending on the screen width. The system SHALL NOT use a day-at-a-time layout.
- R16.10 WHEN the Mobile layout is shown THEN the time gutter SHALL be fixed on the left and SHALL stay visible while the weekday columns scroll horizontally (R3.9).
- R16.11 WHEN the Mobile layout is shown THEN horizontal scrolling and vertical scrolling SHALL be independent: scrolling one SHALL NOT move the other.
- R16.12 WHILE the grid scrolls vertically on mobile THEN the weekday header row SHALL remain visible (sticky) (R3.8). While it scrolls horizontally the header SHALL scroll with the columns so each column keeps its header.
- R16.13 WHEN the user swipes or scrolls horizontally on mobile THEN the weekday columns SHALL scroll and the visible week SHALL NOT change. The week changes only through the explicit previous week, next week and Today controls (R2.1 to R2.3).
- R16.14 WHEN a touch gesture on mobile is a vertical or horizontal scroll THEN it SHALL NOT start a time-range selection (R6.11).

### R17. Privacy and access
- R17.1 WHEN a request has no signed-in user THEN the system SHALL reject reads and writes of timetable data.
- R17.2 WHEN a user requests another user's settings or tags THEN the system SHALL return nothing and SHALL NOT reveal whether they exist.
- R17.3 WHEN a user is not a participant of an event and has no pending invitation to it THEN the system SHALL NOT return its title, times, tag, team or participants.
- R17.4 WHEN a user is the creator THEN the system SHALL show every participant and status. WHEN a user is an accepted participant THEN the user SHALL see the creator and the other accepted participants by display name and SHALL NOT see the status of pending or declined users `[A-13]`. WHEN a user has a pending invitation THEN the user SHALL see only what is needed to decide.
- R17.5 A user's tag names and colors SHALL NOT be visible to any other user, including participants of a shared event.
- R17.6 A user's settings, including timezone, SHALL NOT be visible to other users.
- R17.7 WHEN a declined user is displayed to the creator THEN the creator SHALL NOT receive any of the decliner's other calendar information.
- R17.8 WHEN user search results are returned THEN they SHALL contain only the data in R9.2.

### R18. Integration interfaces and data boundary (US-20, US-21)
- R18.1 The timetable UI SHALL obtain and change events, tags, settings and invitations only through a data-access contract. The UI and event logic SHALL NOT depend on any specific data source.
- R18.2 WHEN the mock data source is replaced by another implementation of the same contract THEN the same UI test suite SHALL pass without UI changes. Test: run the suite against two implementations.
- R18.3 The mock source SHALL provide seed data covering: events in the current week; an overlap cluster of at least 5 occurrences; adjacent events; an event from 12:20 to 13:15; a series with several slots; a one-time event with several dates; a shared event with pending, accepted and declined participants; events near 00:00 and 24:00 (for example 00:30–02:00 and 23:00–24:00); an event at a DST change; and tags with different colors. `[A-8]`
- R18.4 **Busy time.** For a given user and time range, the timetable SHALL provide the user's busy intervals as UTC instants, built from the user's own events and events they have accepted, excluding pending, declined and deleted occurrences, with no title, tag or team data.
- R18.5 **Events from other features.** The timetable SHALL accept events created by another feature (for example a confirmed team event), with the same occurrence rules. Whether such events skip invitation acceptance is defined only by the Team Scheduling spec; until then they do not. `[R14.22]`
- R18.6 **Change records.** WHEN an invitation is created, accepted, declined, withdrawn or left, or an event is changed or deleted THEN the system SHALL emit a record stating what happened, to whom and when, for the Notifications feature. This feature SHALL NOT deliver notifications.
- R18.7 **User lookup.** The participants field SHALL use the Friend Management search capability (R9.1, R9.2), and SHALL NOT decide eligibility itself.
- R18.8 **Team reference.** An event MAY carry a team identifier and team name from the team features. WHEN the team name changes THEN blocks SHALL show the current name. WHEN the team is deleted, or the viewer leaves the team THEN the team name SHALL no longer be displayed to that viewer, and the viewer's accepted participation SHALL remain.
- R18.9 **Tags.** The timetable SHALL obtain the viewer's tags (name, color) from the tag management component.
- R18.10 **Failure isolation.** WHEN user lookup, team data, tags or notifications are unavailable THEN the personal timetable SHALL remain usable, and affected controls SHALL show an unavailable state.
- R18.11 Data SHALL be requested by visible date range (and not loaded wholesale) so that performance holds for users with many events.

### R19. Performance (decision OQ-35)
These are initial engineering targets for a typical desktop environment, validated by tests on a reference environment that the test plan defines. They are targets, not guarantees.
- R19.1 WHEN data is available THEN the weekly calendar SHALL finish its initial render in under 1 second.
- R19.2 WHEN the user navigates to a week whose data is local or cached THEN the new week SHALL render in under 300 milliseconds.
- R19.3 WHILE the user drags a selection THEN visual feedback SHALL target 60 frames per second.
- R19.4 WHEN a week has 500 occurrences THEN the timetable SHALL render and remain usable without significant degradation.
- R19.5 WHEN the interval is 15 minutes (the finest interval) and the grid shows its full 24 hours (R3.16) THEN the timetable SHALL remain usable (render, scroll, drag).
- R19.6 WHILE a drag is in progress THEN components not affected by the drag SHALL NOT re-render. Test: count renders of untouched blocks during a drag; the count is zero.

### R20. Localization readiness
- R20.1 The interface language for the MVP SHALL be English.
- R20.2 All dates, times, month names and weekday names SHALL be formatted through locale-aware formatting using a locale value, and SHALL NOT be assembled from hardcoded English strings. Test: setting a different locale value (for example German) changes the header and day names.
- R20.3 The default locale SHALL be English. A user locale preference is not part of this spec.
- R20.4 The 12/24-hour setting SHALL override the locale's time-format default.

### R21. Accessibility
- R21.1 Every action in R2, R6 to R12, R13 and R22 SHALL be reachable by keyboard with a visible focus indicator.
- R21.2 WHEN a keyboard user focuses the grid THEN arrow keys SHALL move between time cells, Shift plus arrows SHALL extend a selection, and Enter SHALL open Add Event with that selection.
- R21.3 WHEN an occurrence has focus THEN Enter SHALL open it (R6.1), and its accessible name SHALL include the title, tag name (if any), day, start time, end time and team name (if any), in the viewer's display timezone and format.
- R21.4 WHEN a tag color is the only way to tell tags apart THEN the tag name SHALL also be available as text in the event details.
- R21.5 Modals SHALL trap focus, close on Escape (subject to R7.21), and return focus to the opener.
- R21.6 WHEN the visible week changes THEN the new header text SHALL be announced to assistive technology.
- R21.7 Validation errors and Undo SHALL be announced to assistive technology.
- R21.8 Text and tag indicators SHALL meet WCAG 2.1 AA contrast against their background. States SHALL NOT rely on color alone.
- R21.9 The overflow list (R4.7) SHALL be reachable by keyboard and screen reader.
- Note: automated checks cover part of this. Full compliance needs manual testing with assistive technology.

### R22. Tag management (US-14, US-22) `[P]`
The Tag Management screen is not yet designed in Figma (section 2.4, P-2 and P-3). These criteria specify behavior only. Implementation of the screen must not start until its design is approved. Steering rule `tech.md` "Deleting a tag requires reassigning or untagging" conflicts with R22.6 (S-14).
- R22.1 WHEN the user opens the Tag selector in Add Event or Edit Event THEN the system SHALL provide a way to open Tag Management. In the MVP this is the only entry point.
- R22.2 WHEN Tag Management is open THEN the system SHALL let the user view all of their own tags (name and color), create a tag, rename a tag, change a tag's color and delete a tag.
- R22.3 WHEN a tag is created or renamed THEN its name SHALL be non-empty after trimming and unique for that user, ignoring case. A duplicate or empty name SHALL be rejected with an error. The name length limit is set in design.
- R22.4 WHEN the user picks a tag color THEN the choices SHALL be the five palette primaries only (R5.6). The user SHALL NOT be offered tints or custom colors.
- R22.5 WHEN the user chooses to delete a tag THEN the system SHALL ask for confirmation before deleting and SHALL delete only after confirmation. `[P]`
- R22.6 WHEN a tag is deleted THEN the events that had it SHALL remain unchanged, and the deleted tag's indicator SHALL no longer be displayed on them. The system SHALL NOT require reassigning or removing the tag from events first. `[FD-3]`
- R22.7 WHEN a tag is renamed or recolored THEN every event that uses it SHALL show the new color and the new name (in details and accessible names) without a reload.
- R22.8 WHEN Tag Management changes a tag THEN only the owner's own view SHALL change. No other user SHALL see the tag, its name or its color (R17.5).
- R22.9 WHEN Tag Management is closed THEN the Add or Edit Event form SHALL keep all its entered values, and the tag selector SHALL show the updated list. WHEN the tag that was selected in the form was deleted THEN the selector SHALL show no tag.
- R22.10 WHEN tags cannot be loaded or saved THEN Tag Management SHALL show an error with retry, and the rest of the timetable SHALL remain usable (R18.10).
- R22.11 The same create, rename, create-duplicate and delete request repeated SHALL give the same result as applying it once.

---

## 5. Business Rules
- BR-1 UTC instants are the source of truth for event times. Display settings never change them.
- BR-2 Time interval, time format, Daily Routine (wake-up time and bedtime) and display timezone are per-user view settings. The timetable always shows 24 hours. Wake-up time sets only the first scroll position. Bedtime has no visual effect (R3.16, R3.17, R13.19).
- BR-3 The week runs Monday to Sunday on the local calendar in the display timezone. Week numbers are not displayed.
- BR-4 Intervals are half-open. Adjacent occurrences do not overlap.
- BR-5 Event time precision is 1 minute and is independent of the grid interval.
- BR-6 Overlapping occurrences from different events are allowed and always reachable. Overlapping or duplicate slots within one event are not allowed.
- BR-7 An event has between 1 and 20 time slots. A slot has one time range and a date (Repeat OFF) or a weekday (Repeat ON). A slot cannot cross midnight and can end at 24:00.
- BR-8 Repeat OFF means Specific Date slots only. Repeat ON means Day of Week slots only. Repeat From and Repeat Until are required and at most 2 years apart.
- BR-9 Every event has an event timezone, chosen at creation. A series keeps its local clock time in that timezone across DST.
- BR-10 Switching the Repeat toggle never discards entered values.
- BR-11 The creator is a participant and counts toward the limit of 5 people per event (the creator plus at most 4 added). An event with no other participant is personal.
- BR-12 An event with participants appears on a participant's calendar only after that participant accepts.
- BR-13 Only the creator edits or deletes a shared event. Participants may view it, set their own tag, and leave.
- BR-14 Invitations apply to the entire event or series. Accepted participants stay accepted when the creator edits the event.
- BR-15 Having participants does not make an event a team event.
- BR-16 Event block backgrounds are monochrome. Only the tag indicator is colored, and it shows the viewer's own tag.
- BR-17 Tags belong to individual users and are private.
- BR-18 Settings never change event data, and event data never changes settings.
- BR-19 DST rules: one-time gap time is rejected; series gap time shifts forward; repeated time uses the earlier occurrence.
- BR-20 Color appears only as the tag indicator and as small member-identification indicators in shared views. Orange and Yellow tag indicators have a 1 px `#171717` outline. The UI is otherwise monochrome (R5.17).
- BR-21 Deleting a tag never changes events. It only stops that tag's indicator from being displayed (R22.6).
- BR-22 Grid intervals are 15, 30 and 60 minutes. Vertical scale is 1 px per minute for all of them. Event precision is 1 minute.
- BR-23 Events belong to the creator's personal timetable. There is no Calendar selector (R7.27).
- BR-24 On mobile the weekday columns scroll horizontally and the week changes only through explicit controls (R16.13).

---

## 6. Edge Cases and Error Scenarios

| # | Category | Scenario | Expected behavior |
|---|---|---|---|
| E1 | Boundary | End equals start | Rejected (R7.8) |
| E2 | Boundary | Title of 100 and 101 characters | Accepted; rejected (R7.4) |
| E3 | Boundary | 20 and 21 slots | 20 accepted; the add control is unavailable at 20 (R7.5) |
| E4 | Boundary | End at 24:00; start at 24:00 | Accepted; rejected (R7.9) |
| E5 | Boundary | Slot from 22:00 to 02:00 | Rejected; user creates two slots (R7.10) |
| E6 | Boundary | Adjacent events or slots (10:00 end, 10:00 start) | No overlap; accepted (R4.1, R7.17) |
| E7 | Boundary | Event 12:20–13:15 on a 30-minute grid | Exact position; editable (R3.3, R3.6) |
| E8 | Boundary | Repeat Until equals Repeat From | Valid (R8.13) |
| E9 | Boundary | Repeat Until before From; two years plus one day | Rejected (R8.13, R8.14) |
| E10 | Boundary | From 2026-11-30 default Until | 2027-02-28 (R8.12) |
| E11 | Boundary | Weekday with no match in the range | Rejected naming the slot (R8.18) |
| E12 | Boundary | Click at 23:45 | Prefill 23:45–24:00 (R6.3) |
| E13 | Boundary | Wake-up or Bedtime 00:00 and 23:59 accepted; 24:00 rejected; Bedtime equal to Wake-up rejected; Bedtime earlier than Wake-up (for example 09:00 and 01:30) accepted | Rules of R13.6, R13.7, R13.18 |
| E14 | Boundary | Participants: creator plus 4 added; a fifth added friend | Allowed; rejected (R9.7) |
| E15 | Boundary | Search with 1 character; with 2; with over 10 matches | No search with hint; search; first 10 only (R9.1, R9.2) |
| E16 | Boundary | Event ends exactly at next midnight | Appears on its start day only (R14.10) |
| E17 | Boundary | Event at 00:30–02:00 or 23:00–24:00 with Wake-up 07:00 and Bedtime 23:00 | Drawn fully at its exact position; no clipping, no indicator; reachable by scrolling (R3.16) |
| E18 | Exception | Empty title | Rejected (R7.3) |
| E19 | Exception | Double submit or retry of create, accept, leave, delete | One effect (R7.22, R9.19, R12.7) |
| E20 | Exception | Create fails after a long form | Input kept (R7.23) |
| E21 | Exception | Accept after delete or removal | Rejected with message (R9.21) |
| E22 | Exception | Edit after the event changed elsewhere | Stale rejection (R10.3) |
| E23 | Exception | Two sessions apply scoped actions | Second rejected (R11.15) |
| E24 | Exception | Creator deletes while invitee accepts | One consistent outcome; accept rejected if delete won (R9.21) |
| E25 | Exception | Adding participants over the limit from two sessions | Rejected at save (R9.23) |
| E26 | Exception | Settings fail to load | Error; stored settings not overwritten (R13.16) |
| E27 | Exception | Setting save fails | Reverts to saved value; error (R13.15) |
| E28 | Exception | Friend search unavailable or failing | Message; chips kept; form usable (R9.26, R9.27) |
| E29 | Exception | Tags unavailable | Timetable usable; selector shows unavailable (R18.10) |
| E30 | Exception | Session expires while editing | User told to sign in; input kept where feasible |
| E31 | Exception | Offline during save | Error; no stored change; retry |
| E32 | Exception | Corrupt or partial settings | Per-field defaults (R13.14) |
| E33 | Exception | Title with emoji, non-Latin, markup | Plain text (R5.14) |
| E34 | Exception | Closing a modified form | Confirmation (R7.21) |
| E35 | Exception | Modifying completed occurrences of a series | Confirmation with count (R11.10) |
| E36 | Recurrence | Toggle Repeat ON, OFF, ON | No value lost (R8.8) |
| E37 | Recurrence | Dates converted to weekdays create duplicates | Not merged; message (R8.9) |
| E38 | Recurrence | Slot added while Repeat is ON, then Repeat OFF | Date empty and required (R8.7) |
| E39 | Recurrence | One-time event turned into a series | Preview; replaced (R8.21) |
| E40 | Recurrence | This and following from the first occurrence | Whole series (R11.7) |
| E41 | Recurrence | This and following with several slots | All slots from the selected start (R11.6) |
| E42 | Recurrence | Delete one occurrence, later edit entire series | Deleted one stays deleted (R11.16) |
| E43 | Recurrence | Individually modified occurrence and a series edit | Preserved unless affected (R11.9, OQ-37) |
| E44 | Recurrence | Delete one date of a one-time multi-date event | Choice: slot or event (R12.3) |
| E45 | Recurrence | Delete the only slot | Deletes event (R12.4) |
| E46 | Timezone | Display timezone changed | No instants change; same dates in view (R14.4, R14.5) |
| E47 | Timezone | Changed then reverted | Identical to original (R14.4) |
| E48 | Timezone | Occurrence crosses local midnight for the viewer | Two segments, full range label (R5.15) |
| E49 | Timezone | One-time time in a DST gap | Rejected (R7.13) |
| E50 | Timezone | One-time time in a repeated hour | Earlier (R7.14) |
| E51 | Timezone | Series occurrence in a gap | Shifts forward (R8.19), end handling OQ-36 |
| E52 | Timezone | Series occurrence in a repeated hour | Earlier (R8.19) |
| E53 | Timezone | Series viewed by user without DST | Local time shifts; anchored time stable (R14.7) |
| E54 | Timezone | 167-hour and 169-hour weeks | Local calendar boundaries (R14.9) |
| E55 | Timezone | DST change at local midnight | Day starts at first valid time (R14.12) |
| E56 | Timezone | Non-whole-hour offsets | Correct (R14.13) |
| E57 | Timezone | Browser timezone unknown or invalid | Saved, else UTC (R14.17) |
| E58 | Timezone | Browser timezone differs from saved | Saved kept; no prompt (R14.18) |
| E59 | Timezone | Machine timezone differs | Display timezone only (R14.20) |
| E60 | Timezone | Week spanning months, years, leap day 2028-02-29 | Header correct (R1.4 to R1.6) |
| E61 | Timezone | Form open when display timezone changes | Entered values keep meaning (R14.15) |
| E62 | Timezone | Participants in different timezones | Each sees own time (R14.3) |
| E63 | Participants | Invite yourself; same user twice | Prevented (R9.5) |
| E64 | Participants | Removing the last participant | Event becomes personal; pending withdrawn (R9.8, R9.17) |
| E65 | Participants | Participant declined, invited again | New pending (R9.13) |
| E66 | Participants | Creator edits after acceptance | Stays accepted; new participants pending (R9.15, R9.16) |
| E67 | Participants | Participant leaves | Removed from calendar; creator can see it (R9.18) |
| E68 | Participants | Non-creator tries to edit or delete | Rejected (R10.10) |
| E69 | Participants | Participant sets own tag on shared event | Only their view changes (R10.8) |
| E70 | Participants | Team deleted or viewer leaves team | Team name gone; participation kept (R18.8) |
| E71 | Display | Very short event | Compact layout; exact position; selectable (R5.9, R5.12) |
| E72 | Display | Cluster too dense for the width | `+N more`; list is reachable (R4.6, R4.7) |
| E73 | Display | Very long title | Truncated (R5.13) |
| E74 | Display | Untagged event | No indicator (R5.5) |
| E75 | Display | Event with participants but no team | No team name (R5.3) |
| E76 | Display | Empty week | Empty state (R15.2) |
| E77 | Display | Drag crossing days or starting on a block | Stays in start day; no selection on a block (R6.7, R6.9) |
| E78 | Display | Touch scroll versus selection | Scroll does not select; long press does (R6.11) |
| E79 | Tags | Tag is deleted while events use it | Events unchanged; no indicator for that tag; selector shows no tag (R22.6, R22.9) |
| E80 | Tags | Create or rename a tag to an existing name in a different case | Rejected (R22.3) |
| E81 | Tags | Orange or Yellow tag on a block | Indicator has a 1 px `#171717` outline (R5.6a) |
| E82 | Mobile | Horizontal swipe on the grid | Columns scroll; the week does not change (R16.13) |
| E83 | Mobile | Vertical scroll with the finger on an empty slot | Scrolls; no selection starts (R6.11, R16.14) |
| E84 | Display | 60-minute interval, click on an empty row | Prefill start plus 30 minutes, shorter than the row (R6.3, R3.6) |
| E85 | Display | Interval changes between 15, 30 and 60 | Blocks keep exact position and height at 1 px per minute (R3.5, R3.15) |
| E86 | Participants | Event with 5 people; another session adds a fifth friend | Rejected at save (R9.7, R9.23) |
| E87 | Form | Add Event opened | No Calendar selector (R7.27) |
| E88 | Scroll | First render with Wake-up 07:00 on 15, 30 and 60-minute grids | Scroll offset 420 px on each (R3.10) |
| E89 | Scroll | Wake-up changed while the timetable is open | Saved; no scroll; used at the next first render (R13.20, R3.17) |
| E90 | Scroll | Week navigation, interval, 12/24h, timezone change, settings, dialog, event create or edit or delete, Undo, refetch | Scroll position unchanged (R3.17, R2.8) |
| E91 | Scroll | First render when the grid cannot scroll to the wake-up offset (short content or tall viewport) | Maximum scroll position used (R3.10) |
| E92 | Scroll | Settings fail to load | Timetable renders with default Wake-up 07:00; defaults not saved (R3.10, R13.16) |
| E93 | Timezone | Week with a 23-hour or 25-hour day; wake-up row in a skipped or repeated hour | Offset taken from the local-clock axis; same as other weeks; no failure (R3.18) |
| E94 | Timezone | Display timezone changed after the first render | Scroll position stays; events re-rendered at converted positions (R3.17, R14.4) |
| E95 | Empty | Empty week at first render | Empty state shown; grid still scrolled to the wake-up time (R3.10, R15.2) |
| E96 | Settings | Stored Wake-up or Bedtime missing, corrupt or equal to each other | Per-field default for the invalid field; renders (R13.14) |
| E97 | Privacy | Another user requests Wake-up or Bedtime | Nothing returned (R17.2, R17.6) |
| E98 | Retries | Wake-up save fails, then retry | Reverts to saved value; error; retry gives one effect (R13.15) |

---

## 7. Out of Scope
See 1.3.

---

## 8. Decision Log (resolved questions)
| OQ | Decision | Applied in |
|---|---|---|
| 1 | Repeat OFF offers Specific Date only | R8.2 |
| 2 | Repeat ON offers Day of Week only; one-time events stay one-time | R8.4, R8.20 |
| 3 | One weekday and one time range per slot | R7.7, R8.10 |
| 4 | From and Until required; defaults; 2-year maximum; no open-ended | R8.11 to R8.15 |
| 5 | Reject overlapping or duplicate slots in one event | R7.17 |
| 6 | End at 24:00 allowed; no slot crosses midnight | R7.9, R7.10 |
| 7 | Gap shifts forward; repeated hour uses earlier; one-time ambiguous earlier | R7.14, R8.19, R14.16 |
| 8 | Event timezone chosen at creation; edited in it | R7.1, R7.16, R14.6 |
| 9 | Three scopes; defined rules; undo | R11, R12 |
| 10 | Past events editable; confirmation for past recurring | R11.10, R12.12, R12.13 |
| 11 | Friend search rules | R9.1, R9.2 |
| 12 | ~~6 participants including creator~~ superseded by FD-2: 5 people including creator; configurable later | R9.7 |
| 13 | Invitation rules | R9, R10 |
| 14 | Acceptance kept after edits | R9.15, R9.16 |
| 15 | Invitations screen is a future spec | R9.20, 1.3 |
| 16 | Team handling | R9.25, R18.5, R18.8 |
| 17 | Per-user tags, selector, indicator | R5.4 to R5.6, R7.19 |
| 18 | Compact layout priority | R5.9 to R5.12 |
| 19 | No overnight slots; segments show the full range | R7.10, R5.15 |
| 20 | Side by side; `+N more` | R4.3 to R4.9 |
| 21 | Header format | R1.3 to R1.9 |
| 22 | ~~Clip; indicator; no auto-expand~~ superseded by FD-9: always 24 hours, no clip, no indicator | R3.11 to R3.14 Removed; R3.16 |
| 23 | Keep same dates in view | R14.5 |
| 24 | No product-level navigation limit | R2.9 |
| 25 | Click, drag, long press | R6 |
| 26 | No drag move or resize | R6.13 |
| 27 | Defaults (visible-hours part superseded by FD-9: Wake-up 07:00, Bedtime 23:00) | R13.12 |
| 28 | Immediate apply; reset; discard confirmation | R13.2, R13.13, R7.21 |
| 29 | Limits | R7.4, R7.5, R9.7 |
| 30 | Three phases; repository abstraction | 1.5, R18.1, R18.2 |
| 31 | 1-minute precision | R3.6, R7.11 |
| 32 | English; locale-ready | R20 |
| 33 | Date to weekday on Repeat | R8.5 to R8.8 |
| 34 | Saved, then browser, then UTC | R14.17, R14.18 |
| 35 | Performance targets | R19 |
| FD-1 | Orange and Yellow tag indicators get a 1 px `#171717` outline. Tag colors unchanged | R5.6a, BR-20 |
| FD-2 | At most 5 people per event including the creator. The five primaries are the member colors, no sixth color. Member colors are small indicators in shared views only. The Figma color restriction (color only on the 5 px tag dot) is extended to those indicators | R5.17, R9.6, R9.7, BR-11, BR-20 |
| FD-3 | Tag Management is designed in Figma before implementation. Create, rename, change color, delete, view. MVP entry point is the Event Tag selector. Deleting a tag leaves events unchanged and stops showing its indicator (replaces "reassign or untag first") | R7.19, R22, BR-21 |
| FD-4 | Intervals are 15, 30, 60 minutes. Default 15. No 5-minute option. Event times keep 1-minute precision | R3.1, R13.1, R13.3, R19.5, BR-22 |
| FD-5 | No Calendar dropdown in Add Event for the MVP. Events belong to the creator's personal timetable. Shared events are created by adding participants. Team scheduling is Team Management's | R7.1, R7.27, BR-23 |
| FD-6 | Initial values pending visual QA: desktop breakpoint 1024 px; long press 400 ms; minimum block width 64 px; 1 px per minute vertical scale; density thresholds 78, 58, 32 px. Known deviation: Figma draws 64 px per hour (desktop) and 80 px per hour (mobile) | R3.15, R4.6, R5.9, R6.11, R16.1 |
| FD-7 | Mobile: horizontally scrollable weekday columns about 140 px wide, fixed time gutter, sticky day header, independent scrolling, no day-at-a-time layout. Horizontal swipe does not change the week | R16.2, R16.9 to R16.14, BR-24 |
| FD-8 | Timetable Settings, Tag Management, validation and confirmation dialogs and missing mobile states are designed by the user with Figma AI and approved before implementation. Approved components may proceed | 2.4 |
| FD-9 | Daily Routine replaces Visible Hours. The timetable always shows 24 hours (00:00 to 24:00). Wake-up time (default 07:00) sets the scroll position on the first render only and is never re-applied by the system. Bedtime (default 23:00) is stored only and has no visual effect. Both are whole minutes, private, persisted, and restored by Reset to Defaults. Bedtime may be earlier than Wake-up but not equal to it. Replaces OQ-22 and the 08:00 to 22:00 defaults | R2.8, R3.1, R3.10, R3.16 to R3.18, R6.8, R13.1, R13.6, R13.7, R13.12, R13.13, R13.18 to R13.20, BR-2 |

---

## 9. Remaining Open Items

### 9.1 Open questions (need a product decision before design)
| ID | Question | Proposed default | Affects |
|---|---|---|---|
| **OQ-36** | DST gap for a series occurrence. (a) "Next valid local time" means the first valid time after the gap (03:00 for a 02:30 start on 2026-03-08 in New York), or the same offset into the new hour (03:30)? (b) How is the end time resolved, and what if start and end both fall in the gap, or the resolved end is not later than the start? | (a) First valid time after the gap. (b) Resolve start and end independently; if the end is not later than the start, keep the slot's nominal duration from the resolved start | R8.19, R11.13, E51 |
| **OQ-37** | When an Entire series or This and following edit changes something an individually modified occurrence also changed (for example the title), does the individual change win? And if the edit removes the slot or date the individual occurrence came from, is that occurrence removed? | Individual changes win for the fields they changed. An occurrence whose origin no longer exists is removed, and the preview (R11.11) states how many | R11.9, E43 |
| **OQ-38** | Invitation status details. (a) How does a participant who left appear to the creator, and can the creator re-invite? (b) Do declined or left participants count toward the limit of 5? | (a) Shown as "Left"; may be invited again, like declined. (b) Only pending and accepted participants count | R9.28, R9.7 |
| **OQ-39** | Event timezone in the form. (a) WHEN the user changes the event timezone while creating an event, do the entered times keep their wall-clock values (and so change instant) or keep their instant (and so change wall-clock)? (b) Are values prefilled by clicking or dragging (in the display timezone) converted to the event timezone? (c) Is the event timezone really locked after creation? | (a) Keep wall-clock values. (b) Keep the instant: a drag at 09:00 display time prefilled into a different event timezone shows the converted wall-clock time. (c) Locked | R6.16, R7.26 |
| **OQ-41** | Is Undo feasible after deleting an event with participants (invitation and acceptance states, change records already emitted)? | Undo only for personal events; shared events show an irreversible-delete confirmation | R12.9, R12.10 |
| **OQ-42** | Confirm the phase mapping in 1.5. For example, the Repeat toggle and participants field are listed in Phase 3. Are they built disabled or absent in Phases 1 and 2? | Absent until Phase 3 | 1.5 |

### 9.2 Assumptions (confirm or correct)
| ID | Assumption |
|---|---|
| A-2 | The Today control is inactive when the current week is already shown |
| A-4 | Wake-up time and Bedtime are whole minutes (`HH:mm`), independent of the grid interval. The former assumption (whole-hour visible start and end) is superseded by FD-9 |
| A-8 | Mock seed data covers the cases listed in R18.3 |
| A-9 | Week navigation, and every other change after the first render, keeps the vertical scroll position (R2.8, R3.17) |
| A-10 | An event always keeps at least one time slot |
| A-13 | An accepted participant sees the creator and other accepted participants by name, not the status of pending or declined users |
| A-14 | A completed occurrence is one whose end instant is not later than now |
| A-15 | The event timezone cannot be changed after creation |
| A-16 | The length of the Undo period is a design parameter |
| A-17 | On touch devices a tap on an empty slot behaves like a click |
| A-18 | Deleting a tag asks for confirmation (R22.5). The decision FD-3 did not say so |
| A-19 | Orange and Yellow member-identification indicators (R5.17) get the same 1 px `#171717` outline as tag indicators. FD-1 names tag indicators only |
| A-20 | The minimum block width of 64 px, the 1 px per minute scale and the density thresholds are initial values and may change after visual QA (FD-6) |
| A-21 | The minimum click or touch target for tiny blocks (R5.12) is still unapproved. Audit proposal: 24 px on desktop, 44 px on touch |

### 9.3 Interpretations I made to resolve conflicts between decisions (confirm)
| ID | Conflict | Resolution |
|---|---|---|
| C-1 | OQ-19 says splitting at midnight is not required because overnight slots are out of scope. But a slot that does not cross midnight in its own timezone crosses midnight in other viewers' timezones | Midnight-crossing display is still required (render-only), not as overnight support. Each segment shows the full original range as OQ-19 states (R5.15) |
| C-2 | OQ-7 gives a rule only for recurring gap times and for ambiguous one-time times. It does not say what happens to a one-time event typed into a gap | Rejected with a message, as before (R7.13), consistent with "no silent shifting" |
| C-3 | OQ-9 says "This occurrence" and "This and following" apply to edits, while OQ-13 says invitations apply to the entire series, and the brief lets users edit recurrence and participants | The scope offered depends on the fields changed (R11.3). Participants and recurrence range need Entire series |
| C-4 | OQ-9 says "Entire series applies to the entire recurring series" and also that completed occurrences stay unchanged when editing future occurrences | Entire series includes completed occurrences, with a confirmation (R11.8, R11.10). Completed occurrences stay unchanged only in the scopes that exclude them (This occurrence, This and following from a later occurrence) |
| C-5 | OQ-1/OQ-2 say Specific Date slots stay one-time and are not recurring, but OQ-33 converts dates to weekdays when Repeat is turned ON | Repeat ON switches the whole event to Day of Week slots (R8.4). An existing one-time event becomes recurring only when the user turns Repeat ON and saves (R8.20, R8.21) |
| C-6 | OQ-25 says clicking an event opens the Edit modal, while OQ-18 says to show full information when the event is selected | Selected means the Edit (or read-only) modal is open (R6.1, R15.3) |
| C-7 | OQ-31 (1-minute precision) conflicts with steering, which says 5 minutes | Requirements follow OQ-31. Steering change S-5 is needed |
| C-8 | OQ-20 says show side by side, and the brief says to show overlapping events without hiding information | `+N more` hides blocks but never information: every hidden occurrence is reachable (R4.7) |

---

## 10. Blockers Before Technical Design
1. **Pending Figma designs (section 2.4).** Timetable Settings, Tag Management, the missing dialogs and the missing mobile states must be designed and approved before the parts that depend on them are implemented. Approved components may proceed.
2. **Follow-up for FD-9.** `design.md`, `tasks.md`, `figma-audit.md`, `product.md` and `tech.md` still mention visible hours and must be reconciled (see the change report).
3. **Steering updates** S-1 to S-7 and S-12 to S-15 (section 2.3). Design cannot start while `tech.md` still says 5-minute storage and tasks-with-one-tag.
4. **Open questions OQ-36 to OQ-39, OQ-41, OQ-42** (OQ-40 is resolved by FD-3). OQ-36 (DST gap detail), OQ-37 (series edits versus individual changes) and OQ-39 (event timezone in the form) affect the data model most. OQ-38 and OQ-41 can be settled during design if you accept the proposed defaults.
5. **Confirmation of interpretations** C-1 to C-8 and assumptions in 9.2.
6. **Cross-feature contracts.** Friend Management search, the tag management component, the Invitations operations and the busy-time interface need owners before Phase 3 design.
