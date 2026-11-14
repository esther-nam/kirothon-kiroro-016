# Project Structure and Conventions

## Directory layout (target)
```
.kiro/
  steering/          Global project conventions (this folder)
  specs/<feature>/   requirements.md, design.md, tasks.md per feature
src/
  features/<feature>/  Components, hooks, store, and tests per feature
  domain/              Pure logic: intervals, availability, time conversion
    time/              civil dates, zone conversion, DST resolver, week range, day split
    recurrence/        slot expansion, exceptions, scope operations
    layout/            overlap clustering, overflow, density, hit-testing
    validation/        event input rules, issue codes
    format/            time, header and date formatting (locale aware)
  lib/                 Supabase client, shared utilities, Zod schemas
  components/ui/       shadcn/ui primitives
supabase/
  migrations/          SQL migrations (schema, RLS policies, functions)
  functions/           Edge Functions; each `functions/<name>/` has its own `deno.json` import map
tests/
  e2e/                 Playwright tests
```
Unit tests sit next to the code as `*.test.ts`.

## Naming
- Files: `kebab-case.ts`; React components: `PascalCase.tsx`
- Types and components: `PascalCase`; functions and variables: `camelCase`
- DB tables/columns: `snake_case`; TypeScript types generated from the Supabase schema
- Time fields: `startsAt` / `endsAt` for instants; `startMinute` / `endMinute` for minutes from midnight

## Code conventions
- No `any`. Prefer explicit types at module boundaries.
- Keep functions small and pure where possible.
- Errors: typed error results at the domain layer, mapped to HTTP status codes in Edge Functions (400 validation, 401/403 auth, 404, 409 conflict).
- No secrets in the repo; use environment variables and a documented `.env.example`.

## Accessibility and UI
- The grid must be keyboard operable (arrow keys to move, Shift+arrows to extend selection, Enter to confirm).
- Gray busy blocks must not rely on color alone (add pattern or label); member colors must meet WCAG AA contrast against the grid.
- Drag interactions must support touch and have a non-drag alternative.
- Note: full WCAG compliance requires manual testing with assistive technologies and expert review.

## Git workflow
- Feature branches named `feat/<spec-name>`; never commit directly to `main`.
- Small commits, imperative messages (e.g. `Add interval merge function`).
- Commits are made only when the user asks.
