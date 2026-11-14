# Tasks: Personal Weekly Timetable

Status: DRAFT v1, awaiting approval. No code has been written. Based on `requirements.md` v4 and `design.md` v1 (both committed).

## How to read this plan

Every task lists its objective, the files it touches, what "done" means, the tests it adds, the tasks it depends on and its status. `_Requirements:_` lists the acceptance criteria the task satisfies or tests.

| Status | Meaning |
|---|---|
| `Ready` | Can start as soon as its dependencies are done |
| `Decision` | Can be built, but uses a provisional decision. Confirm it before starting, or accept rework |
| `Blocked` | Needs another feature spec that does not exist yet |

Rules for every task:
- Tests are written in the same task as the code. Milestone 8 completes and audits coverage, it does not replace per-task tests.
- A task is done only when `build`, `lint` and `test` pass (`tech.md`) and its "Done when" items are met.
- Test titles include the requirement ids they cover, for example `it('[R7.4] rejects a 101-character title')`. Task 8.1 uses this for traceability.
- Finish and verify a milestone (its exit check) before starting the next.
- Work happens on branch `feat/personal-weekly-timetable` (`structure.md`). Commits only when you ask.

## Assumptions behind this plan

1. You approved `design.md`, including D-1 (custom grid instead of FullCalendar), D-3 (TanStack Query and the other three runtime dependencies) and D-4 (all writes through one Edge Function).
2. The provisional defaults for OQ-36 to OQ-42 stand. Tasks that depend on them are marked `Decision`.
3. The eight milestones below replace the six phases in design section 11. Mapping: M1 and M2 cover Phase 1, M3 and M4 cover Phase 2, M5 is Phase 3, M6 is Phase 4, M7 is Phase 5, M8 is Phase 6.
4. Recurrence and participant controls are built in M3, but saving them stays off behind two feature flags (`recurrence`, `participants`) until M6 and M7 implement their behavior. The flags are constants in one module, not a new dependency.
5. Steering updates S-1 to S-11 are applied before M1 starts (task 1.0).

## Gates outside this plan

| Gate | Needed before | Owner |
|---|---|---|
| G-1 Steering updates S-1 to S-11 approved | 1.1 | You |
| G-2 Figma audit reviewed (task 1.4) | 1.5 and every UI task | You |
| G-3 OQ-36, OQ-37, OQ-39 confirmed | M6 `Decision` tasks | You |
| G-4 Authentication spec (owns `profiles`; decision D-A: no stub) | 5.3, 5.11 | Authentication spec |
| G-5 Friend Management spec | 7.8 | Friend Management spec |
| G-6 Team Management spec | real team data in 7.9 | Team spec |

## Milestone overview

| Milestone | Can start now | Blocked parts |
|---|---|---|
| M1 Project and UI Foundation | Yes, after G-1 | none |
| M2 Weekly Calendar | Yes | none |
| M3 Event Editor | Yes | none |
| M4 Calendar Interactions | Yes | none |
| M5 Persistence | Local Supabase, schema, RLS, functions | Auth wiring (5.3, 5.11) needs G-4 |
| M6 Recurrence and Timezones | Yes, with `Decision` tasks | none external |
| M7 Participants and Sharing | Contracts, invitation logic with a friend stub | Real friend search (7.8), real team data (7.9) |
| M8 Testing and Quality | Yes, as milestones finish | none |

---

## Milestone 1 — Project and UI Foundation

- [x] 1.0 Apply approved steering updates
  - Objective: Update `tech.md`, `product.md` and `structure.md` with S-1 to S-11 (requirements 2.3, design 13.2), so tasks follow current rules.
  - Files: `.kiro/steering/tech.md`, `product.md`, `structure.md`
  - Done when: 1-minute precision, the event, slot and occurrence model, per-user tags, participant read access, the custom grid, the four runtime dependencies, no Realtime and the folder layout are all recorded. Nothing else changes.
  - Tests: none (documentation). You review the diff.
  - Depends on: G-1
  - Status: `Decision` (needs your approval of the wording)
  - _Requirements: none directly (enables all)_

- [x] 1.1 Verify the workspace and scaffold the project
  - Objective: Confirm there is no existing app (currently true), then create a Vite + React + TypeScript (strict) project with ESLint, Prettier, Vitest, React Testing Library and Playwright.
  - Files: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `.prettierrc`, `.env.example`, `src/main.tsx`, `src/App.tsx`, `tests/e2e/smoke.spec.ts`
  - Done when: `npm run build`, `npm run lint`, `npm test` and `npm run test:e2e` pass. `tsconfig` has `strict: true` and `noUncheckedIndexedAccess: true`. A `test:tz` script runs Vitest under `TZ=UTC`, `TZ=Asia/Seoul` and `TZ=America/Los_Angeles`. Playwright has a desktop Chromium project and two mobile projects (Pixel-class Chromium, iPhone-class WebKit).
  - Tests: one unit smoke test, one Playwright smoke test that loads the app.
  - Depends on: 1.0
  - Status: `Ready`
  - _Requirements: R14.20_

- [x] 1.2 Configure Tailwind and shadcn/ui
  - Objective: Add Tailwind and initialize shadcn/ui. Add only the primitives used in later tasks: Button, Dialog, Sheet, Popover, Input, Select, Switch, Toast.
  - Files: `tailwind.config.ts`, `postcss.config.js`, `src/styles/globals.css`, `components.json`, `src/components/ui/*`
  - Done when: a Button renders with Tailwind classes, and the build includes no unused shadcn components.
  - Tests: component smoke test for Button.
  - Depends on: 1.1
  - Status: `Ready`
  - _Requirements: none directly (stack from `tech.md`)_

- [x] 1.3 Add runtime dependencies
  - Objective: Install `luxon` (with `@types/luxon`), `@tanstack/react-query`, `react-hook-form`, `zod`, `zustand`, and dev-only `@axe-core/playwright`. Nothing else.
  - Files: `package.json`, lockfile
  - Done when: versions are pinned at the latest stable release checked at install time. `npm ls` shows no peer-dependency warnings. A short note in `README.md` lists each dependency and why (design D-2, D-3).
  - Tests: build passes.
  - Depends on: 1.1
  - Status: `Ready`
  - _Requirements: none directly_

- [x] 1.4 Audit Figma and record design values
  - Objective: Use the connected Figma MCP server to read the desktop calendar, mobile layout, Add and Edit Event modals, Timetable Settings, reusable components and tokens. Compare them with `requirements.md` and fill every `[F]` value.
  - Files: `.kiro/specs/personal-weekly-timetable/figma-audit.md` (new)
  - Done when: the audit lists, for each Figma frame and component, the matching React component (design 7.2), the token values (colors, type scale, spacing, radius), the `[F]` constants (row height per interval, minimum block width, density thresholds, desktop breakpoint, mobile days visible, long-press delay), the tag palette, and each discrepancy or missing state (requirements 2.2). You have reviewed it. `requirements.md` and `design.md` change only after that review.
  - Tests: none (documentation).
  - Depends on: none (can run in parallel with 1.1 to 1.3)
  - Status: `Ready`
  - _Requirements: R5.4, R5.6, R5.7, R5.9, R16.1, R16.2_

- [x] 1.5 Implement design tokens and layout constants
  - Objective: Turn the audited Figma values into CSS variables, a Tailwind theme extension, named layout constants and the tag palette.
  - Files: `src/styles/tokens.css`, `tailwind.config.ts`, `src/features/timetable/constants/layout.ts`, `src/features/tags/palette.ts`
  - Done when: every value comes from `figma-audit.md`, and no component hardcodes a color, spacing or size. Each palette `color_key` maps to a token. Block backgrounds are monochrome tokens (R5.4).
  - Tests: unit test that every palette key has a token. A contrast unit test (small in-house function, no dependency) checks that text tokens are at least 4.5:1 and tag indicators at least 3:1 against the block background.
  - Depends on: 1.2, 1.4 (and G-2)
  - Status: `Ready`
  - _Requirements: R5.4, R5.6, R21.8_

- [x] 1.6 Implement civil-date utilities and the clock
  - Objective: Create the zone-free date helpers that every calendar calculation uses (design D-14, 3.1).
  - Files: `src/domain/time/types.ts`, `src/domain/time/local-date.ts`, `src/domain/time/clock.ts`
  - Done when: `LocalDate` parsing and validation, `addDays`, `weekdayOf` (Monday = 1), `mondayOf`, `addWeeks` and `addMonthsClamped` exist. An injectable `Clock` exists. No function uses `Date` local-time methods.
  - Tests: month and year boundaries (2026-11-30 to 2026-12-06, 2026-12-28 to 2027-01-03), leap day 2028-02-29, `addMonthsClamped('2026-11-30', 3) = '2027-02-28'`. Passes under all three `TZ` values.
  - Depends on: 1.1
  - Status: `Ready`
  - _Requirements: R2.1, R2.2, R8.12, R14.20_

- [x] 1.7 Define data types and the repository contract
  - Objective: Write the TypeScript contract between UI and data (design 5.1) and provide it through React context.
  - Files: `src/features/timetable/data/types.ts`, `repository.ts`, `directories.ts` (`FriendDirectory`, `TagDirectory`), `RepositoryProvider.tsx`, `src/features/timetable/flags.ts`
  - Done when: `EventBundle`, `EventInput`, `UpdateRequest`, `ChangePreview`, `PreferencesRow`, `Result` and the error codes exist exactly as in design 5.1. Components can only obtain a repository through `useRepository()`. The `recurrence` and `participants` flags exist, defaulting to off.
  - Tests: `useRepository()` throws a clear error outside the provider. Type tests compile.
  - Depends on: 1.6
  - Status: `Ready`
  - _Requirements: R18.1_

