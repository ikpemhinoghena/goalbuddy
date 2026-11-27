# GoalBuddy implementation backlog

**Date**: 2026-11-13  
**Source**: [Formal specification](spec.md) and [constitution](../../.specify/memory/constitution.md)

All 15 tasks below describe future implementation. None is assigned or claimed complete. Stable T identifiers are planning references, not GitHub issue numbers. Publish issues before implementation, then use feature branches and reviewed pull requests. No additional packages or providers are authorized solely by listing these tasks.

This is a specification-derived backlog prepared directly using Spec-Kit's priority and dependency approach. It is not a claim that the design-dependent `/speckit.tasks` workflow has run. T001 must produce the implementation plan and Constitution Check before application work starts. Add concrete internal module/test paths there after design; proposed public route locations are already specified.

## P1: Foundation and manual-planning MVP

### T001 - Document implementation design and pass Constitution Check

**Priority**: P1  
**Feature/data area**: Architecture; all stories  
**Dependencies**: None  
**Status**: Planned; not implemented

Create specs/001-goalbuddy/plan.md before feature implementation, using the reviewed Spec-Kit plan template and installed Next.js guides.

**Acceptance criteria**:

- [ ] Record justified authentication, persistence, test tooling, and runtime choices without adding technology solely for convenience; compare alternatives and security/cost impacts.
- [ ] Define credential policy, session expiry, secure storage, abuse thresholds, CSRF strategy, transactions, revision enforcement, and test-data isolation.
- [ ] Record every constitution gate before design and recheck after design; surface the existing branch-origin deviation for explicit review rather than claiming approval.
- [ ] Document actual intended paths under app/, shared business/data boundaries, and a test strategy; keep provider-specific choices out of feature code until reviewed.

### T002 - Implement owned data models and atomic persistence

**Priority**: P1  
**Feature/data area**: User, Goal, Milestone, Task; US1–US5  
**Dependencies**: T001  
**Status**: Planned; not implemented

Implement the specification's entities, server-issued identifiers/revisions, durable persistence, and parent-child integrity.

**Acceptance criteria**:

- [ ] Goal ownership is immutable, each milestone belongs to one goal, and tasks can reference only milestones in their own goal; automated tests reject invalid relationships.
- [ ] Successful writes survive reload; parent deletion and child mutations are atomic with no orphaned records under simulated failure.
- [ ] Task completion is boolean with completion timestamp semantics; progress is derived rather than stored as an independently editable percentage.
- [ ] Stale revisions return conflict and every goal/child mutation updates the goal plan revision used by future AI acceptance.

### T003 - Build shared request validation and error handling

**Priority**: P1  
**Feature/data area**: API boundaries; all stories  
**Dependencies**: T001  
**Status**: Planned; not implemented

Implement server-side validation and safe error responses for the proposed app/api routes, with shared client feedback.

**Acceptance criteria**:

- [ ] Validate title/description/display-name limits, dates, timezone, field allowlists, boolean states, pagination, content type, and the 64 KiB body limit from the specification.
- [ ] Malformed JSON returns 400, unsupported content type 415, oversized input 413, and invalid fields 422 with safe field errors; unexpected errors expose no stack traces or secrets.
- [ ] Deadline validation rejects parent edits that invalidate children without partial writes; past valid deadlines remain allowed.
- [ ] Contract tests cover error shape, pagination bounds, unknown fields, forged ownership, and invalid dates.

### T004 - Implement accounts, sessions, and profile management

**Priority**: P1  
**Feature/data area**: Authentication and User; US1  
**Dependencies**: T001, T002, T003  
**Status**: Planned; not implemented

Implement the proposed authentication and profile routes and their UI using the reviewed design.

**Acceptance criteria**:

- [ ] Registration and login establish a verified identity; invalid credentials do not establish a session; sensitive identity conflicts use non-disclosing responses.
- [ ] Profile reads/updates affect only the authenticated user's display name and timezone and persist after reload.
- [ ] Logout invalidates the server session; expired sessions return 401; session and credential protections follow the reviewed design, including CSRF for cookie-based mutations.
- [ ] Automated tests cover valid/invalid registration and login, logout, expiry, profile validation, revision conflicts, and rate limiting.

### T005 - Enforce ownership on every protected operation

**Priority**: P1  
**Feature/data area**: Authorization; US1–US7  
**Dependencies**: T002, T004  
**Status**: Planned; not implemented

Provide reusable server-side ownership checks and owner-scoped queries for all current and future protected resources.

**Acceptance criteria**:

