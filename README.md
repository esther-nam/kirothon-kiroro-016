# Personal Weekly Timetable

## Dependencies added for the timetable (task 1.3)

All versions are pinned exactly in `package.json`.

| Package                  | Type | Why                                                                                                       |
| ------------------------ | ---- | --------------------------------------------------------------------------------------------------------- |
| `luxon`                  | prod | IANA time zone conversion and DST-aware date math in the domain layer (design D-2).                       |
| `@types/luxon`           | dev  | TypeScript types for `luxon`.                                                                             |
| `@tanstack/react-query`  | prod | Server state with cancellation, caching and optimistic updates (design D-3).                              |
| `react-hook-form`        | prod | Form state for the event and settings forms.                                                              |
| `zod`                    | prod | Shared validation schemas, used with `react-hook-form`.                                                   |
| `zustand`                | prod | Client-side UI state, kept separate from persisted server data.                                           |
| `@axe-core/playwright`   | dev  | Accessibility checks in Playwright e2e tests only.                                                        |