- [x] 1.8 Build the mock repository (read paths and preferences)
  - Objective: An in-memory `MockRepository` that stores rows in the normalized shape of design section 4 and serves reads and preferences.
  - Files: `src/features/timetable/data/mock/mock-repository.ts`, `mock-store.ts`, `seed.ts`, `simulate.ts`
  - Done when: `getEventsInRange`, `getEvent`, `getPreferences`, `patchPreferences` and `resetPreferences` work. Latency, failure and stale-version simulation can be toggled per test. Data is scoped per mock user, and two users are available. Seed data covers the one-time cases of R18.3: current-week events, a cluster of at least 5 overlapping events, adjacent events, a 12:20–13:15 event, a multi-date one-time event, events outside visible hours, and tags with different colors.
  - Tests: range filtering uses half-open intervals. Another user's data is never returned. The failure switch returns `UNAVAILABLE`.
  - Depends on: 1.7
  - Status: `Ready`
  - _Requirements: R18.2, R18.3, R17.2_

- [x] 1.9 Build mock friend and tag directories
  - Objective: Mock `FriendDirectory` and `TagDirectory` for M3 and M7.
  - Files: `src/features/timetable/data/mock/mock-friends.ts`, `mock-tags.ts`
  - Done when: friend search matches display name or username, needs at least 2 characters, and returns at most 10 results. `UserSummary` has only id, display name, username and an optional avatar URL. Tags return name and `color_key`.
  - Tests: 1-character query returns nothing, 11 matches return 10, the result type has no email or phone field.
  - Depends on: 1.7
  - Status: `Ready`
  - _Requirements: R9.1, R9.2, R17.8, R18.7, R18.9_

- [x] 1.10 Implement locale-aware time formatting and messages
  - Objective: One formatting module for times, ranges and dates, plus an English message catalogue (design 3.2, 3.10).
  - Files: `src/domain/format/time.ts`, `src/domain/format/formatter-cache.ts`, `src/features/timetable/messages/en.ts`
  - Done when: `formatTime` handles 12-hour and 24-hour, shows midnight as `12:00 AM` and noon as `12:00 PM`, and shows an end at midnight as `24:00` in 24-hour format. `formatRange` uses an en dash (`12:20–13:15`). Formatters are cached per zone and locale. No component builds date text from strings.
  - Tests: R13.4 and R13.5 examples, `24:00` end, the 12-hour format overrides locale defaults, and a German locale changes weekday and month names.
  - Depends on: 1.6
  - Status: `Ready`
  - _Requirements: R5.2, R13.4, R13.5, R20.1, R20.2, R20.3, R20.4_

- [x] 1.11 Build the app shell and AppHeader
  - Objective: The page frame with the Add Event button and settings entry, and the Query and repository providers.
  - Files: `src/App.tsx`, `src/features/timetable/components/shared/AppHeader.tsx`, `src/app/providers.tsx`
  - Done when: the header matches the audited Figma frame, the Add Event and Settings buttons have accessible names, a slot for a future user menu exists, and the mock repository is provided in development and tests.
  - Tests: component test for button names and callbacks. Playwright smoke test sees the header on desktop and mobile.
  - Depends on: 1.2, 1.5, 1.7, 1.8
  - Status: `Ready`
  - _Requirements: R6.14, R18.1_

**M1 exit check:** 1.0 to 1.11 done. `build`, `lint`, `test`, `test:tz` and `test:e2e` pass. `figma-audit.md` reviewed.

---

## Milestone 2 — Weekly Calendar

- [x] 2.1 Implement zone conversion and the DST resolver
  - Objective: The single function that turns a local date and minute in a zone into an instant, and the reverse (design 3.2, 3.3). The calendar needs it for week boundaries, so it comes before recurrence.
  - Files: `src/domain/time/zone.ts`, `src/domain/time/resolve-local.ts`
  - Done when: `toLocal(instant, zone)` and `resolveLocal(date, minute, zone, context)` exist. Normal, repeated-hour (earlier instant) and gap cases are detected. A one-time gap returns `nonexistent`. A series gap returns the first valid time after the gap. Minute 1440 means 00:00 of the next date.
  - Tests: every row of the design 3.3 table that does not use the series end rule, plus Kathmandu (+05:45), Kolkata (+05:30), one zone with DST at midnight (date checked against tzdata) and one historical rule change. Passes under all three `TZ` values.
  - Depends on: 1.6, 1.3
  - Status: `Decision` (series gap policy is provisional OQ-36a)
  - _Requirements: R7.13, R7.14, R14.12, R14.13, R14.14, R14.16_

- [x] 2.2 Implement week range and navigation logic
  - Objective: Week boundaries, "today", the current-week test and navigation limits (design 3.4).
  - Files: `src/domain/time/week.ts`
  - Done when: `weekRange(monday, zone)` uses local calendar days, never +168 hours. `todayIn(zone, clock)`, `isCurrentWeek` and `canNavigate(monday, direction)` exist, with limits at 1900-01-01 and 2200-12-31.
  - Tests: week of 2025-03-03 in New York is 167 hours, week of 2025-10-27 is 169 hours. Monday 00:00 is inside the week and an end at Monday 00:00 is not. Navigation across months, years and the leap day. Limits block navigation.
  - Depends on: 2.1
  - Status: `Ready`
  - _Requirements: R1.2, R2.1, R2.2, R2.3, R2.5, R2.9, R14.9, R14.10_

- [x] 2.3 Implement the week header text
  - Objective: `formatWeekHeader(monday, locale)` (design 3.10).
  - Files: `src/domain/format/week-header.ts`
  - Done when: the output uses `Intl` parts. Separator styling follows the Figma audit.
  - Tests: `November 2026 — Nov 9–15`, `Nov–Dec 2026 — Nov 30–Dec 6`, `Dec 2026–Jan 2027 — Dec 28–Jan 3`. No digit sequence matching a week number appears. A German locale changes month names.
  - Depends on: 1.10, 2.2
  - Status: `Ready`
  - _Requirements: R1.3, R1.4, R1.5, R1.6, R1.7, R1.10_

- [x] 2.4 Implement effective preferences
  - Objective: Merge stored preferences with defaults and resolve the display timezone (design 7.3).
  - Files: `src/domain/preferences/effective.ts`, `src/features/timetable/hooks/usePreferences.ts`
  - Done when: defaults are 24-hour, 15 minutes, 08:00 to 22:00. Timezone resolves as saved (if valid), else browser (if valid), else `UTC`. A changed browser timezone never overwrites the saved one. An invalid field falls back to its default only.
  - Tests: each fallback path, invalid browser zone gives `UTC`, a partly corrupt row still renders, and a recognized-zone check that rejects `Mars/Olympus`.
  - Depends on: 1.8, 2.1
  - Status: `Ready`
  - _Requirements: R3.1, R13.12, R13.14, R14.17, R14.18, R14.19_

- [x] 2.5 Create the timetable UI store
  - Objective: Zustand store for the visible Monday, the selected occurrence key and which modal is open (design 7.3).
  - Files: `src/features/timetable/store/ui-store.ts`
  - Done when: the visible Monday is a `LocalDate`. It starts at the current week and resets to it on reload. A display timezone change does not change it.
  - Tests: initial week, previous, next and Today actions, timezone change keeps the same Monday.
  - Depends on: 2.2
  - Status: `Ready`
  - _Requirements: R1.2, R2.7, R14.5_

- [x] 2.6 Build CalendarHeader with navigation
  - Objective: Header text and previous, next and Today controls.
  - Files: `src/features/timetable/components/calendar/CalendarHeader.tsx`
  - Done when: it matches Figma. There is no date picker. Today is inactive on the current week. Controls at a navigation limit are inactive with an explanation. The header text is announced through a polite live region.
  - Tests: RTL clicks and keyboard (Enter, Space). Today inactive state. `aria-live` content changes on navigation.
  - Depends on: 2.3, 2.5, 1.5
  - Status: `Ready`
  - _Requirements: R1.3, R1.9, R2.1, R2.2, R2.3, R2.4, R2.9, R2.10, R21.6_

- [x] 2.7 Build the grid frame: WeeklyCalendar, DayHeader, TimeGutter, DayColumn
  - Objective: The empty grid with sticky headers, time labels and scrolling.
  - Files: `src/features/timetable/components/calendar/WeeklyCalendar.tsx`, `DayHeader.tsx`, `TimeGutter.tsx`, `DayColumn.tsx`
  - Done when: seven columns run Monday to Sunday. The gutter shows labels for the interval and visible range in the user's time format. Rows align to local time. Grid lines are CSS, not one element per row. The day header row and toolbar stay visible while scrolling vertically, and the gutter stays visible while scrolling horizontally. The first render scrolls to the start of the visible hours. Vertical scroll is kept when changing weeks.
  - Tests: column order, labels at 5, 15 and 30 minutes, Kathmandu 30-minute rows at :00 and :30, sticky elements present, initial and preserved scroll position. DOM node count for 5 minutes over 24 hours stays below a fixed bound.
  - Depends on: 2.4, 2.6
  - Status: `Ready`
  - _Requirements: R1.1, R1.8, R2.8, R3.2, R3.7, R3.8, R3.9, R3.10_

