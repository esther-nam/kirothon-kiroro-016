# Personal Weekly Timetable

A weekly scheduling web app. Each user keeps a personal Monday-to-Sunday timetable. The long-term goal is to share busy/free availability with small teams (2 to 6 members) to find common free time.

Current state: the personal timetable UI runs against a **mock repository** (no backend yet). See [BUILD_REPORT.md](BUILD_REPORT.md) for progress and verification results.

## Stack

React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, react-hook-form, Zod, Luxon. Tests use Vitest, React Testing Library and Playwright. Supabase is planned for a later milestone.

## Getting started

Requires Node.js 20 or later.

```bash
npm ci
cp .env.example .env.local   # Supabase values are not needed yet
npm run dev
```

The app is served under the `/coord/` base path (see `vite.config.ts`), so open `http://localhost:5173/coord/`.

## Scripts

| Command            | What it does                                                    |
| ------------------ | --------------------------------------------------------------- |
| `npm run dev`      | Start the Vite dev server                                       |
| `npm run build`    | Type-check (`tsc -b`) and build to `dist/`                      |
| `npm run preview`  | Serve the production build locally                              |
| `npm run lint`     | Run ESLint                                                      |
| `npm run format`   | Run Prettier                                                    |
| `npm test`         | Run unit and component tests once                               |
| `npm run test:tz`  | Run the tests under UTC, Asia/Seoul and America/Los_Angeles     |
| `npm run test:e2e` | Run Playwright tests                                            |

## Project layout

```
.kiro/steering/            Project conventions
.kiro/specs/<feature>/     requirements.md, design.md, tasks.md per feature
src/features/<feature>/    Components, hooks, store and tests per feature
src/components/ui/         shadcn/ui primitives
tests/e2e/                 Playwright tests
```

Unit tests sit next to the code as `*.test.ts(x)`.

## Specs

- [personal-weekly-timetable](.kiro/specs/personal-weekly-timetable/): requirements, design and tasks
- [authentication](.kiro/specs/authentication/): requirements and design

## Deployment

Pushes to `main` build the site and publish `dist/` to GitHub Pages (`.github/workflows/deploy.yml`).

## Dependencies added for the timetable (task 1.3)

All versions are pinned exactly in `package.json`.

| Package                 | Type | Why                                                                                 |
| ----------------------- | ---- | ----------------------------------------------------------------------------------- |
| `luxon`                 | prod | IANA time zone conversion and DST-aware date math in the domain layer (design D-2). |
| `@types/luxon`          | dev  | TypeScript types for `luxon`.                                                       |
| `@tanstack/react-query` | prod | Server state with cancellation, caching and optimistic updates (design D-3).        |
| `react-hook-form`       | prod | Form state for the event and settings forms.                                        |
| `zod`                   | prod | Shared validation schemas, used with `react-hook-form`.                             |
| `zustand`               | prod | Client-side UI state, kept separate from persisted server data.                     |
| `@axe-core/playwright`  | dev  | Accessibility checks in Playwright e2e tests only.                                  |
