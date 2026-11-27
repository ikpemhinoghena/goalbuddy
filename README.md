# GoalBuddy

GoalBuddy is an AI-assisted goal planner and progress tracker for students, professionals, and individuals. It helps turn ambitions into manageable milestones and tasks, with manual planning as the core and optional AI assistance later. This repository continues the BYU-Idaho WDD 430 project through Week 03.

## Current status

The local Week 03 foundation includes a responsive homepage, shared navigation/layout, empty-workspace design previews at `/dashboard` and `/goals`, loading/error/404 states, and shared domain types. Previews are clearly labeled and do not load or save personal data. Accounts, database access, goal/milestone/task CRUD, real progress, and AI are not implemented. No database credentials are needed to run this foundation.

Week 02 specifications, constitution, templates, and submission history are preserved. Week 03 changes are uncommitted on `feature/w03-team-foundation`; they are not yet available from the public repository. No peer review, merge, deployment, or team approval is claimed.

## MVP scope

| Priority | Capability                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Authentication/profile, private user-owned goals, goal/milestone/task CRUD, completion/reopening, basic task-derived progress and dashboard |
| P2       | Tags/filtering, organization and enhanced dashboard visuals                                                                                 |
| P3       | Optional AI roadmap drafts that users review, edit, accept or reject                                                                        |

AI must never block manual planning. Public sharing, notifications, payments and team-owned goal records are outside the MVP.

## Stack

Installed: Next.js 16.4.6 App Router, React 19.3.0, strict TypeScript 5.9.3, Tailwind CSS 4.3.3, ESLint 9.39.5 and Prettier 3.10.1. Local verification used Node.js 24.21.0 and npm 11.19.0 on Windows. Keep the committed lockfile; no new dependencies were added for Week 03.

PostgreSQL is the recommended persistence design; Supabase is a candidate host. Auth.js and Clerk remain alternatives, and Vercel remains a hosting candidate. None is configured or installed. Read the installed Next.js guides under `node_modules/next/dist/docs/` before coding, as required by `AGENTS.md`.

## Installation and local development

From the existing project directory:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open [localhost:3000](http://localhost:3000), or the actual address printed by Next.js. On shells without PowerShell's script-launch restriction, `npm` and `npx` work normally. The application uses local system fonts, so production builds do not require a Google Fonts download. Do not commit `.env` files or put secrets in client code.

| Command                | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start development server                       |
| `npm run build`        | Build production application                   |
| `npm run start`        | Serve an existing production build             |
| `npm run lint`         | ESLint                                         |
| `npm run format:check` | Check formatting                               |
| `npm run format`       | Format repository; review scope before running |
| `npx tsc --noEmit`     | Strict TypeScript check                        |

No automated test script or test framework is configured. Week 03 runtime/browser evidence is recorded in [verification](docs/w03-verification.md); it does not prove future backend features.

## Structure and documentation

- `app/`: routes, metadata, shared layouts and error/loading/not-found boundaries.
- `components/`: shared layout, feedback and preview summary components.
- `lib/models.ts`: four P1 domain models and a derived progress contract.
- [Constitution](.specify/memory/constitution.md), [specification](specs/001-goalbuddy/spec.md), and [15-task backlog](specs/001-goalbuddy/tasks.md).
- [Implementation architecture and Constitution Check](specs/001-goalbuddy/plan.md).
- [Data model and ER diagram](specs/001-goalbuddy/data-model.md).
- [Design system](docs/design-system.md).
- [GitHub issue source and dated status](docs/github-issues.md).
- [Week 04 plan and remaining board changes](docs/w04-plan.md).
- [Week 03 Canvas submission draft](docs/w03-submission.md).
- [Historical Week 02 submission preparation](docs/w02-submission.md).
- [Copilot project instructions](.github/copilot-instructions.md).

## Repository workflow

Use an existing issue with acceptance criteria, a focused feature branch, and a PR targeting main. Run formatting, lint, type checks, production build and applicable tests before review. Commit messages are chosen by the user. Obtain a real approving review before merging. The active main ruleset requires one approval and blocks deletion and non-fast-forward updates.

Week 03 branches from `feature/project-documentation` to preserve unmerged Week 02 specifications and setup. This is a disclosed exception to the normal branch-from-main convention, requiring reviewer acknowledgment before integration. Existing PRs [#1](https://github.com/ikpemhinoghena/goalbuddy/pull/1) and [#2](https://github.com/ikpemhinoghena/goalbuddy/pull/2) are open and authored by the initiator; neither had reviews on 2026-11-20. Review their ancestry before publishing Week 03. No GitHub Actions workflow currently exists.

## Project tracking

- [Public repository](https://github.com/ikpemhinoghena/goalbuddy)
- [GoalBuddy Development Board](https://github.com/users/ikpemhinoghena/projects/1/views/1)
- [Week 04 - Secure goal workflow](https://github.com/ikpemhinoghena/goalbuddy/milestone/1)

Verified on 2026-11-20: 15 open implementation issues (#3-#17), all represented on the board. All now have priority labels, linked dependencies, and acceptance checklists. The seven issues #3-#9 are assigned to `ikpemhinoghena` in the Week 04 milestone. Board-specific status/priority edits remain outstanding because the existing credential lacks Projects scope; no completed feature is implied by repository metadata updates.

## Team

- Ikpemhinoghena Etiuzale: verified project initiator and independent implementer.
- Jackson Cole Taylor ([Jctman5](https://github.com/Jctman5)): team member; contributed the README team listing in [PR #19](https://github.com/ikpemhinoghena/goalbuddy/pull/19).

Earlier project implementation proceeded independently under reported instructor permission. No additional member identities, meeting attendance, contributions, votes, or teammate approvals are asserted without verified evidence.