- [x] 2.8 Implement the week data hook (one-time events)
  - Objective: `useWeekOccurrences` loads bundles for the visible window and returns one-time occurrences.
  - Files: `src/features/timetable/hooks/useWeekOccurrences.ts`, `src/domain/recurrence/expand.ts` (one-time branch only)
  - Done when: each one-time slot yields exactly one occurrence. The query key is the UTC window, so a timezone change refetches. Requests for weeks the user has left are cancelled, and only the last requested week's data is shown. Data is requested by range only.
  - Tests: rapid navigation with mock latency shows only the last week. A timezone change triggers a new window.
  - Depends on: 1.8, 2.2, 2.4
  - Status: `Ready`
  - _Requirements: R2.6, R8.3, R14.2, R14.5, R18.11_

- [x] 2.9 Implement day split, geometry and clipping
  - Objective: Pure functions that place occurrence segments in day columns (design 3.6).
  - Files: `src/domain/layout/day-split.ts`, `src/domain/layout/geometry.ts`
  - Done when: segments use wall-clock minutes of the display timezone, keep the occurrence key and the full original time label, are clipped to the visible range, and report outside-hours flags.
  - Tests: 12:20–13:15 has the same time-based position at 5, 15 and 30 minutes. Seoul 08:00–10:00 viewed in UTC gives two segments labeled `23:00–01:00`. An end exactly at midnight stays on its day. The R3.12 examples (06:00–07:30 and 21:30–23:00 with 08:00 to 22:00 visible).
  - Depends on: 2.1
  - Status: `Ready`
  - _Requirements: R3.3, R3.4, R3.5, R3.6, R3.11, R3.12, R3.14, R5.15, R14.10_

- [x] 2.10 Implement the overlap layout
  - Objective: `layoutDay` clustering, columns, width limit and overflow (design 3.8).
  - Files: `src/domain/layout/overlap.ts`
  - Done when: touching events do not overlap. Ordering is start, then longer first, then key. Clusters wider than the column allows end in an overflow entry with the correct N.
  - Tests: touching, identical, chain overlap, 6 overlapping events at a narrow width, and a determinism test over 1,000 seeded random sets using a small in-house seeded generator (no new dependency).
  - Depends on: 2.9
  - Status: `Ready`
  - _Requirements: R4.1, R4.2, R4.3, R4.4, R4.5, R4.6, R4.8, R4.9, R4.12_

- [x] 2.11 Implement density tiers and hit-testing
  - Objective: `densityFor` and `hitTest` (design 3.9).
  - Files: `src/domain/layout/density.ts`, `src/domain/layout/hit-test.ts`
  - Done when: thresholds come from the layout constants. The drawn rectangle always wins over an expanded touch area.
  - Tests: each tier boundary, a press on a 5-minute block hits the block, and a press between two tiny blocks picks the one under the pointer.
  - Depends on: 1.5, 2.10
  - Status: `Ready`
  - _Requirements: R5.9, R5.11, R5.12, R6.9_

- [x] 2.12 Build EventBlock
  - Objective: The block component with density tiers and Default, Hover and Selected states (design 7.2).
  - Files: `src/features/timetable/components/calendar/EventBlock.tsx`
  - Done when: it matches Figma. The background is monochrome and only the circular indicator uses the tag color. There is no indicator without a tag, and no team line without a team (even with participants). Text never overflows, and long titles truncate. States differ by more than color. The accessible name has the title, tag name, day, times and team. Titles render as plain text. The block is memoized.
  - Tests: each density tier, each state, no indicator when untagged, no team line, markup-like and emoji titles render as text, and the accessible-name content.
  - Depends on: 1.10, 2.11
  - Status: `Ready`
  - _Requirements: R5.1, R5.2, R5.3, R5.4, R5.5, R5.6, R5.7, R5.8, R5.10, R5.13, R5.14, R21.3, R21.4, R21.8_

- [x] 2.13 Build OverflowIndicator and OutsideHoursIndicator
  - Objective: The `+N more` control with its list, and the edge markers for clipped events.
  - Files: `src/features/timetable/components/calendar/OverflowIndicator.tsx`, `OutsideHoursIndicator.tsx`
  - Done when: `+N more` opens a list of the hidden events that works by pointer, touch and keyboard, and every listed event is selectable. Edge markers have accessible names.
  - Tests: list opens with Enter, focus moves into it, Escape closes and returns focus, and indicator labels.
  - Depends on: 2.12
  - Status: `Ready`
  - _Requirements: R3.12, R3.13, R4.6, R4.7, R21.9_

- [x] 2.14 Render events in the calendar
  - Objective: Connect the data hook, split, layout and components so the grid shows events.
  - Files: `WeeklyCalendar.tsx`, `DayColumn.tsx`, `src/features/timetable/hooks/useDayLayouts.ts`
  - Done when: seeded events render at exact positions, overlaps sit side by side or in overflow, and layout recomputes when data or settings change. Changing the display timezone keeps the same dates in view and moves events. Changing back restores the original rendering.
  - Tests: integration with the mock repository. The R14.5 example (Seoul to Los Angeles) moves the event out of Nov 9–15. Switching back restores it.
  - Depends on: 2.7, 2.8, 2.10, 2.12, 2.13
  - Status: `Ready`
  - _Requirements: R3.3, R4.3, R4.10, R4.11, R14.2, R14.3, R14.4, R14.5_

- [-] 2.15 Build TimezoneSelect
  - Objective: A searchable IANA timezone picker that shows the zone name (used in settings and the editor).
  - Files: `src/features/timetable/components/shared/TimezoneSelect.tsx`, `src/domain/time/zone-list.ts`
  - Done when: it lists IANA identifiers only and rejects any other value. It is keyboard operable and can be disabled.
  - Tests: search filters zones, an invalid value cannot be submitted, keyboard selection.
  - Depends on: 1.2, 2.1
  - Status: `Ready`
  - _Requirements: R7.16, R13.8_

- [~] 2.16 Build TimetableSettings (local)
  - Objective: Settings for interval, time format, visible start and end hours, timezone and Reset to Defaults, saved through the mock repository.
  - Files: `src/features/timetable/components/settings/TimetableSettings.tsx`, `src/features/timetable/hooks/usePreferenceMutations.ts`
  - Done when: every change applies immediately and saves the changed field without a Save button. A failed save returns to the last saved value with an error and retry. A failed load shows an error and never writes defaults. A start not earlier than the end is rejected. Reset restores the defaults. No event data changes.
  - Tests: each setting changes the grid. Rollback on simulated failure. Reset. Invalid hours rejected. Event instants unchanged after every setting change.
  - Depends on: 2.4, 2.14, 2.15
  - Status: `Ready`
  - _Requirements: R13.1, R13.2, R13.3, R13.4, R13.5, R13.6, R13.7, R13.9, R13.10, R13.13, R13.15, R13.16, R13.17_

- [~] 2.17 Implement the responsive layout
  - Objective: Desktop and mobile layouts using one component tree (design 8.1).
  - Files: `WeeklyCalendar.tsx`, `src/features/timetable/hooks/useColumnWidth.ts`, layout constants
  - Done when: the desktop shows all seven columns. Mobile shows the audited number of days, with horizontal scroll-snap so every day is reachable. Column width is measured and passed to the overlap layout. Touch targets are at least 44 by 44 CSS pixels on mobile. Resize and rotation keep the week and selection.
  - Tests: component tests at desktop and mobile widths. Playwright mobile projects reach Sunday by horizontal scroll, and the overflow appears at narrow width.
  - Depends on: 2.14
  - Status: `Ready`
  - _Requirements: R16.1, R16.2, R16.4, R16.6, R16.7, R3.9, R4.6_

- [~] 2.18 Measure a rendering baseline
  - Objective: Check design risk R-8 early with a synthetic 500-occurrence week.
  - Files: `tests/perf/render-baseline.spec.ts`, `src/features/timetable/data/mock/seed-large.ts`
  - Done when: a Playwright trace records first render after data (target under 1 second) with 500 occurrences at a 5-minute interval over 24 hours. Results are written to the M2 exit notes. Misses become follow-up tasks rather than blocking M2.
  - Tests: the perf spec itself.
  - Depends on: 2.17
  - Status: `Ready`
  - _Requirements: R19.1, R19.4, R19.5_

**M2 exit check:** the seeded week renders correctly against Figma on desktop and mobile. Navigation, intervals, formats, visible hours and timezone switching work. All M2 tests pass under the `TZ` matrix.

---

## Milestone 3 — Event Editor

- [~] 3.1 Implement event input validation
  - Objective: `validateEventInput` and the shared Zod schema, used by the browser now and the Edge Function in M5 (design 3.11).
  - Files: `src/domain/validation/event-input.ts`, `src/domain/validation/issues.ts`, `src/lib/schemas/event-input.ts`
  - Done when: every issue code in design 3.11 exists with a field path, and slot issues carry slot indexes. Overlap messages name both slots. Touching slots pass. Rules for fields hidden by the Repeat state are ignored. The participant limit is read from one config value.
  - Tests: one test per issue code. Boundaries: title 100 and 101 characters, 20 and 21 slots, end at 24:00 accepted, start at 24:00 rejected, 22:00 to 02:00 rejected, seconds rejected, 1-minute times accepted at any interval, repeat range at 2 years and 2 years plus one day, a weekday with no match in range.
  - Depends on: 2.1, 1.6
  - Status: `Ready`
  - _Requirements: R7.3, R7.4, R7.5, R7.8, R7.9, R7.10, R7.11, R7.12, R7.13, R7.17, R7.18, R8.11, R8.13, R8.14, R8.15, R8.18, R9.7, R15.16, R15.19, R15.22_

