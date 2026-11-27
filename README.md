# GoalBuddy

GoalBuddy is an AI-assisted goal planner and progress tracker for students, professionals, and individuals. It helps turn ambitions into manageable milestones and tasks, with manual planning as the core and optional AI assistance later. This repository is the BYU-Idaho WDD 430 team project.

## Purpose, audience and value

People with academic, professional, or personal goals often lose track of the small steps that make them happen. GoalBuddy gives each person a private, calm space to name a goal, break it into milestones and tasks, and see progress based on the work they actually complete.

## Current status

Week 04 delivers the first secure vertical slice of the **Secure goal workflow** milestone:

- **Sign-in with GitHub (Auth.js v5).** The first sign-in creates a GoalBuddy profile. Sessions are stored server-side, expire after 24 hours (absolute) or 2 hours of inactivity, and are revoked on sign-out.
- **Profile management.** Signed-in users can update their display name and time zone at `/profile`.
- **Goal CRUD.** Signed-in users can create, list, view, edit, and delete their own goals at `/goals`. Edits use revision checks, and deletion requires confirmation in a dialog that states the impact on child records.
- **PostgreSQL schema.** The schema covers users, sessions, goals, milestones, and tasks. It enforces ownership, parent integrity, cascade rules, and completion consistency.
- **Route handlers.** Handlers under `app/api/` validate input server-side, return safe errors, check same-origin requests on every mutation, and send `Cache-Control: no-store` on private responses.

Milestone and task screens, progress tracking, the real dashboard, tags, and AI drafts are not implemented yet. `/dashboard` remains a clearly labeled empty design preview.

## MVP scope

| Priority | Capability                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Authentication/profile, private user-owned goals, goal/milestone/task CRUD, completion/reopening, basic task-derived progress and dashboard |
| P2       | Tags/filtering, organization and enhanced dashboard visuals                                                                                 |
| P3       | Optional AI roadmap drafts that users review, edit, accept or reject                                                                        |

AI must never block manual planning. Public sharing, notifications, payments and team-owned goal records are outside the MVP.

## Stack

| Area           | Choice                                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Framework      | Next.js 16.4.6 App Router with Cache Components and Partial Prefetching, React 19.3.0, strict TypeScript                      |
| Styling        | Tailwind CSS 4.3.3 with tokens in `app/globals.css` and the [design system](docs/design-system.md)                            |
| Authentication | Auth.js v5 (`next-auth@5.0.0-beta.32`) with the GitHub OAuth provider, JWT cookie plus server-side session table              |
| Database       | PostgreSQL through `pg`; any managed PostgreSQL host (for example Neon or Supabase) works through `DATABASE_URL`              |
| Testing        | Node's built-in test runner through `tsx`, against an in-memory PostgreSQL ([PGlite](https://pglite.dev)) with no credentials |
| Tooling        | ESLint 9, Prettier 3, npm lockfile                                                                                            |
| Deployment     | Vercel is the planned host; no deployment has been made yet                                                                   |

Read the installed Next.js guides under `node_modules/next/dist/docs/` before coding, as required by `AGENTS.md`.

## Installation and local development

```powershell
npm.cmd ci
npm.cmd run dev
```

On shells without PowerShell's script-launch restriction, `npm` and `npx` work normally. Without environment variables the public pages work and sign-in shows that it is not configured.

### Environment variables

Create `.env.local` (ignored by Git) with:

| Variable             | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string                                  |
| `DATABASE_POOL_MAX`  | Optional connection pool size, default 5                      |
| `AUTH_SECRET`        | Random secret for Auth.js, for example from `npx auth secret` |
| `AUTH_GITHUB_ID`     | GitHub OAuth App client ID                                    |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App client secret                                |
| `AUTH_TRUST_HOST`    | Set to `true` when self-hosting outside Vercel                |

Create a GitHub OAuth App with the callback URL `http://localhost:3000/api/auth/callback/github` for local development, and a separate app or callback for each deployed URL. Never commit secrets or expose them to client components.

Apply the schema once per database. It is idempotent:

```powershell
npm.cmd run db:migrate
```

### Commands

| Command                | Purpose                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| `npm run dev`          | Start development server                                                 |
| `npm run build`        | Build production application                                             |
| `npm run start`        | Serve an existing production build                                       |
| `npm run lint`         | ESLint                                                                   |
| `npx tsc --noEmit`     | Strict TypeScript check                                                  |
| `npm test`             | Validation, persistence, ownership and API tests on in-memory PostgreSQL |
| `npm run db:migrate`   | Apply the database schema using `DATABASE_URL`                           |
| `npm run format:check` | Check formatting                                                         |
| `npm run format`       | Format repository; review scope before running                           |

## Deployment

The planned host is Vercel. To deploy:

1. Provision a managed PostgreSQL database.
2. Run `npm run db:migrate` against it.
3. Set the environment variables above in the hosting project.
4. Register the deployed callback URL in the GitHub OAuth App.

No deployment exists yet.

## API

All endpoints are same-origin JSON endpoints that require a signed-in session.

- **Mutations** must send `Content-Type: application/json` with a body no larger than 64 KiB, from the GoalBuddy origin.
- **Responses** carry `Cache-Control: no-store`.
- **Errors** use the shape `{ "error": { "code", "message", "fields"? } }`.

