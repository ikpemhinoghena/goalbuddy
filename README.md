# GoalBuddy

GoalBuddy is a planned AI-assisted goal planner and progress tracker for students, professionals, and goal-oriented individuals. It is being developed for the BYU-Idaho WDD 430 Week 02 Team Project.

The project aims to help users describe their ambitions, set target dates, organize goals into actionable milestones and tasks, and track progress. Optional AI-generated roadmap suggestions will be available for users to review and customize.

## Problem and audience

People often set meaningful goals but struggle to identify actionable steps, organize their work, and maintain consistent progress. GoalBuddy is intended for students managing academic goals, professionals pursuing career objectives, and individuals working toward personal ambitions.

## Current status

The repository currently contains the generated Next.js App Router scaffold with TypeScript, Tailwind CSS, ESLint, and Prettier configured. The home page still displays the starter content. The goal management, authentication, dashboard, and AI planning features described below are planned and are not yet implemented.

The local documentation now includes a ratified GoalBuddy constitution, a formal specification with seven user stories, a 15-task implementation backlog, and 15 ready-to-publish issue bodies. These documents use the copied GitHub Spec-Kit v0.0.90 templates; no claim is made that a Copilot slash command generated the specification. This documentation work did not publish GitHub issues or create a Project Board.

The project initiator reports an existing setup pull request awaiting review and a ruleset protecting `main`; those remote states have not been independently verified in this documentation run. No peer approval or feature completion is claimed.

## Planned MVP and priorities

The MVP will prioritize the core goal-tracking workflow before optional AI assistance.

| Priority         | Planned capability             | Scope                                                                                   |
| ---------------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| P1: Core MVP     | User accounts                  | Secure registration, authentication, logout, profile management, and private user data. |
| P1: Core MVP     | Goal management                | Create, read, update, and delete goals with optional target dates.                      |
| P1: Core MVP     | Milestones and tasks           | Full CRUD, optional deadlines, task completion and reopening.                           |
| P1: Core MVP     | Basic progress                 | Task-based progress calculations and a basic dashboard summary.                         |
| P2: Enhancements | Organization and visualization | Goal tags/filtering, enhanced dashboard, and accessible progress visuals.               |
| P3: Optional     | AI-assisted planning           | Request, review, edit, accept, or reject generated roadmap drafts.                      |

AI suggestions are intended to support user decisions. Users will retain control over their plans and will be able to use the core workflow without AI assistance.

## Technology stack

- Next.js App Router for the application framework and routing.
- TypeScript in strict mode for typed application code.
- Tailwind CSS for styling.
- ESLint for code quality checks.
- Prettier for consistent formatting.
- Node.js and npm for the development runtime and package tooling.

The installed project declares Next.js 16.4.6 and Tailwind CSS 4.3.3. Authentication, persistence, hosting, and AI providers have not been selected by this documentation; future choices require a documented rationale and review.

## Local setup

Install Node.js and npm, then open a terminal in the project root and install the dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000) in your browser. If that port is unavailable, use the local address printed by the development server. The starter page is in `app/page.tsx`.

### Available commands

These scripts are defined in `package.json`:

| Command                | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server.                     |
| `npm run build`        | Create a production build.                                |
| `npm run start`        | Serve the production build after running `npm run build`. |
| `npm run lint`         | Run ESLint.                                               |
| `npm run format:check` | Check project formatting without changing files.          |
| `npm run format`       | Apply Prettier formatting across the project.             |

Run TypeScript validation directly with the installed compiler:

```bash
npx tsc --noEmit
```

On Windows, if PowerShell blocks the npm or npx script launcher, use `npm.cmd` or `npx.cmd` with the same arguments.

## Development workflow

1. Work on a focused feature branch created from `main`.
2. Keep changes limited to the branch's purpose and update documentation when needed.
3. Run the checks below before requesting review.
4. Push the feature branch and open a pull request targeting `main`. Describe the changes and report the check results.
5. Address review feedback and obtain at least one approving review before merging into `main`.

Create a GitHub issue with acceptance criteria before beginning each implementation feature. This documentation remains on the existing `feature/project-documentation` branch, which the initiator reports was created from `feature/project-setup`. Disclose that deviation from the normal branch-from-`main` rule and its rationale of preserving setup work in the future pull request, and obtain explicit approval for the exception. No branch was created or switched, and no pull request was opened by this documentation work.

```bash
npm run format:check
npm run lint
npx tsc --noEmit
```

Review formatting changes before submitting a pull request, especially when using `npm run format`, which writes to files across the project.

## Project documentation

- [Ratified constitution v1.0.0](.specify/memory/constitution.md), originally ratified on 2026-11-13.
- [Formal specification](specs/001-goalbuddy/spec.md), including acceptance scenarios and proposed API contracts.
- [Prioritized implementation backlog](specs/001-goalbuddy/tasks.md).
- [GitHub-ready issue content and board setup steps](docs/github-issues.md).
- [W02 individual submission preparation](docs/w02-submission.md).

The backlog is planning work, not implementation evidence. Its first task requires a reviewed technical plan and Constitution Check before application features are built.

## Team

- Ikpemhinoghena Etiuzale: confirmed project initiator.

No other team members, assignments, meetings, votes, or approving reviews are asserted without verified evidence.