- [~] 3.2 Implement the form model and Repeat toggle logic
  - Objective: `EventFormValues`, `toEventInput`, `applyRepeatToggle`, `defaultRepeatUntil` and `maxRepeatUntil` (design 3.11, 7.4).
  - Files: `src/domain/forms/event-form.ts`, `src/domain/forms/repeat-toggle.ts`
  - Done when: each slot keeps both its date and weekday at all times. Turning Repeat on fills the weekday from the date only if the user never chose one. Turning it off restores dates. Nothing is deleted. Duplicates created by conversion are reported, not merged.
  - Tests: ON, OFF, ON keeps all values. 2026-11-16 becomes Monday. A user-chosen weekday is not overwritten. A slot added while Repeat was on has an empty date after turning it off. Default Until examples: 2026-11-16 to 2027-02-16, 2026-11-30 to 2027-02-28, 2026-05-31 to 2026-08-31.
  - Depends on: 1.6
  - Status: `Ready`
  - _Requirements: R8.2, R8.4, R8.5, R8.6, R8.7, R8.8, R8.9, R8.10, R8.12_

- [~] 3.3 Build ConfirmDialog
  - Objective: One dialog for delete, past-occurrence and discard confirmations.
  - Files: `src/features/timetable/components/shared/ConfirmDialog.tsx`, `DialogHost.tsx`
  - Done when: focus is trapped, Escape cancels, focus returns to the opener, and the text comes from the message catalogue.
  - Tests: each kind, focus trap and return, cancel changes nothing.
  - Depends on: 1.2, 1.10
  - Status: `Ready`
  - _Requirements: R7.21, R12.1, R21.5_

- [~] 3.4 Build the EventEditorModal shell
  - Objective: One modal for create, edit and read-only modes with the title field, form state and submit handling (design 7.2, 8.3).
  - Files: `src/features/timetable/components/editor/EventEditorModal.tsx`, `useEventForm.ts`
  - Done when: it is a dialog on desktop and a sheet on mobile, per Figma. Create mode starts with one slot, Repeat off and the display timezone as event timezone. Edit mode loads stored values. Closing a modified form asks to discard, and an unmodified one closes at once. On invalid submit, errors show next to fields, focus moves to the first invalid field, and each problem appears once. Errors are announced. Submit is inactive while a request runs, and a second click is ignored. On a failed save the input is kept.
  - Tests: default values, the dirty guard (cancel, Escape, outside click), focus behavior, error rendering, double submit sends once, failed save keeps input. The form stays reachable with a simulated on-screen keyboard (visual viewport resize).
  - Depends on: 3.1, 3.2, 3.3, 1.5
  - Status: `Ready`
  - _Requirements: R7.1, R7.2, R7.3, R7.21, R7.23, R7.24, R7.25, R15.12, R15.14, R15.17, R15.18, R15.20, R15.21, R16.5, R16.8, R21.5, R21.7_

- [~] 3.5 Build EventTimeSlotInput
  - Objective: The slot row: date or weekday, start and end times, remove, and the Add Time Slot control.
  - Files: `src/features/timetable/components/editor/EventTimeSlotInput.tsx`, `SlotList.tsx`
  - Done when: a date picker shows when Repeat is off and a weekday select when it is on. Times accept 1-minute precision in the user's time format. Add appends without changing existing slots and is unavailable at 20 slots with an explanation. Remove deletes only that slot, and the last slot cannot be removed. Errors identify the slot.
  - Tests: add and remove, 20-slot limit, last slot, 12-hour and 24-hour input, per-slot errors, the overlap message naming two slots.
  - Depends on: 3.4
  - Status: `Ready`
  - _Requirements: R7.5, R7.6, R7.7, R7.8, R7.11, R7.12, R7.17, R8.2, R15.13, R15.15_

- [~] 3.6 Build TagSelector
  - Objective: Choose one of the user's own tags, or none.
  - Files: `src/features/tags/TagSelector.tsx`
  - Done when: it lists only the user's tags from `TagDirectory`, with name and color, and allows none. It shows an unavailable state when tags fail to load. It offers no tag creation (provisional OQ-40a).
  - Tests: selection, none, unavailable state, other users' tags never listed.
  - Depends on: 1.9, 3.4
  - Status: `Decision` (OQ-40a)
  - _Requirements: R7.19, R5.5, R17.5, R18.9, R18.10_

- [~] 3.7 Add the event timezone field to the editor
  - Objective: Event timezone selection using TimezoneSelect, with the name always visible.
  - Files: `EventEditorModal.tsx`, `src/features/timetable/components/editor/EventTimezoneField.tsx`
  - Done when: create mode defaults to the display timezone and allows changes. Edit mode shows the zone and locks it. Changing the zone while creating keeps the typed wall-clock values (provisional OQ-39a). Validation runs in the event timezone.
  - Tests: default value, locked in edit, wall-clock values kept on change, a DST gap check uses the event timezone and not the display timezone.
  - Depends on: 2.15, 3.4
  - Status: `Decision` (OQ-39a)
  - _Requirements: R7.1, R7.2, R7.15, R7.16, R7.26, R14.6_

- [~] 3.8 Build RecurrenceSettings
  - Objective: The Repeat toggle and the From and Until date pickers.
  - Files: `src/features/timetable/components/editor/RecurrenceSettings.tsx`
  - Done when: the toggle is off by default. Turning it on shows the pickers with defaults and switches slots to weekday mode through `applyRepeatToggle`. Turning it off hides the pickers without clearing them. Range errors show. With the `recurrence` flag off, the toggle is not rendered, so no recurring event can be saved before M6.
  - Tests: defaults, hide-not-clear, range errors, toggle absent when the flag is off.
  - Depends on: 3.2, 3.5
  - Status: `Ready`
  - _Requirements: R8.1, R8.4, R8.11, R8.12, R8.13, R8.14, R8.15_

- [~] 3.9 Build ParticipantSelector (UI only)
  - Objective: Friend search, chips and the participant limit, against the mock directory.
  - Files: `src/features/timetable/components/editor/ParticipantSelector.tsx`, `ParticipantChip.tsx`
  - Done when: search starts at 2 characters with a hint and shows at most 10 results with display name and username only. Chips can be removed by pointer and keyboard. The creator and already selected users are excluded and the creator is not a chip. A sixth added friend is refused with an explanation. Empty, error and unavailable states keep existing chips. With the `participants` flag off, the field is not rendered.
  - Tests: the 1- and 2-character thresholds, 10-result cap, keyboard removal, limit, each state, no email or phone in the DOM.
  - Depends on: 1.9, 3.4
  - Status: `Ready`
  - _Requirements: R9.1, R9.2, R9.3, R9.4, R9.5, R9.6, R9.7, R9.26, R9.27, R17.8_

**M3 exit check:** the editor opens in create and edit modes against seeded data, all validation codes surface correctly, and the Repeat and participant controls work in isolation behind their flags.

---

## Milestone 4 — Calendar Interactions

- [~] 4.1 Add writes to the mock repository
  - Objective: Create, update (scope `event`), delete and set-my-tag in the mock, with server-equivalent behavior.
  - Files: `src/features/timetable/data/mock/mock-repository.ts`, `src/features/timetable/data/contract/repository-contract.ts`
  - Done when: writes run `validateEventInput`, resolve local times with the resolver, apply version checks (stale returns `STALE_VERSION`) and `requestId` idempotency, and delete is idempotent. A shared contract test suite exists and runs against the mock.
  - Tests: the contract suite covering create, update, stale update, duplicate request, delete twice, and another user's event returning `NOT_FOUND`.
  - Depends on: 1.8, 3.1
  - Status: `Ready`
  - _Requirements: R7.20, R7.22, R10.1, R10.2, R10.3, R10.10, R12.7, R17.3, R18.2_

- [~] 4.2 Implement mutation hooks
  - Objective: `useEventMutations` for create, update, delete and set-my-tag.
  - Files: `src/features/timetable/hooks/useEventMutations.ts`, `src/features/timetable/messages/errors.ts`
  - Done when: successful writes invalidate the affected week queries. Errors map to plain-language messages without internal ids. Stale writes refetch and show the latest data.
  - Tests: invalidation after create, error mapping per code, stale handling.
  - Depends on: 4.1
  - Status: `Ready`
  - _Requirements: R7.20, R7.23, R10.3, R10.4, R15.8, R15.11_

- [~] 4.3 Implement click-to-create
  - Objective: Clicking or tapping an empty slot opens the editor with a 30-minute range.
  - Files: `DayColumn.tsx`, `src/features/timetable/hooks/usePointerCreate.ts`
  - Done when: start is the clicked slot. End is 30 minutes later, capped at 24:00. Clicking a block never opens create.
  - Tests: 09:00 gives 09:00–09:30, 23:45 gives 23:45–24:00, tap behaves like click, a click on a tiny block's expanded area opens the block.
  - Depends on: 2.11, 3.4
  - Status: `Ready`
  - _Requirements: R6.3, R6.12, R6.9_

- [~] 4.4 Build the selection store and TimeRangeSelection
  - Objective: A separate high-frequency store and the drag preview (design 7.3, 8.6).
  - Files: `src/features/timetable/store/selection-store.ts`, `src/features/timetable/components/calendar/TimeRangeSelection.tsx`
  - Done when: only the preview subscribes to selection changes. It moves by transform and shows formatted start and end times.
  - Tests: render count of event blocks stays at zero during 100 simulated selection updates. The preview label uses the time format.
  - Depends on: 2.12
  - Status: `Ready`
  - _Requirements: R15.5, R19.3, R19.6_

