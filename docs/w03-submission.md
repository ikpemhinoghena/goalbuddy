# WDD 430 Week 03 Canvas submission draft

Prepared 2026-11-20 for GoalBuddy by independent project work for Ikpemhinoghena Etiuzale. This is a factual draft, not a submitted Canvas form. The live Canvas rubric was not available. Local changes must be published through the authorized Git workflow before the repository URL exposes Week 03 artifacts to the instructor.

## TEAM MEETING SUMMARY

No synchronous meeting was held or verified for this activity, so there are no meeting attendees or elected meeting leader to report. Ikpemhinoghena Etiuzale is the verified project initiator and independent implementer. The user reports prior instructor permission to proceed independently because the team has been inactive; that permission statement is user-reported, not a newly inspected instructor message.

Independent decisions: preserve the existing Next.js/React/TypeScript/Tailwind stack and Week 02 requirements; build a public shell and honestly labeled empty-workspace previews; model User, Goal, Milestone and Task; derive progress from tasks; keep AI optional; recommend PostgreSQL while leaving provider choice provisional; use a green/neutral system-font theme; focus Week 04 on secure goal CRUD before further MVP features.

Responsibilities actually assigned: repository issues #3–#9 are assigned to `ikpemhinoghena`. No work was assigned to inactive teammates. No vote, attendance, contribution, code review or team approval is claimed.

## PROJECT SETUP

- **PASS:** [Public GitHub repository](https://github.com/ikpemhinoghena/goalbuddy) verified through GitHub metadata.
- **PASS locally:** README lists the verified initiator, stack, scope, setup, commands, workflow and project links. Week 03 README and implementation changes remain uncommitted and unpublished.
- **PASS:** Existing lockfile installation, lint, TypeScript and production compilation were exercised. The scaffold font-download build problem was fixed using system fonts. See [verification evidence](w03-verification.md) for commands and practical limits.
- **PASS:** Real local server at `http://127.0.0.1:3000`; `/`, `/dashboard`, `/goals` returned 200 and a missing route returned 404. The QA server is stopped after verification and can be restarted with `npm.cmd run dev`.
- **PASS:** Nine genuine screenshots at 320/768/1280px are linked from the evidence document. [Homepage desktop](evidence/home-1280.png), [workspace mobile](evidence/dashboard-320.png).
- **PASS:** [Project Board](https://github.com/users/ikpemhinoghena/projects/1/views/1) contains 15 existing issue items, exceeding the minimum eight. Repository priorities, dependencies and acceptance criteria were improved without duplicate issues.
- **PASS:** [Week 04 - Secure goal workflow milestone](https://github.com/ikpemhinoghena/goalbuddy/milestone/1) created and verified with issues #3–#9, all assigned to the independent implementer.
- **NOT VERIFIED as complete:** Board-specific status/priority edits require Projects permission. All 15 items remain Todo; owner assignment synchronization is verified. [Exact remaining changes](w04-plan.md#project-board-reconciliation) are prepared.

## ARCHITECTURE AND DESIGN

The architecture uses Server Components for page composition, shared layouts and future authorized reads, with Client Components restricted to interaction. The error boundary uses the installed Next.js `retry` API. Future route handlers validate requests and call server-only services; every saved read/write must derive identity from the session and scope data to its owner. Layout redirects alone are not authorization. The [plan and component hierarchy](../specs/001-goalbuddy/plan.md) distinguish implemented paths from future features.

Implemented routes are `/`, `/dashboard` and `/goals`. The latter two are static empty-state design demonstrations, not signed-in pages. Planned routes `/login`, `/register`, `/goals/new`, `/goals/[goalId]`, `/goals/[goalId]/edit` and `/profile` follow existing stories and remain unavailable until the actual backend workflow exists.

The component hierarchy is RootLayout → Header/Navigation, Main and Footer; Main renders Home or WorkspaceLayout; WorkspaceLayout provides the preview disclosure and DashboardSummary/EmptyState or Goals/EmptyState. Route boundaries reuse LoadingSkeleton, ErrorState and NotFound. Future GoalList/GoalCard/GoalForm, MilestoneList, TaskItem and ProgressIndicator are designed but not installed as unused components.

The four core entities are:

| Entity    | Important fields                                                                       | Relationship                                               |
| --------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| User      | ID, identity reference, display name, timezone                                         | Owns many goals                                            |
| Goal      | ID, owner ID, title, description, optional target date                                 | Owns milestones and tasks                                  |
| Milestone | ID, goal ID, title, description, optional deadline                                     | Groups tasks belonging to that goal                        |
| Task      | ID, goal ID, optional milestone ID, title/description/deadline, completed, completedAt | Always belongs to a goal; optionally a same-goal milestone |

All four include revisions and created/updated timestamps. Progress is calculated from task completion; zero tasks means zero percent, and two completed of three means 67%. No separate ProgressEntry table is justified. The [ER diagram and field/constraint descriptions](../specs/001-goalbuddy/data-model.md) explain atomic cascades, deadline validation, ownership and stale revision checks. PostgreSQL is recommended; no database or provider was provisioned.

Installed technologies remain Next.js 16.4.6, React 19.3.0, TypeScript, Tailwind 4.3.3, ESLint and Prettier. Auth.js/Clerk, Supabase hosting and Vercel remain provisional, not implemented decisions. AI remains optional P3.

Visual design uses primary/success green `#16624f`, secondary `#29465b`, accent `#b8e976`, background `#fafcfb`, body text `#182c25`, muted text `#52655d`, borders `#cbd8d1`, warning `#88530b`, error `#b42318`. Typography is Segoe UI/Arial/Helvetica, 16px body and 14px secondary text. Layout uses a 72rem container, 20–32px gutters, a 4px spacing scale, rounded cards, and responsive stacked layouts. [Design conventions](design-system.md) include future forms, semantic feedback and visible keyboard focus. Browser checks cover the three specified widths; actual 200% zoom and screen-reader testing remain unverified.

## CODE REVIEW REPORT

No assigned teammate PR is available from the inspected GoalBuddy PR list. Existing [PR #1](https://github.com/ikpemhinoghena/goalbuddy/pull/1) and [PR #2](https://github.com/ikpemhinoghena/goalbuddy/pull/2) are both authored by the initiator, open, with zero reviews and no requested reviewers as inspected on 2026-11-20. They do not satisfy the separate assigned-teammate review requirement. No review comments were submitted or invented.

Outstanding: obtain a legitimate assigned teammate PR or instructor-approved alternative, inspect its actual diff and tests, prepare specific observations, and submit the review only with confirmed assignment and authorization. Main requires one approving review before merge. Week 03 has no PR yet because the user must choose the commit message first.

## Remaining submission requirements

Choose a commit message, review and publish the local Week 03 changes through a feature PR, disclose the preserved Week 02 branch ancestry, obtain the required real review before merge, finish board custom-field updates with authorized Projects access, and resolve the assigned-teammate review requirement. Match this draft to the actual Canvas prompts before submitting. No Teams message or Canvas submission was sent.