- [ ] Never accept owner identity from client input; list queries return only records owned by the authenticated user.
- [ ] Absent, foreign, and mismatched-parent identifiers return indistinguishable 404 responses; unauthenticated access returns 401.
- [ ] Two-user tests attempt direct reads, writes, child reassignment, deletion, and enumeration without leaking data or modifying either account.
- [ ] Private responses use no-store and do not share user data through caches; future P3 routes must reuse and extend this test matrix.

### T006 - Build an accessible responsive application shell

**Priority**: P1  
**Feature/data area**: UI foundation; US1–US5  
**Dependencies**: T001  
**Status**: Planned; not implemented

Create reusable Tailwind-based navigation, form, dialog, loading, empty, and error patterns without changing the required stack.

**Acceptance criteria**:

- [ ] Controls have accessible names, visible focus, keyboard operation, associated errors, and reliable focus restoration after dialogs.
- [ ] Representative forms and navigation remain usable at 320, 768, and 1280 CSS pixels and 200% zoom without lost controls or unintended horizontal scrolling.
- [ ] Server Components remain the default; Client Components are limited to required interaction and browser behavior.
- [ ] Document keyboard and viewport checks; forms preserve entered values after recoverable failures and never announce unsaved work as persisted.

### T007 - Implement goal CRUD and confirmed cascade deletion

**Priority**: P1  
**Feature/data area**: Goal; US2  
**Dependencies**: T002, T003, T005, T006  
**Status**: Planned; not implemented

Implement app/api/goals/route.ts, app/api/goals/[goalId]/route.ts, and owned goal list/detail/create/edit flows.

**Acceptance criteria**:

- [ ] Create, list, read, and update title, description, and optional target date; successful changes persist after reload.
- [ ] Invalid input or stale revisions preserve existing state and show actionable feedback; duplicate titles remain distinguishable by ID.
- [ ] Deletion dialog states child impact; cancel leaves records intact and confirmation deletes the owned goal and children atomically.
- [ ] Automated tests cover the full CRUD lifecycle, foreign access, deadline consistency, pagination, and cascade failure rollback.

### T008 - Implement milestone CRUD within owned goals

**Priority**: P1  
**Feature/data area**: Milestone; US3  
**Dependencies**: T007  
**Status**: Planned; not implemented

Implement nested milestone routes and list/detail/create/edit/delete UI for an owned goal.

**Acceptance criteria**:

- [ ] Create, read, update, and list milestones with optional deadlines; all writes validate the parent goal and ownership.
- [ ] Deadline edits follow the specification; a foreign goal, mismatched parent, or invalid date creates no partial data.
- [ ] Confirmed deletion atomically removes the milestone and its tasks; cancellation changes nothing.
- [ ] Tests cover persistence, unauthorized operations, stale revisions, children affected by deadline edits, and deletion rollback.

### T009 - Implement task CRUD, completion, and reopening

**Priority**: P1  
**Feature/data area**: Task; US4  
**Dependencies**: T007, T008  
**Status**: Planned; not implemented

Implement nested goal task routes and UI for direct-goal and milestone tasks.

**Acceptance criteria**:

- [ ] Create, list, read, edit, and delete tasks with optional deadlines; moving between milestones is allowed only within the same owned goal.
- [ ] Tasks start incomplete, completion sets the timestamp once, and reopening clears it; repeat completion with current revision does not duplicate progress.
- [ ] Validation and stale-revision failures leave saved state intact; destructive actions require explicit confirmation in the UI.
- [ ] Tests cover every state transition, cross-goal rejection, ownership, deadline boundaries, concurrency, and persistence.

### T010 - Implement one source of truth for progress

**Priority**: P1  
**Feature/data area**: Progress domain; US5  
**Dependencies**: T009  
**Status**: Planned; not implemented

Implement shared task-based aggregation used by goal, milestone, and dashboard summaries.

**Acceptance criteria**:

- [ ] Zero tasks yields 0% and a no-tasks message; two completed of three yields 2/3 and 67%; all tasks complete yields 100%.
- [ ] Count milestone tasks once in goal and account totals; account percentage is weighted by task count rather than averaged goal percentages.
- [ ] Completion, reopening, deletion, and reassignment immediately produce correct authoritative counts after refresh.
- [ ] Unit tests cover empty, partial, complete, repeated completion, last-task deletion, and timezone/date-boundary overdue fixtures.

### T011 - Deliver the basic dashboard and MVP acceptance tests

**Priority**: P1  
**Feature/data area**: Dashboard and integrated verification; US1–US5  
**Dependencies**: T004, T005, T006, T007, T008, T009, T010  
**Status**: Planned; not implemented

Implement app/api/dashboard/route.ts and a basic owned-goal summary, then verify the complete manual workflow.