- [~] 4.5 Implement drag-to-select (mouse and pen)
  - Objective: Vertical drag selection on empty space (design 8.2).
  - Files: `src/features/timetable/hooks/usePointerCreate.ts`, `DayColumn.tsx`
  - Done when: movement over the threshold starts a selection, snapped to the interval. It stays in the start day, clamps to visible hours, and handles upward drags. Release opens the editor with the range. Escape cancels. A press on a block never starts a selection. A settings change mid-drag ends or cancels without invalid values.
  - Tests: snapping at each interval, upward drag, crossing into another day keeps the start day, clamping, Escape, starting on a block, a single-row selection is one interval.
  - Depends on: 4.3, 4.4
  - Status: `Ready`
  - _Requirements: R6.4, R6.5, R6.6, R6.7, R6.8, R6.9, R6.10, R6.13, R6.15, R15.6_

- [~] 4.6 Implement touch long-press selection
  - Objective: Long press on empty space starts selection without blocking normal scrolling.
  - Files: `src/features/timetable/hooks/useLongPress.ts`, `usePointerCreate.ts`
  - Done when: a touch that moves before the audited delay scrolls and does not select. After the delay, selection starts and scrolling stops for that gesture. Release opens the editor.
  - Tests: timer logic with fake timers. Playwright mobile: a swipe scrolls, and a long press then drag creates a range.
  - Depends on: 4.5
  - Status: `Ready`
  - _Requirements: R6.11, R16.3_

- [~] 4.7 Implement keyboard navigation of the grid
  - Objective: Roving `TimeSlot` cursor with arrow keys, Shift-extend, Enter to create, Page Up and Page Down (design 8.5).
  - Files: `src/features/timetable/components/calendar/TimeSlot.tsx`, `src/features/timetable/hooks/useGridKeyboard.ts`
  - Done when: the grid has one tab stop. Arrows move by one interval and across days. Shift plus arrows extends a selection, and Enter opens the editor with it. Blocks are reachable in day and time order.
  - Tests: RTL keyboard sequences for each key, focus order of blocks, screen-reader labels on the cursor.
  - Depends on: 4.4
  - Status: `Ready`
  - _Requirements: R21.1, R21.2, R21.3_

- [~] 4.8 Implement event selection
  - Objective: Clicking a block, or Enter on it, opens it in the editor, and the block shows Selected.
  - Files: `DayColumn.tsx`, `ui-store.ts`, `EventEditorModal.tsx`
  - Done when: exactly one occurrence is Selected while its modal is open. Closing returns the block to Default and focus to the block. Navigating weeks clears the selection.
  - Tests: Selected state, focus return, one selection at a time, an overflow-list item opens the same way.
  - Depends on: 3.4, 2.14
  - Status: `Ready`
  - _Requirements: R6.1, R6.2, R15.3, R15.4_

- [~] 4.9 Wire the create flow
  - Objective: Add Event button, click and drag all create one-time events through the mock.
  - Files: `WeeklyCalendar.tsx`, `EventEditorModal.tsx`, `AppHeader.tsx`
  - Done when: a saved event appears without a reload. Prefilled times are in the display timezone and match the event timezone default. A double submit creates one event.
  - Tests: Playwright desktop: create by button, click and drag, including several dates in one event. The created block shows exact times.
  - Depends on: 4.2, 4.3, 4.5
  - Status: `Ready`
  - _Requirements: R6.14, R6.16, R7.20, R7.22_

- [~] 4.10 Wire the edit flow for one-time events
  - Objective: Edit title, slots and tag of a one-time event.
  - Files: `EventEditorModal.tsx`, `useEventMutations.ts`
  - Done when: valid changes save and appear on the calendar. Invalid changes keep stored values. A stale save shows the latest data. Changing only the tag asks no question.
  - Tests: component and Playwright: edit title, add and remove slots, change tag, simulated stale save.
  - Depends on: 4.8, 4.2
  - Status: `Ready`
  - _Requirements: R10.1, R10.2, R10.3, R10.4, R10.11, R10.12_

- [~] 4.11 Implement delete and undo
  - Objective: Delete with confirmation, the slot-or-event choice, and Undo for personal events (design 6.5).
  - Files: `src/features/timetable/store/pending-delete.ts`, `src/features/timetable/components/shared/UndoToast.tsx`, `EventEditorModal.tsx`
  - Done when: deletion needs confirmation. A one-time event with several slots asks "this time slot" or "entire event", and an event with one slot is deleted outright. The occurrences disappear at once and Undo appears for the design-set period (8 seconds, `A-16`). Undo restores everything exactly. When time runs out, or on `pagehide` or unmount, the delete is sent. A failed delete restores the event with an error. Past one-time events delete without extra confirmation.
  - Tests: fake-timer tests for undo and expiry, the `pagehide` flush, failure restore, the slot-or-event choice, the Undo announcement.
  - Depends on: 3.3, 4.2
  - Status: `Ready`
  - _Requirements: R12.1, R12.3, R12.4, R12.5, R12.6, R12.8, R12.9, R12.11, R12.12, R12.13, R21.7_

- [~] 4.12 Implement empty, loading and error states
  - Objective: The calendar's state panels (design 8.4).
  - Files: `src/features/timetable/components/calendar/CalendarStates.tsx`, `WeeklyCalendar.tsx`
  - Done when: loading shows a skeleton while header and navigation stay usable, and never shows the empty state. Empty shows an Add Event control with the grid. Error shows a plain message and Retry, and never shows old data as the new week. Retry recovers.
  - Tests: each state with mock simulation, retry recovery, no empty flash while loading.
  - Depends on: 2.14
  - Status: `Ready`
  - _Requirements: R15.1, R15.2, R15.7, R15.9, R15.10, R15.11_

**M4 exit check:** a user can create, view, edit and delete one-time events by button, click, drag, long press and keyboard on the mock, with all states visible. The contract suite passes against the mock.

---

## Milestone 5 — Persistence

- [~] 5.1 Set up local Supabase
  - Objective: Supabase CLI project, local stack for development and CI, browser client and environment variables.
  - Files: `supabase/config.toml`, `src/lib/supabase/client.ts`, `.env.example`, CI workflow
  - Done when: `supabase start` runs locally and in CI. The browser uses only the URL and anon key from the environment. The service role key exists only in the Edge Function environment. No secret is committed.
  - Tests: a CI job starts the stack and runs one connection test.
  - Depends on: M4 exit
  - Status: `Ready`
  - _Requirements: none directly (enables R17, R18)_

- [~] 5.2 Spike: share `src/domain` with the Edge Function
  - Objective: Prove an Edge Function can import `src/domain` through a Deno import map (design D-6, risk R-1).
  - Files: `supabase/functions/timetable/deno.json`, `supabase/functions/timetable/index.ts` (spike only)
  - Done when: a deployed-locally function calls `validateEventInput` and `resolveLocal`. If bundling fails, a generated copy in `supabase/functions/_shared` is used instead, and a CI check fails when the copy drifts from `src/domain`. The outcome is recorded in the M5 notes.
  - Tests: the function returns validation issues for an invalid payload.
  - Depends on: 5.1, 3.1
  - Status: `Ready`
  - _Requirements: R15.16_

- [~] 5.3 Add the profiles table or stub
  - Objective: A `profiles` table with `id`, `username` and `display_name`, owned by the Authentication spec.
  - Files: `supabase/migrations/<ts>_profiles.sql`
  - Done when: the Authentication spec's `profiles` migration exists and this task only depends on it. Decision D-A: the Authentication spec owns `profiles`, so no stub migration is added.
  - Tests: profile row creation for test users.
  - Depends on: 5.1, G-4
  - Status: `Blocked` (Authentication spec must be written and implemented first)
  - _Requirements: R17.1_

- [~] 5.4 Migrate timetable preferences
  - Objective: `timetable_preferences` with CHECK constraints, the IANA trigger and owner-only RLS (design 4.3, 9.2).
  - Files: `supabase/migrations/<ts>_timetable_preferences.sql`, `supabase/tests/preferences.test.ts`
  - Done when: nullable columns mean "default". Invalid intervals, hours, formats and zones are rejected. Only the owner can read or write the row. There is no delete policy.
  - Tests: owner read and write, another user and anonymous get nothing, invalid values rejected, start not before end rejected.
  - Depends on: 5.3
  - Status: `Blocked` (via 5.3)
  - _Requirements: R13.7, R13.8, R13.10, R13.14, R17.2, R17.6_

- [~] 5.5 Migrate events, segments and slots
  - Objective: `events`, `event_segments` and `event_slots` with shape checks, exclusion constraints and the slot limit (design 4.3). Recurring columns exist, but recurring rows are written only from M6.
  - Files: `supabase/migrations/<ts>_events_core.sql`, `supabase/tests/events-constraints.test.ts`
  - Done when: `btree_gist` is enabled. Overlapping slots in one event are rejected and touching slots pass, for both shapes. The 21st slot is rejected. A slot with the wrong shape for its event is rejected. A title over 100 characters is rejected. The event timezone cannot be updated.
  - Tests: one test per constraint, including deferred constraints allowing a replace-all-slots transaction.
  - Depends on: 5.3
  - Status: `Blocked` (via 5.3)
  - _Requirements: R7.4, R7.5, R7.8, R7.9, R7.17, R7.26, R14.1_

- [~] 5.6 Migrate participants, tag assignments and change records, with RLS
  - Objective: `event_participants`, `event_tag_assignments`, `event_change_records`, policy helper functions, RLS on every event table, and revoked direct grants (design 9.1, 9.2).
  - Files: `supabase/migrations/<ts>_event_access.sql`, `supabase/tests/rls-core.test.ts`
  - Done when: every table has RLS enabled. The browser roles cannot write event tables directly. Helper functions are `SECURITY DEFINER` with an empty `search_path`. Tag assignments allow only the user's own tags. Change records are not readable by clients.
  - Tests: creator, unrelated user and anonymous against each table. Direct insert by `authenticated` is denied. Using another user's tag is denied.
  - Depends on: 5.5
  - Status: `Blocked` (via 5.3)
  - _Requirements: R17.1, R17.2, R17.3, R17.5, R10.10_