| Method     | Path                  | Body                                                   | Success                                      |
| ---------- | --------------------- | ------------------------------------------------------ | -------------------------------------------- |
| `GET`      | `/api/goals`          | Query `limit` (1–50, default 20) and optional `cursor` | `200 { goals, nextCursor }`, newest first    |
| `POST`     | `/api/goals`          | `{ title, description?, targetDate? }`                 | `201 { goal }`                               |
| `GET`      | `/api/goals/{goalId}` | none                                                   | `200 { goal }`                               |
| `PUT`      | `/api/goals/{goalId}` | `{ title, description?, targetDate?, revision }`       | `200 { goal }` with revision incremented     |
| `DELETE`   | `/api/goals/{goalId}` | `{ revision }`                                         | `200 { deleted: { id, milestones, tasks } }` |
| `GET`      | `/api/profile`        | none                                                   | `200 { profile }`                            |
| `PUT`      | `/api/profile`        | `{ displayName, timezone, revision }`                  | `200 { profile }`                            |
| `GET/POST` | `/api/auth/*`         | Managed by Auth.js                                     | Sign-in, callback and sign-out               |

Field rules:

- `title` is trimmed and must be 1–120 characters.
- `description` may be up to 5,000 characters.
- `targetDate` is `YYYY-MM-DD` or `null`.
- `displayName` must be 1–80 characters.
- `timezone` must be a valid IANA time zone.
- `revision` is the current positive revision.

Unknown fields are rejected, including client-supplied `ownerId`.

| Status | Meaning                                                                                                         |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| 400    | Malformed JSON                                                                                                  |
| 401    | No valid session                                                                                                |
| 403    | Cross-origin mutation                                                                                           |
| 404    | Missing, foreign, or malformed ID. These responses are identical, so they do not reveal whether a record exists |
| 409    | Stale revision                                                                                                  |
| 413    | Body larger than 64 KiB                                                                                         |
| 415    | Not JSON                                                                                                        |
| 422    | Invalid fields, including a target date earlier than existing milestone or task deadlines                       |

## Structure and documentation

- `app/(account)/`: sign-in, profile, and goal pages that require a session.
- `app/(workspace)/`: the labeled dashboard design preview.
- `app/api/`: route handlers.
- `components/`: layout, UI, goal, and profile components.
- `lib/validation/`: pure validation shared by the client and the server.
- `lib/server/`: server-only authentication, sessions, data access, schema, and HTTP helpers.
- `lib/models.ts`: domain types.
- `tests/`: automated tests.
- [Constitution](.specify/memory/constitution.md), [specification](specs/001-goalbuddy/spec.md), and [task backlog](specs/001-goalbuddy/tasks.md)
- [Implementation architecture](specs/001-goalbuddy/plan.md) and [data model](specs/001-goalbuddy/data-model.md)
- [Design system](docs/design-system.md)
- [Week 04 plan and status](docs/w04-plan.md) and [Week 04 verification](docs/w04-verification.md)
- [Week 03 verification](docs/w03-verification.md) and submission history in `docs/`
- [Copilot project instructions](.github/copilot-instructions.md)

## Known issues and limitations

- Sign-in has not been exercised against a live GitHub OAuth App and a hosted database. It needs real credentials. Automated and browser checks used a local database and locally issued sessions.
- Milestones, tasks, progress, the real dashboard, tags, and AI drafts are not implemented. The schema already contains milestone and task tables, so goal deletion reports and cascades real child counts.
- API rate limiting and account deletion are not implemented. GitHub handles credential protection for sign-in.
- Not yet verified: screen-reader behavior, 200% browser zoom, and performance at the specification's 100-goal/1,000-task scale.
- On Windows with `core.autocrlf=true`, `npm run format:check` reports line-ending warnings for files in the working copy. The committed (LF) content passes Prettier.

## Repository workflow

Each change follows the same path:

1. Use an existing issue with acceptance criteria.
2. Work on a focused feature branch.
3. Open a PR targeting `main`.
4. Before review, run lint, type checks, tests and a production build.
5. Merge only after a real approving review. The `main` ruleset requires one approval and blocks deletion and non-fast-forward updates.

Week 03 and Week 04 branch from earlier unmerged feature branches to preserve Week 02 specifications and setup. This is an intentional, disclosed exception to branching from `main`. The open dependency chain is:

- [#1](https://github.com/ikpemhinoghena/goalbuddy/pull/1) setup into `main`
- [#2](https://github.com/ikpemhinoghena/goalbuddy/pull/2) documentation into setup
- [#18](https://github.com/ikpemhinoghena/goalbuddy/pull/18) Week 03 into documentation

## Project tracking

- [Public repository](https://github.com/ikpemhinoghena/goalbuddy)
- [GoalBuddy Development Board](https://github.com/users/ikpemhinoghena/projects/1/views/1)
- [Week 04 - Secure goal workflow](https://github.com/ikpemhinoghena/goalbuddy/milestone/1)

## Team

- Ikpemhinoghena Etiuzale ([ikpemhinoghena](https://github.com/ikpemhinoghena)): project initiator and implementer.
- Jackson Cole Taylor ([Jctman5](https://github.com/Jctman5)): team member; contributed the README team listing in [PR #19](https://github.com/ikpemhinoghena/goalbuddy/pull/19).
- Jose Leonett: team member.