**Acceptance criteria**:

- [ ] Show goal progress, total/completed tasks, overdue incomplete tasks, and useful empty/loading/error states using the shared calculation.
- [ ] Automated end-to-end tests cover account-to-goal-to-milestone-to-task-to-progress, including logout and AI-disabled operation; two-user tests cover all implemented routes.
- [ ] Record keyboard/viewport review, atomicity/conflict tests, and the NFR-008 response-time run on 100 goals and 1,000 tasks.
- [ ] Formatting, lint, type checking, and applicable tests pass; README states only the behavior supported by implementation evidence.

## P2: Organization and enhanced visibility

### T012 - Add goal tags and filtering

**Priority**: P2  
**Feature/data area**: Goal organization; US6  
**Dependencies**: T011  
**Status**: Planned; not implemented

Add tag editing and title/tag/completion/overdue filters to owned goal lists.

**Acceptance criteria**:

- [ ] Allow at most ten case-insensitive tags per goal, each 1–30 trimmed characters, and persist them after reload.
- [ ] Filters return exactly matching owned records, compose consistently with pagination, and clearing them restores the unfiltered list.
- [ ] No-matches feedback is distinct from an empty account; overdue rules match the specification, including goals with no tasks.
- [ ] Tests cover case handling, tag limits, combined filters, pagination, timezone boundaries, and foreign data exclusion.

### T013 - Add accessible progress visualization

**Priority**: P2  
**Feature/data area**: Enhanced dashboard; US6  
**Dependencies**: T010, T011, T012  
**Status**: Planned; not implemented

Enhance the dashboard with progress visuals and filtering while retaining the basic summary.

**Acceptance criteria**:

- [ ] Visuals and textual alternatives show identical authoritative counts and percentages.
- [ ] Color is not the sole indicator; keyboard and screen-reader paths expose names, values, and filter controls.
- [ ] Responsive and zoom checks pass at the specification's sizes, including empty and no-match states.
- [ ] Regression tests ensure enhanced views do not change the underlying progress calculation or ownership scope.

## P3: Optional AI assistance

### T014 - Implement opt-in AI draft generation and review

**Priority**: P3  
**Feature/data area**: AI draft; US7  
**Dependencies**: T001, T003, T005, T011  
**Status**: Planned; not implemented

Document an AI-provider decision before adoption, then implement generation, draft reading/editing, and rejection separately from active plans.

**Acceptance criteria**:

- [ ] Review provider cost, retention, data handling, timeout, and rate limits; show the exact allowed external payload and require an explicit generation request.
- [ ] Returned suggestions are clearly AI-generated and editable; generated content never executes instructions or writes active milestones/tasks.
- [ ] Validate draft limits of 20 milestones and 100 tasks, manual-entry field rules, and seven-day pending expiry; rejection deletes generated content.
- [ ] Fake-service tests cover malformed output, prompt injection, disabled service, timeout within 30 seconds, ownership, and retry; manual planning continues unchanged.

### T015 - Implement atomic AI draft acceptance and recovery

**Priority**: P3  
**Feature/data area**: AI draft, receipt, Goal, Milestone, Task; US7  
**Dependencies**: T014, T008, T009, T010  
**Status**: Planned; not implemented

Accept only reviewed owned drafts, appending new milestones/tasks transactionally and preserving existing work.

**Acceptance criteria**:

- [ ] Acceptance validates draft and goal revisions, field/deadline rules, and ownership; stale plans return 409 for review without partial writes.
- [ ] Successful acceptance adds new incomplete tasks, preserves existing records, updates progress, and removes redundant generated content while keeping a minimal receipt.
- [ ] Repeat acceptance by the owner returns the same receipt without duplicates; foreign access is rejected and goal deletion removes its receipt.
- [ ] Tests cover edited drafts, acceptance retries, rollback, concurrent mutations, deleted goals, and every US7 scenario; publish evidence and retain full manual operation.

## Execution and completion rules

Follow the dependencies above rather than treating every story as independent implementation work. After T001, T002, T003, and T006 may proceed independently if capacity allows; no people are assigned here. T011 is the P1 release gate. P2 and P3 are later increments; P3 does not depend on visual enhancements, and manual planning must never depend on AI availability.

Every feature task includes appropriate tests in its acceptance criteria. T011 integrates those tests rather than postponing security verification until the end. T014 and T015 add P3-specific tests. Before an implementation task is complete, its criteria must be demonstrated, applicable tests and repository checks must pass, and a pull request must receive at least one approving review before merge. The existing branch-origin exception must be disclosed and explicitly reviewed. No review or merge is recorded by this document.