- [~] 5.7 Write the database write functions (one-time events)
  - Objective: `save_event`, `apply_event_update` (scope `event`) and `delete_event_scope` (scope `event`) (design 6.1, 6.3, 6.5, 9.5).
  - Files: `supabase/migrations/<ts>_event_write_functions.sql`, `supabase/tests/event-writes.test.ts`
  - Done when: each runs in one transaction, locks the event row, checks `expected_version`, writes the creator's `accepted` participant row, and logs a change record keyed by `request_id`. Repeated requests return the existing result. Only the service role can execute them.
  - Tests: two sessions with the same version (one gets `STALE_VERSION`), the same `request_id` twice gives one effect, delete of a missing event succeeds, `authenticated` cannot execute.
  - Depends on: 5.6
  - Status: `Blocked` (via 5.3)
  - _Requirements: R7.22, R10.3, R12.7, R17.1_

- [~] 5.8 Write the read function for the visible week (one-time events)
  - Objective: `get_events_in_range(from, to)` as security invoker under RLS (design 6.2).
  - Files: `supabase/migrations/<ts>_get_events_in_range.sql`, `supabase/tests/read-range.test.ts`
  - Done when: it returns bundles where the caller has an `accepted` row and a slot intersects the half-open window, using the GiST index.
  - Tests: window boundaries, an unrelated user gets nothing, a query plan check that the index is used for a user with 5,000 events.
  - Depends on: 5.6
  - Status: `Blocked` (via 5.3)
  - _Requirements: R14.2, R14.10, R18.11, R17.3_

- [~] 5.9 Build the `timetable` Edge Function
  - Objective: Create, update and delete endpoints (design 5.2).
  - Files: `supabase/functions/timetable/index.ts`, `handlers/*.ts`, `supabase/functions/timetable/*.test.ts`
  - Done when: it verifies the JWT, rejects bodies over 64 KB and unknown fields, validates with the shared domain code, resolves local times to instants itself, calls the write functions with the service role, and maps errors to HTTP codes per `structure.md`. Error bodies contain codes and paths only. Logs contain ids and codes only.
  - Tests: 401 without a token, 422 with issues, 403 for a non-creator, 409 for a stale version, and a client-supplied creator id is ignored.
  - Depends on: 5.2, 5.7
  - Status: `Blocked` (via 5.3)
  - _Requirements: R15.11, R15.16, R10.10, R17.1_

- [~] 5.10 Implement SupabaseRepository
  - Objective: The contract implementation over RLS reads, the Edge Function and direct preference and tag-assignment writes.
  - Files: `src/features/timetable/data/supabase/supabase-repository.ts`
  - Done when: the shared contract suite from 4.1 passes against both repositories without UI changes.
  - Tests: the contract suite against local Supabase, using Supabase test users created by the test setup.
  - Depends on: 5.8, 5.9
  - Status: `Blocked` (via 5.3)
  - _Requirements: R18.1, R18.2_

- [~] 5.11 Wire authentication into the app
  - Objective: Use the signed-in user from the Authentication spec in the repository and route guards.
  - Files: `src/app/providers.tsx`, `src/features/timetable/data/supabase/session.ts`
  - Done when: the timetable loads only for a signed-in user, an expired session shows a sign-in message while keeping unsaved form input where possible, and the user menu slot in AppHeader is filled by the auth feature.
  - Tests: Playwright: signed-out users cannot see timetable data, session expiry during edit.
  - Depends on: 5.10, G-4
  - Status: `Blocked` (Authentication spec)
  - _Requirements: R17.1_

- [~] 5.12 Persist preferences in Supabase
  - Objective: Preferences saved per field across sessions and devices.
  - Files: `supabase-repository.ts`, `usePreferenceMutations.ts`
  - Done when: each change patches only its column. Reset sets all columns to null. Settings survive sign-out and sign-in and a second browser context. A failed load never writes defaults.
  - Tests: Playwright with two browser contexts for the same user. Rollback on a forced failure.
  - Depends on: 5.4, 5.10
  - Status: `Blocked` (via 5.3)
  - _Requirements: R13.2, R13.11, R13.13, R13.15, R13.16_

- [~] 5.13 Choose the repository by environment
  - Objective: Mock in development and tests, Supabase in production builds.
  - Files: `src/app/providers.tsx`, `vite.config.ts`
  - Done when: the production bundle contains no mock repository or seed code.
  - Tests: a build check that greps the production bundle for mock module markers.
  - Depends on: 5.10
  - Status: `Blocked` (via 5.3)
  - _Requirements: R18.1_

**M5 exit check:** one-time events and preferences persist in local Supabase for a signed-in user, the contract suite passes for both repositories, and all RLS and constraint tests pass.

Note: 5.1 and 5.2 can start once M4 is done. Everything else in M5 waits for G-4. If G-4 is late, M6 domain tasks (6.1 to 6.5) can proceed on the mock in the meantime.

---

## Milestone 6 — Recurrence and Timezones

Confirm OQ-36, OQ-37 and OQ-39 (gate G-3) before starting the `Decision` tasks. 6.1 to 6.5 run on the mock and do not need M5.

- [~] 6.1 Add the series end-time rule to the resolver
  - Objective: Resolve series start and end independently, and keep the nominal duration when the resolved end is not after the start (design 3.3, provisional OQ-36b).
  - Files: `src/domain/time/resolve-local.ts`, `src/domain/recurrence/resolve-slot.ts`
  - Done when: every row of the design 3.3 table passes, including both ends in the gap.
  - Tests: the full 3.3 table under all three `TZ` values.
  - Depends on: 2.1
  - Status: `Decision` (OQ-36)
  - _Requirements: R8.19, R14.16, R11.13_

- [~] 6.2 Implement series expansion
  - Objective: `expandBundle` for series: segments, weekday walk, first occurrence, window widening and memoization (design 3.7).
  - Files: `src/domain/recurrence/expand.ts`, `src/domain/recurrence/occurrence-key.ts`
  - Done when: occurrences appear exactly on matching weekdays from Repeat From through Repeat Until in the event timezone, keep their local time across DST, and use the keys from design 3.5.
  - Tests: Tuesday 09:00 New York at `14:00Z`, then `13:00Z`. Repeat From on a Wednesday with a Monday slot starts the next Monday. Until equal to From. A window that touches two event-timezone days. 500 occurrences expand within the M2 render budget.
  - Depends on: 6.1, 2.8
  - Status: `Ready`
  - _Requirements: R8.16, R8.17, R8.24, R14.7, R14.8_

- [~] 6.3 Apply recurrence exceptions
  - Objective: Cancelled and modified exceptions, including occurrences moved into another week (design 3.7 steps 2.4 and 3).
  - Files: `src/domain/recurrence/exceptions.ts`
  - Done when: a cancelled occurrence disappears, a modified one shows its new title and instants, and a moved one appears in its new week. Modified times follow the one-time DST rules.
  - Tests: each exception kind. A deleted occurrence stays deleted after a later series edit. A moved occurrence crosses a week boundary.
  - Depends on: 6.2
  - Status: `Ready`
  - _Requirements: R11.4, R11.5, R11.16_

- [~] 6.4 Implement scope operations and previews
  - Objective: Pure functions that apply Occurrence, Following and Series edits and deletes to a bundle, the allowed-scope rules, exception re-keying and preview counts (design 6.4).
  - Files: `src/domain/recurrence/scope.ts`, `src/domain/recurrence/allowed-scopes.ts`, `src/domain/recurrence/preview.ts`
  - Done when: allowed scopes follow R11.3. Following splits the segment at the selected local timestamp, across all slots. Following from the first occurrence equals Series. Re-keying keeps individual changes and drops exceptions whose origin vanished (provisional OQ-37). The preview returns created, removed, kept, exceptions removed and completed occurrences affected. Converting between one-time and series is Series-only.
  - Tests: the R11.6 Monday, Wednesday and Friday example, each scope for edit and delete, allowed scopes per changed field, re-keying cases, completed-occurrence counts with a fixed clock, a retried operation gives the same result.
  - Depends on: 6.3
  - Status: `Decision` (OQ-37)
  - _Requirements: R8.21, R8.22, R11.3, R11.4, R11.5, R11.6, R11.7, R11.8, R11.9, R11.10, R11.11, R11.14_

- [~] 6.5 Support series in the mock repository
  - Objective: The mock stores rules, segments and exceptions and supports scoped updates, deletes and `previewUpdate`.
  - Files: `mock-repository.ts`, `seed.ts`, `repository-contract.ts`
  - Done when: series seeds from R18.3 exist (a multi-slot series and an event at a DST change). The contract suite gains series cases. Stale scoped writes are rejected.
  - Tests: the extended contract suite against the mock.
  - Depends on: 6.4, 4.1
  - Status: `Ready`
  - _Requirements: R11.15, R18.2, R18.3_

- [~] 6.6 Migrate recurrence rules and exceptions
  - Objective: `recurrence_rules`, `event_exceptions`, the segment-validity exclusion constraint and their RLS (design 4.3).
  - Files: `supabase/migrations/<ts>_recurrence.sql`, `supabase/tests/recurrence-constraints.test.ts`
  - Done when: Until before From and ranges over 2 years are rejected. A rule can exist only for a recurring event. Segment ranges of one event cannot overlap. Exceptions are unique per original date and start. Read access follows event membership.
  - Tests: one per constraint, plus RLS for creator, unrelated user and anonymous.
  - Depends on: 5.6
  - Status: `Blocked` (via 5.3)
  - _Requirements: R8.13, R8.14, R17.3_

