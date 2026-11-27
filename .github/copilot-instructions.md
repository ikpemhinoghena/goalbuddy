# GoalBuddy coding instructions

GoalBuddy helps students, professionals, and individuals turn goals into milestones and tasks, then track task-based progress. Preserve the Week 02 specification and constitution in `.specify/memory/constitution.md` and `specs/001-goalbuddy/`.

## Current state

Implemented:

- GitHub sign-in through Auth.js v5, with server-side sessions.
- Profile editing (display name and time zone).
- Owner-scoped goal CRUD with revision checks and confirmed cascade deletion.
- A PostgreSQL schema for users, sessions, goals, milestones and tasks.

Not implemented: milestone and task CRUD, progress tracking, the real dashboard (`/dashboard` is a labeled design preview), tags, and AI drafts. Never present a preview or unfinished feature as working.

## Stack

- Next.js 16.4.6 App Router with `cacheComponents` and `partialPrefetching` enabled.
- React 19.3.0, strict TypeScript, Tailwind CSS 4.3.3.
- Auth.js `next-auth@5.0.0-beta.32` with the GitHub provider.
- PostgreSQL through `pg`.
- ESLint 9 and Prettier 3, with npm and the committed lockfile.

Before using a Next.js API, read the relevant guide in `node_modules/next/dist/docs/`. This version differs from older Next.js:

- `params` and `searchParams` are promises.
- Route handlers type their context with `RouteContext<'/path/[param]'>`, and pages use `PageProps<'/path'>`.
- Error boundaries receive `retry`.
- Reading cookies, headers or the session outside a `<Suspense>` boundary fails the build.

Do not add dependencies without a concrete need.

## Structure

- `app/layout.tsx` composes the skip link, header, main landmark and footer.
- `app/(account)/` holds pages that need a session: `login`, `profile`, `goals`, `goals/new`, `goals/[goalId]` and `goals/[goalId]/edit`.
- `app/(workspace)/` holds the labeled dashboard preview.
- `app/api/` contains thin route files. Each one calls `runApi` from `lib/server/api/run.ts` with a handler from `lib/server/api/`.
- `lib/server/` is server-only, and every module there starts with `import 'server-only'`:
  - `auth.ts`: Auth.js configuration.
  - `auth-actions.ts`: sign-in and sign-out Server Actions.
  - `current-user.ts`: `getSessionUserId`, `getCurrentUser` and `requireUser`.
  - `database.ts`: the `Database` and `Queryable` interfaces, and `getDatabase`.
  - `schema.ts`: the SQL schema.
  - `users.ts`, `sessions.ts` and `goals.ts`: repositories.
  - `http.ts`: response helpers.
- `lib/validation/` holds pure validation shared by client forms and the server.
- `lib/api-contract.ts` defines response types and client parsing helpers.
- `lib/models.ts` defines the domain types.
- `lib/format.ts` provides date formatting.

Reuse these components before creating new ones:

- **Layout:** `components/layout/` (`Header`, `Footer`, `AccountNav`).
- **UI:** `components/ui/` (`PageIntro`, `EmptyState`, `LoadingSkeleton`, `ErrorState`, `FormField`, `FormMessage`, plus `buttonStyles` and `fieldStyles` in `styles.ts`).
- **Goals:** `components/goals/` (`GoalCard`, `GoalForm`, `DeleteGoalDialog`).
- **Profile:** `components/profile/` (`ProfileForm`).

Put milestone and task code in the same layers: repositories in `lib/server/`, validators in `lib/validation/`, handlers in `lib/server/api/`, routes in `app/api/goals/[goalId]/...`, and UI in `components/goals/` or a new feature folder. Do not create empty placeholder modules.

## Rendering

Server Components are the default:

- Pages render a static `PageIntro` and put session-dependent content in an async child component inside `<Suspense fallback={<LoadingSkeleton />}>`.
- Server Components read data directly through `lib/server` repositories, never through HTTP calls to the same app.

Use Client Components (`'use client'`) only for interaction:

- Forms and dialogs call the route handlers with `fetch`.
- After a successful mutation, they call `router.push` and `router.refresh`.

Never import `lib/server/*`, credentials or database code into a Client Component.

## Naming and code style

- Files and folders: kebab-case.
- React components: PascalCase named exports. Pages and layouts are default exports.
- Functions and variables: camelCase.
- Types: PascalCase, using `type`/`interface` and type-only imports.
- Request handlers: `*Request`, for example `createGoalRequest`.
- Validators: `validate*`.
- SQL: snake_case tables and columns. Map rows to camelCase domain objects in the repository.
- Dates are `YYYY-MM-DD` strings; timestamps are ISO UTC strings.

