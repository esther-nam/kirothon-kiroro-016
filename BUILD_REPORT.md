# Build Report

Feature: personal-weekly-timetable (tasks in `.kiro/specs/personal-weekly-timetable/tasks.md`).

## Verification

Run on the current working tree.

| Check           | Result                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------- |
| `npm run build` | Pass. 2280 modules; JS 466 kB (147 kB gzip), CSS 40 kB (8 kB gzip)                           |
| `npm run lint`  | Pass, 0 errors, 1 warning (`react-refresh/only-export-components` in `src/components/ui/button.tsx`) |
| `npm test`      | Pass. 26 files, 219 tests                                                                    |
| `npm run test:tz` | Not run for this report                                                                    |
| `npm run test:e2e` | Not run for this report                                                                   |

Note: Vitest prints a warning that `vitest.config.ts` imports `./vite.config` without a file extension. It does not fail the run.

## Task progress

| Group | Scope                                              | Status                                              |
| ----- | -------------------------------------------------- | --------------------------------------------------- |
| 1.x   | Scaffold, tokens, dates, data contract, mock repository, directories, formatting, app shell | Done (1.0 to 1.11) |
| 2.x   | Time zones, week range, preferences, store, header, grid, layout, density, event blocks, overflow, rendering | Done through 2.14 |
| 2.15  | TimezoneSelect                                     | In progress                                         |
| 2.16 to 2.18 | TimetableSettings, responsive layout, rendering baseline | Queued                                    |
| 3.x   | Event editor, validation, tags, recurrence, participants UI | Queued                                     |
| 4.x   | Mock writes, create/edit/delete, drag and keyboard selection | Queued                                   |
| 5.x   | Supabase: migrations, RLS, write/read functions, Edge Function | Queued                                  |

## What works now

- Weekly grid with day headers, time gutter and day columns.
- Week navigation and week header text.
- Event blocks with overlap layout, density tiers, overflow and outside-hours indicators.
- Time zone conversion with DST handling, and per-user preferences.
- Locale-aware time formatting.
- Mock repository with seeded events, friends and tags.

## Not built yet

- Creating, editing and deleting events.
- Drag, touch and keyboard selection on the grid.
- Supabase backend, auth, RLS and teams. `.env.example` has empty Supabase placeholders.
- Team availability view and group events.

## Deployment

GitHub Pages workflow in `.github/workflows/deploy.yml` builds with Node 20 on pushes to `main`. The app uses base path `/coord/`.

## Uncommitted changes

The working tree has uncommitted edits to `tasks.md`, `tasks.meta.json`, `App.tsx`, `WeeklyCalendar.tsx`, `usePreferences.ts`, `useWeekOccurrences.ts`, `messages/en.ts` and related tests. Commits are made only on request.