- [~] 6.7 Extend the write functions for series and scopes
  - Objective: Scoped update and delete in the database, including one-time to series conversion (design 6.4).
  - Files: `supabase/migrations/<ts>_scoped_writes.sql`, `supabase/tests/scoped-writes.test.ts`
  - Done when: the database applies the same operations as 6.4 under the event lock and version check. Disallowed field and scope combinations return `VALIDATION`.
  - Tests: parity tests that run the same cases through 6.4 and through the database and compare the resulting occurrences. Two concurrent scoped writes, one rejected.
  - Depends on: 6.4, 6.6, 5.7
  - Status: `Blocked` (via 5.3)
  - _Requirements: R8.21, R8.22, R11.3, R11.6, R11.7, R11.8, R11.15, R11.17_

- [~] 6.8 Extend reads and the Edge Function for series
  - Objective: Series in `get_events_in_range`, scope handling and `dryRun` preview in the Edge Function.
  - Files: `get_events_in_range` migration, `supabase/functions/timetable/handlers/update.ts`, `delete.ts`
  - Done when: series whose local date range meets the window are returned, along with exceptions moved into the window. `dryRun` returns counts without writing.
  - Tests: contract suite series cases against Supabase. `dryRun` leaves the data unchanged.
  - Depends on: 6.7, 5.9
  - Status: `Blocked` (via 5.3)
  - _Requirements: R11.11, R18.11, R8.24_

- [~] 6.9 Enable recurrence in the editor
  - Objective: Turn on the `recurrence` flag and add ScopeDialog, previews, the past-occurrence confirmation and the series summary.
  - Files: `flags.ts`, `src/features/timetable/components/shared/ScopeDialog.tsx`, `EventEditorModal.tsx`
  - Done when: saving a series works. Editing an occurrence asks for scope with only the allowed options. Cancel changes nothing. The preview shows counts before replacement. A confirmation appears when completed occurrences are affected. A one-time event becomes a series only after the user turns Repeat on and saves. Recurring delete combines scope and confirmation. Series blocks show a repeat marker if the Figma audit includes one.
  - Tests: component tests per scope and per changed field. Playwright edit and delete for each scope on the mock.
  - Depends on: 6.5, 3.8
  - Status: `Ready`
  - _Requirements: R5.16, R8.20, R8.21, R8.22, R8.23, R10.5, R11.1, R11.2, R11.10, R11.11, R12.2_

- [~] 6.10 Finish event-timezone editing
  - Objective: The editor shows and interprets the schedule in the event timezone, and converts prefilled click and drag times (provisional OQ-39b).
  - Files: `EventEditorModal.tsx`, `src/domain/forms/prefill.ts`
  - Done when: an event created in Seoul and edited by a viewer in Los Angeles shows Seoul times and the zone name. A drag at 09:00 display time prefilled into a different event timezone shows the converted time. A display timezone change while the form is open does not change entered values.
  - Tests: the cases above as component tests, plus a Playwright test with `timezoneId` set.
  - Depends on: 3.7, 6.9
  - Status: `Decision` (OQ-39)
  - _Requirements: R6.16, R7.15, R14.6, R14.15, R14.21_

- [~] 6.11 Add timezone and DST end-to-end tests
  - Objective: Prove timezone behavior through the UI on fixed dates.
  - Files: `tests/e2e/timezone.spec.ts`, `tests/e2e/dst.spec.ts`
  - Done when: with Playwright clock control, the weeks containing 2025-03-09, 2025-11-02 and 2026-03-08 render with the right local times. Two browser contexts in Seoul and Los Angeles see the same event at their own times. Changing and restoring the display timezone restores the original rendering. A one-time time in a gap is rejected in the form.
  - Tests: the specs themselves, on desktop and mobile projects.
  - Depends on: 6.9, 6.10
  - Status: `Ready`
  - _Requirements: R7.13, R14.3, R14.4, R14.7, R14.9, R14.11, R14.22_

**M6 exit check:** recurring events with several slots, exceptions and all three scopes work on the mock (and in Supabase when M5 is unblocked). All DST fixtures pass under the `TZ` matrix.

---

## Milestone 7 — Participants and Sharing Integration

- [~] 7.1 Define the integration boundaries
  - Objective: Write the TypeScript contracts and a short boundary note for the features this spec depends on or serves (design 12).
  - Files: `src/features/timetable/data/integrations.ts`, `.kiro/specs/personal-weekly-timetable/integration-boundaries.md`
  - Done when: these contracts exist with their owners named: `FriendDirectory` (search, friend check), `TagDirectory`, the team reference (id and name), the change-record outbox, the invitation operations (`listPendingInvitations`, `respondToInvitation`) and the busy-time interface. Each states its inputs, outputs, failure behavior and that friendship never grants read access.
  - Tests: type tests compile. Doc reviewed by you.
  - Depends on: 1.7
  - Status: `Ready`
  - _Requirements: R18.4, R18.5, R18.6, R18.7, R18.8, R18.9, R18.10_

- [~] 7.2 Implement participant and invitation rules in the domain and mock
  - Objective: The status state machine, limit counting, re-invite and leave (design 4.5).
  - Files: `src/domain/participants/status.ts`, `mock-repository.ts`, `repository-contract.ts`
  - Done when: saving with participants creates `pending` rows for the whole event or series. Pending and declined events never appear in the invitee's range results. Accept adds the event to their calendar, decline and leave remove it, and repeated responses are no-ops. A declined or left user can be invited again. Creator edits keep acceptances, and new participants start pending. Only pending and accepted rows count toward 6 (provisional OQ-38b). A response to a deleted event or removed invitation is rejected.
  - Tests: each transition, the limit at 6, the contract suite for invitations against the mock.
  - Depends on: 7.1, 4.1
  - Status: `Decision` (OQ-38)
  - _Requirements: R9.8, R9.9, R9.10, R10.6, R9.11, R9.12, R9.13, R9.14, R9.15, R9.16, R9.17, R9.18, R9.19, R9.21, R9.22, R9.24_

- [~] 7.3 Implement participant writes and invitation functions in the database
  - Objective: Participant handling in `save_event` and `apply_event_update`, plus `respond_to_invitation`, `list_my_invitations` and `get_event_participants` (design 6.6, 9.3).
  - Files: `supabase/migrations/<ts>_invitations.sql`, `supabase/tests/invitations.test.ts`
  - Done when: participant checks run inside the locked transaction. The friend check calls `is_friend`, a stub that reads a test-only table until 7.8. The participant list is shaped per caller. Responses lock the participant row.
  - Tests: concurrent additions past the limit (second rejected), accept racing with delete (consistent final state), per-caller shapes of `get_event_participants`, no email or phone in any result.
  - Depends on: 7.2, 5.7
  - Status: `Blocked` (via 5.3)
  - _Requirements: R9.7, R9.9, R9.19, R9.20, R9.21, R9.23, R17.4, R17.7, R17.8_

- [~] 7.4 Complete the RLS authorization matrix
  - Objective: Test every row of design 9.3 against the database.
  - Files: `supabase/tests/rls-matrix.test.ts`
  - Done when: creator, accepted participant, pending invitee, declined, left, friend without invitation, unrelated user and anonymous are each tested against every table and function. A friend can be invited but cannot read anything without accepting.
  - Tests: the matrix itself.
  - Depends on: 7.3, 6.6
  - Status: `Blocked` (via 5.3)
  - _Requirements: R16.1, R17.1, R17.2, R17.3, R17.4, R17.5, R17.6, R17.7, R9.10_

- [~] 7.5 Enable participants in the editor
  - Objective: Turn on the `participants` flag, save participants, and show the status chips and the invitation-pending state to the creator.
  - Files: `flags.ts`, `ParticipantSelector.tsx`, `ParticipantChip.tsx`, `EventEditorModal.tsx`
  - Done when: the creator sees each participant as pending, accepted, declined or left. Adding a participant to an existing series uses Series scope. The pending indicator disappears when nothing is pending.
  - Tests: component tests for each status. Playwright: create with a participant, the invitee's calendar does not show it, the invitee accepts through the repository contract, and the event appears.
  - Depends on: 7.2, 3.9, 6.9
  - Status: `Decision` (OQ-38a for the "left" display)
  - _Requirements: R9.15, R9.16, R9.28, R11.12, R15.23, R15.24, R15.25, R15.26_