Code rules:

- No application `any`.
- No code, configuration or HTML comments.
- No placeholder text.
- No unrelated refactoring.
- Follow `.prettierrc`: single quotes, semicolons, trailing commas, 100-character lines.

## Design and accessibility

- Use Tailwind utilities with the tokens in `app/globals.css`, following `docs/design-system.md`. The palette is green and neutral, the font is the system stack, and cards are rounded.
- Every field uses `FormField`, which provides a visible label, `aria-describedby` hints and errors, and `aria-invalid`.
- Form failures show a focused `FormMessage` alert and keep the values the user entered.
- Destructive actions use a native modal `<dialog>` that:
  - names the affected records;
  - focuses Cancel first;
  - returns focus to the trigger when it closes.
- Keep a single `h1` per page and visible keyboard focus. Layouts must work at 320, 768 and 1280px with no horizontal scrolling.

## Data model

The domain entities are User, Goal, Milestone and Task. The schema also has a `sessions` table that supports authentication. There is no progress table, and percentages are never edited directly.

Every entity has:

- a UUID `id`;
- a positive integer `revision`, starting at 1;
- server-controlled `createdAt` and `updatedAt`.

Entity rules:

- **Goal:** `ownerId` is immutable. `title` is 1–120 characters, `description` is up to 5,000, and `targetDate` is optional.
- **Milestone:** belongs to one goal.
- **Task:** belongs to one goal and optionally to a milestone of that same goal (enforced by a composite foreign key). `completed` must agree with `completedAt`.
- **Deletion:** deleting a goal cascades to its milestones and tasks. Deleting a milestone cascades to its tasks and keeps the goal's direct tasks.

Progress is derived from completed tasks:

- Zero when a goal has no tasks; otherwise `Math.round(100 * completed / total)`.
- Count each task once.
- Account-wide progress weights every task equally; never average per-goal percentages.

## Authentication and authorization

- Always resolve the user on the server: `requireUser()` in pages, and `context.userId` in API handlers.
- Never accept owner IDs from the client.
- Every query filters by `owner_id`, and child queries must also verify the parent goal belongs to that owner.
- Missing, foreign and malformed IDs all return the same 404.
- Unauthenticated API requests return 401.
- Mutations require the same origin (`isSameOrigin`) and a JSON content type.
- Sessions are revocable rows: 24 hours absolute and 2 hours idle, deleted on sign-out.
- Never log tokens, credentials, goal text or personal data.

## Database and API conventions

- Repositories take a `Queryable` or `Database` and use parameterized SQL only.
- Mutations that check a revision use `db.transaction` with `SELECT ... FOR UPDATE` on the owned goal. Compare the expected revision, check deadline consistency, write, and increment `revision`.
- Handlers return results through `jsonResponse` or the helpers in `lib/server/http.ts`. Responses carry `Cache-Control: no-store`, and errors use the shape `{ error: { code, message, fields? } }`.
- Read bodies with `readJsonBody`, which enforces the 64 KiB limit and returns 400, 413 or 415.
- Validate with an allowlist: unknown fields return 422.
- Use 409 for stale revisions.
- Schema changes go in `lib/server/schema.ts` and must stay idempotent.

## Testing

Before review, run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`

Tests live in `tests/*.test.ts` and use `node:test` with `tsx`. They run on an in-memory PGlite database from `tests/support/database.ts`, and call handlers directly with an `ApiContext`.

Each new endpoint needs tests for:

- validation;
- 401 without a session;
- a two-user ownership check (404, with no data changed);
- 403 for a cross-origin request;
- 409 for a stale revision;
- rollback where a write spans several statements.

Report browser and accessibility checks exactly as they were run, and never claim untested behavior.

## Workflow

Use the existing issues #3–#17 and their acceptance criteria rather than creating duplicates. Work on feature branches and open PRs into `main`.

- Commit messages are chosen by the user.
- Merge only after a real approving review.
- Do not commit, push, open PRs or merge without the user's authorization.
- Never attribute work to teammates, or invent meetings, reviews or approvals.

Prioritize the P1 features first: identity, ownership, goal/milestone/task CRUD and basic progress. P2 adds organization and an enhanced dashboard. P3 AI is optional and must never block manual planning.