- [~] 7.6 Build the read-only view for participants
  - Objective: Non-creators see a read-only event with their own tag selector and a Leave action.
  - Files: `EventEditorModal.tsx`
  - Done when: title, schedule (in the viewer's timezone, with the event timezone name), creator, team name if any, and accepted participants by name are shown. Nothing is editable except the viewer's tag. Leave asks for confirmation and removes the event from the viewer's calendar.
  - Tests: no editable inputs except the tag, a tag change affects only the viewer, Leave, and a direct edit attempt through the repository is rejected.
  - Depends on: 7.5
  - Status: `Ready`
  - _Requirements: R10.7, R10.8, R10.9, R10.10, R9.18, R17.4_

- [~] 7.7 Emit change records
  - Objective: Write a change record for every invitation and event change (design 4.3, `event_change_records`).
  - Files: write functions, `respond_to_invitation`, `mock-repository.ts`
  - Done when: records are written for created, updated, deleted, invited, accepted, declined, left, removed and scope applied, with targets and ids but no titles.
  - Tests: one per kind, payloads contain no title text.
  - Depends on: 7.3
  - Status: `Blocked` (via 5.3)
  - _Requirements: R18.6, R9.16_

- [~] 7.8 Connect the Friend Management feature
  - Objective: Replace the friend stub and mock directory with the Friend Management implementation.
  - Files: `supabase-repository.ts`, `is_friend` migration
  - Done when: search and the friend check come from that feature, and its behavior matches R9.1 and R9.2.
  - Tests: the FriendDirectory contract tests against the real implementation.
  - Depends on: 7.3, G-5
  - Status: `Blocked` (Friend Management spec)
  - _Requirements: R9.1, R9.2, R18.7_

- [~] 7.9 Display team references
  - Objective: Show a team name on blocks when an event has a team, using mock team data until the Team spec exists.
  - Files: `EventBlock.tsx`, `src/features/timetable/data/mock/mock-teams.ts`
  - Done when: the team name shows below the time range, a renamed team shows its current name, and a deleted team or a team the viewer left shows no name while participation remains. Events with participants and no team show no team name.
  - Tests: component tests for each case. Real data wiring is a follow-up under G-6.
  - Depends on: 2.12, 7.1
  - Status: `Ready` (real data `Blocked` by Team spec)
  - _Requirements: R5.1, R5.3, R9.25, R18.5, R18.8_

- [~] 7.10 Disable undo for shared events
  - Objective: Events with participants delete immediately, and the confirmation says it cannot be undone (provisional OQ-41).
  - Files: `pending-delete.ts`, `ConfirmDialog.tsx`
  - Done when: no Undo appears for shared events and the confirmation text differs.
  - Tests: component test for both event kinds.
  - Depends on: 4.11, 7.5
  - Status: `Decision` (OQ-41)
  - _Requirements: R12.10_

- [~] 7.11 Provide busy intervals
  - Objective: A function that returns a user's busy intervals for a range, for the Shared Availability spec.
  - Files: `src/domain/availability/busy.ts`, `supabase/migrations/<ts>_busy_intervals.sql`
  - Done when: it includes the user's own and accepted events, excludes pending, declined and cancelled occurrences, and returns only UTC start and end pairs.
  - Tests: unit tests on the mock, and a database test that the result has no title, tag or team columns.
  - Depends on: 6.3, 7.2
  - Status: `Ready` (domain part). Database part `Blocked` (via 5.3)
  - _Requirements: R18.4_

**M7 exit check:** invitations behave per R9 on the mock and (when unblocked) in Supabase. The RLS matrix passes. Pending invitations never put events on an invitee's calendar.

---

## Milestone 8 — Testing and Quality

Tests are written in every earlier task. M8 closes gaps and checks the whole feature.

- [~] 8.1 Add a requirement traceability check
  - Objective: A script that reads requirement ids from test titles and reports criteria with no test.
  - Files: `scripts/trace-requirements.ts`, `package.json` (`test:trace`)
  - Done when: the script lists every `R<n>.<m>` in `requirements.md` and the tests that mention it, and the report shows zero uncovered criteria or a list of exceptions you approved.
  - Tests: the script runs in CI.
  - Depends on: M4 exit (rerun after each milestone)
  - Status: `Ready`
  - _Requirements: all (`tech.md`: every criterion maps to a test)_

- [~] 8.2 Complete domain unit coverage
  - Objective: Close coverage gaps in `src/domain`.
  - Files: `src/domain/**/*.test.ts`, `vitest.config.ts`
  - Done when: line and branch coverage of `src/domain` are at least 90%, enforced in CI, and all tests pass under the three `TZ` values.
  - Tests: added cases.
  - Depends on: 7.11
  - Status: `Ready`
  - _Requirements: R14.20_

- [~] 8.3 Complete component tests
  - Objective: Cover every component state listed in design 8.4 and every density tier.
  - Files: `src/features/**/*.test.tsx`
  - Done when: each component in design 7.2 has tests for every documented state and prop variant.
  - Tests: added cases.
  - Depends on: 7.10
  - Status: `Ready`
  - _Requirements: R15.1, R15.2, R15.3, R15.7, R15.9, R15.12, R15.23, R5.7, R5.9_

- [~] 8.4 Run integration tests in CI
  - Objective: The contract suite against both repositories and all database tests in CI.
  - Files: CI workflow, `supabase/tests/*`
  - Done when: CI starts local Supabase, runs the contract suite twice (mock and Supabase), and runs RLS, constraint, concurrency and function tests.
  - Tests: the suites.
  - Depends on: 7.4
  - Status: `Blocked` (via 5.3)
  - _Requirements: R18.2, R17.1, R17.3, R11.15, R9.23_

- [~] 8.5 Complete the Playwright end-to-end suite
  - Objective: All flows in design 10.6 on desktop and both mobile projects.
  - Files: `tests/e2e/*.spec.ts`
  - Done when: every row of the design 10.6 table has a passing spec, including orientation change, keyboard-only flows and the unauthorized not-found case.
  - Tests: the specs.
  - Depends on: 7.6
  - Status: `Ready` (auth-dependent specs `Blocked` via 5.11)
  - _Requirements: R16.4, R6.11, R4.7, R14.5, R13.11, R15.24_

- [~] 8.6 Verify accessibility
  - Objective: Automated checks and a manual checklist.
  - Files: `tests/e2e/a11y.spec.ts`, `.kiro/specs/personal-weekly-timetable/a11y-checklist.md`
  - Done when: axe reports no violations on the calendar, editor, settings, dialogs and every UI state on desktop and mobile. A keyboard-only run completes create, edit, delete, navigation and settings. The manual checklist (VoiceOver on macOS and iOS) is filled in. Automated checks do not prove full WCAG compliance, and manual testing is still required.
  - Tests: the axe spec and the keyboard spec.
  - Depends on: 8.5
  - Status: `Ready`
  - _Requirements: R21.1, R21.2, R21.3, R21.4, R21.5, R21.6, R21.7, R21.8, R21.9_

- [~] 8.7 Verify responsive layouts
  - Objective: Check desktop and mobile layouts against Figma.
  - Files: `tests/e2e/responsive.spec.ts`
  - Done when: screenshots at the audited breakpoints and at 320, 390, 768, 1024 and 1440 CSS pixels wide are reviewed against the Figma frames, differences are logged, and touch targets are at least 44 by 44 on mobile.
  - Tests: screenshot spec (review, not pixel-diff gating).
  - Depends on: 8.5
  - Status: `Ready`
  - _Requirements: R16.1, R16.2, R16.5, R16.6, R16.7, R16.8_

- [~] 8.8 Validate performance targets
  - Objective: Measure R19 on a fixed reference machine.
  - Files: `tests/perf/*.spec.ts`, `.kiro/specs/personal-weekly-timetable/perf-report.md`
  - Done when: first render under 1 second after data, cached navigation under 300 ms, drag feedback near 60 fps, 500 occurrences and a 5-minute 24-hour grid usable, and zero re-renders of untouched blocks during drag. Misses are filed with traces.
  - Tests: perf specs and a React Profiler render-count test.
  - Depends on: 6.11
  - Status: `Ready`
  - _Requirements: R19.1, R19.2, R19.3, R19.4, R19.5, R19.6_

- [~] 8.9 Sweep the edge cases
  - Objective: Map every edge case E1 to E78 in requirements section 6 to at least one test.
  - Files: `.kiro/specs/personal-weekly-timetable/edge-case-map.md`
  - Done when: each edge case names its test file and test title, and any without one gets a new test.
  - Tests: added cases.
  - Depends on: 8.1
  - Status: `Ready`
  - _Requirements: all criteria referenced in requirements section 6_

- [~] 8.10 Final check against Figma and requirements
  - Objective: Walk through every screen and state against Figma and every requirement group against the running app.
  - Files: `.kiro/specs/personal-weekly-timetable/acceptance-review.md`
  - Done when: each requirement group R1 to R21 is marked pass, fail or deferred with a reason, each Figma frame is marked as matching or not, and you sign off.
  - Tests: none (review).
  - Depends on: 8.6, 8.7, 8.8, 8.9
  - Status: `Ready`
  - _Requirements: all_

**M8 exit check:** CI is green for build, lint, unit (`TZ` matrix), component, contract, database and end-to-end suites. Traceability shows no uncovered criteria. The acceptance review is signed off.

---

## What can start now

| Can start now | Waiting on a decision | Blocked by another spec |
|---|---|---|
| 1.1 to 1.11 (after 1.0), all of M2 except 2.1's provisional branch, all of M3 except 3.6 and 3.7, all of M4, 5.1, 5.2, 6.2, 6.3, 6.5, 6.9, 6.11, 7.1, 7.6, 7.9 (mock), 7.11 (domain), M8 tasks as their dependencies finish | 1.0 (steering wording), 2.1 and 6.1 (OQ-36), 3.6 (OQ-40a), 3.7 and 6.10 (OQ-39), 6.4 (OQ-37), 7.2 and 7.5 (OQ-38), 7.10 (OQ-41) | Authentication: 5.3 to 5.13 and everything that reads or writes Supabase (6.6 to 6.8, 7.3, 7.4, 7.7, 8.4). Friend Management: 7.8. Team Management: real data in 7.9 |

## Dependencies introduced by this plan
Runtime: `luxon`, `@tanstack/react-query`, `react-hook-form`, `zod`, `zustand` (already in steering). Development: `@axe-core/playwright`. Everything else is from steering (Vite, React, TypeScript, Tailwind, shadcn/ui, Supabase, Vitest, React Testing Library, Playwright). No property-testing, date-picker or drag-and-drop library is added. Seeded random tests, pickers and pointer handling are built in house.
