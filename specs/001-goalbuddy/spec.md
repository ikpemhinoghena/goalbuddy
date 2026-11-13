# Feature Specification: GoalBuddy

**Feature Branch**: `feature/project-documentation`  
**Created**: 2026-11-13  
**Status**: Proposed specification; application features are not implemented  
**Input**: Project initiator's GoalBuddy requirements for BYU-Idaho WDD 430 Week 02  
**Authority**: [GoalBuddy Constitution v1.0.0](../../.specify/memory/constitution.md)

This specification uses the existing GitHub Spec-Kit v0.0.90 specification template's user-scenario, requirements, entity, and measurable-outcome structure. It was prepared directly from that template and the ratified constitution; it is not evidence that a Copilot slash command or a Spec-Kit script ran. The API proposal extends the template at the project initiator's request.

## Purpose, problem, and audience

GoalBuddy is an AI-assisted goal planner and progress tracker. People often establish meaningful goals but struggle to identify actionable steps, maintain organization, and track consistent progress. The application will help students, professionals, and individuals managing educational, career, personal-development, and productivity goals organize ambitions into milestones and tasks with deadlines.

Users will own their plans and decide whether to use optional AI-generated suggestions. Manual planning must remain useful without any AI service.

## MVP boundaries and priorities

| Priority | Scope                                                                                                                | Delivery boundary                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| P1       | Accounts, profile, ownership enforcement, goal/milestone/task CRUD, completion and reopening, basic progress summary | Required manual-planning MVP, including security, validation, accessibility, and tests |
| P2       | Goal tags and filters, enhanced dashboard, progress visualization                                                    | Enhancements after the P1 workflows are verified                                       |
| P3       | Optional AI roadmap drafts and user-controlled acceptance                                                            | Optional increment after P1; never a prerequisite for manual planning                  |

Public sharing, team workspaces, social feeds, calendar synchronization, notifications, payments, native mobile apps, recurring tasks, file uploads, and autonomous AI execution are outside this scope. Authentication recovery, email changes, and account deletion require a separate specification before a public production launch; the course MVP must use test accounts and non-sensitive data until that readiness review. No deployment or production readiness is claimed here.

## User Scenarios & Testing

Stories are independently testable with seeded prerequisites; that does not imply that authentication and persistence dependencies can be skipped. Each story must pass its acceptance scenarios before being called complete.

### US1 - Register, authenticate, and manage my profile (Priority: P1)

As a user, I want a private account so that I can access my own saved plans.

**Why this priority**: Every saved workflow depends on verified identity and isolation.

**Independent Test**: Use two test identities and exercise registration, sign-in, profile updates, sign-out, and direct unauthorized requests.

**Acceptance Scenarios**:

1. **Given** valid registration details for a new identity, **When** I register and authenticate, **Then** I can access my empty personal workspace and read my profile.
2. **Given** invalid credentials or registration input, **When** I submit it, **Then** I receive actionable validation or a generic authentication failure, no authenticated session, and no partial account.
3. **Given** an authenticated session, **When** I change my display name or timezone and reload, **Then** the changes persist only for my account.
4. **Given** an authenticated session, **When** I log out or the session expires, **Then** protected requests require authentication again and signing out invalidates the session server-side.
5. **Given** another user's resource identifier, **When** I request or mutate it, **Then** I receive the same not-found result as for an absent resource and neither account's data changes.

### US2 - Manage goals (Priority: P1)

As a user, I want to create, read, revise, and delete goals with target dates so that my ambitions become manageable records.

**Why this priority**: Goals are the central unit of the product.

**Independent Test**: With an authenticated test identity, create two goals, inspect their list and details, edit one, reload, and delete it.

**Acceptance Scenarios**:

1. **Given** my workspace, **When** I save a goal with a title and optional description and target date, **Then** it appears in my list and detail view after reload.
2. **Given** my existing goal, **When** I update allowed fields, **Then** only that goal changes and invalid input preserves its last saved version.
3. **Given** a goal with children, **When** I cancel deletion, **Then** all records remain; **When** I confirm the displayed deletion impact, **Then** the goal, its milestones, tasks, and AI drafts are removed atomically.

### US3 - Organize milestones (Priority: P1)

As a user, I want to create, read, edit, and delete milestones within a goal so that I can divide work into intermediate outcomes.

**Why this priority**: Milestones make a goal's plan understandable.

**Independent Test**: Seed an owned goal and manage milestones without depending on dashboard enhancements.

**Acceptance Scenarios**:

1. **Given** an owned goal, **When** I create a milestone with a title and optional deadline, **Then** its list and detail views show it under that goal after reload.
2. **Given** a milestone, **When** I edit its title, description, or deadline, **Then** valid changes persist and an inconsistent deadline is rejected without changing saved data.
3. **Given** a milestone containing tasks, **When** I confirm deletion, **Then** its tasks and the milestone are deleted atomically and the goal's progress is recalculated; cancellation changes nothing.
4. **Given** a foreign goal or mismatched parent identifier, **When** I attempt a milestone write, **Then** the operation is rejected without creating or moving records.

### US4 - Manage and complete tasks (Priority: P1)

As a user, I want to create, read, update, complete, reopen, and delete tasks so that I can record actual work.

**Why this priority**: Task states are the source of progress truth.

**Independent Test**: Seed an owned goal and milestone, then exercise direct-goal and milestone tasks through every supported state change.

**Acceptance Scenarios**:

1. **Given** a goal, **When** I create a task directly under it or under one of its milestones, **Then** the task is readable in that goal with its title, optional description, deadline, and initial incomplete state.
2. **Given** an existing task, **When** I edit its fields or assign it to another milestone in the same goal, **Then** valid changes persist; cross-goal reassignment is rejected.
3. **Given** an incomplete task, **When** I complete it twice, **Then** it remains completed once with no duplicate progress; **When** I reopen it, **Then** it becomes incomplete and progress decreases.
4. **Given** a saved task, **When** I cancel deletion, **Then** it remains; **When** I confirm deletion, **Then** it disappears and progress uses the remaining tasks.

### US5 - Review basic progress (Priority: P1)

As a user, I want accurate goal progress and a basic dashboard summary so that I can see what remains.

**Why this priority**: Accurate feedback completes the manual-planning MVP.

**Independent Test**: Seed goals with zero tasks, two of three completed tasks, and all tasks completed; compare every summary with source records.

**Acceptance Scenarios**:

1. **Given** two completed tasks out of three in a goal, **When** I view its detail or basic dashboard, **Then** both show 2/3 and 67% using the same calculation.
2. **Given** a goal with no tasks, **When** I view progress, **Then** it shows 0% with “No tasks yet,” rather than a completed goal.
3. **Given** a successful task mutation or deletion, **When** the view refreshes, **Then** counts, percentages, and overdue totals agree with persisted tasks.
4. **Given** an empty account, **When** I open the dashboard, **Then** it explains how to create a goal without showing fabricated activity.

### US6 - Filter goals and visualize progress (Priority: P2)

As a user with multiple goals, I want tags, filters, and readable progress visuals so that I can focus on relevant work.

**Why this priority**: Useful at larger goal counts but not required for the core workflow.

**Independent Test**: Seed tagged goals with mixed deadlines and task completion; compare filtered lists and textual chart alternatives.

**Acceptance Scenarios**:

1. **Given** my goals, **When** I add or remove tags and filter by tag, completion state, overdue state, or title text, **Then** only matching owned goals appear; clearing filters restores the full list.
2. **Given** an enhanced dashboard, **When** I inspect a progress visual using a keyboard or screen reader, **Then** equivalent labeled counts and percentages are available without relying on color.
3. **Given** no matching results, **When** filters are active, **Then** the interface distinguishes no matches from no saved goals and provides a clear-filter action.

### US7 - Review optional AI roadmap suggestions (Priority: P3)

As a user, I want to request and review an AI draft so that I can choose useful suggestions without surrendering control of my plan.

**Why this priority**: AI supports an already usable manual workflow.

**Independent Test**: Use a deterministic fake AI service for success, malformed output, timeout, and unavailability; no live provider is required for acceptance tests.

**Acceptance Scenarios**:

1. **Given** an owned goal and a preview of information to be sent externally, **When** I explicitly request generation, **Then** returned suggestions are labeled AI-generated drafts and do not alter saved milestones or tasks.
2. **Given** a valid draft, **When** I review and edit its proposed titles, descriptions, and deadlines and accept it, **Then** the validated draft is added atomically to that goal, with existing work preserved and new tasks incomplete.
3. **Given** a draft, **When** I reject it, **Then** no plan records are added and its generated content is removed.
4. **Given** a timeout, unavailable service, or malformed output, **When** generation fails, **Then** an actionable retry/manual-planning message appears and saved plans remain unchanged.
5. **Given** an already accepted draft, **When** acceptance is retried, **Then** the existing acceptance result is returned without duplicate records; a stale goal revision returns a conflict requiring review.

### Edge Cases

- Empty or whitespace-only titles, oversized text, unknown fields, malformed JSON, invalid dates, invalid timezone names, and forged ownership fields are rejected server-side.
- Goals and milestones without tasks display 0%; deleting or reopening the last completed task updates every dependent summary.
- Past deadlines are allowed and visibly overdue, not silently changed. Date-only deadlines use the user's profile timezone; timestamps use UTC.
- A task deadline must not exceed its milestone deadline or goal target date when those dates exist. A milestone deadline must not exceed the goal target date. Parent date edits that would invalidate children are rejected atomically with an explanation.
- Duplicate titles are allowed; identifiers distinguish records. Pagination must not duplicate or skip records under an unchanged dataset.
- Concurrent edits must detect stale revisions rather than silently overwrite them. Deletion racing with a write returns not found or conflict with no orphaned children.
- A network failure must not show an unsaved mutation as successful. The UI retains entered values where possible and refreshes authoritative state before retrying an uncertain write.
- Prompt-injection text or executable content returned by AI is untrusted content, never an instruction to call tools or disclose other data.
- Expired sessions, direct API access, foreign identifiers, and mismatched parent paths must receive the same ownership checks as normal UI actions.

## Requirements

### Functional Requirements

- **FR-001 (US1, P1)**: Support registration, authentication, logout, and profile read/update. Identity is established server-side; display name and timezone are the only editable profile fields in this scope.
- **FR-002 (US1–US7, P1)**: Require authentication for all saved data and derive ownership from the authenticated identity, never from client-supplied owner IDs.
- **FR-003 (US2, P1)**: Persist goal creation, list/detail reads, partial updates, and confirmed cascade deletion.
- **FR-004 (US3, P1)**: Persist milestone creation, list/detail reads, updates, and confirmed deletion under exactly one owned goal.
- **FR-005 (US4, P1)**: Persist task creation, list/detail reads, updates, completion, reopening, and deletion. Each task belongs to one goal and optionally a milestone of that goal.
- **FR-006 (US5, P1)**: Compute progress from persisted task completion only: zero tasks means 0%; otherwise round 100 × completed task count / total task count to the nearest integer. Show counts alongside percentages. Count each task once, including milestone tasks. A goal is complete only when it has at least one task and all are completed.
- **FR-007 (US5, P1)**: Show owned goal summaries, total/completed task counts, and overdue incomplete tasks. Account-wide percentage uses all owned tasks, not an average of goal percentages. A task is overdue only after its deadline date has ended in the user's timezone.
- **FR-008 (US2–US4, P1)**: Enforce parent-child ownership, deadline consistency, revision checks, and atomic writes/deletions. Ownership and goal association cannot be changed by ordinary update operations.
- **FR-009 (US6, P2)**: Add up to ten case-insensitive tags per goal, each 1–30 trimmed characters, plus title/tag/completion/overdue filters. Overdue goals are incomplete goals whose target date has ended, including goals with no tasks.
- **FR-010 (US6, P2)**: Provide enhanced progress visuals with equivalent text, preserving the FR-006 source of truth.
- **FR-011 (US7, P3)**: Generate a separate draft only after explicit consent to the displayed external-data payload. Accept only an owned goal's title, description, target date, and user-entered planning guidance; exclude identity details and unrelated records.
- **FR-012 (US7, P3)**: Allow draft read/edit, whole-draft acceptance, and rejection. Editing may remove unwanted suggestions before acceptance. Validate every generated item using manual-entry rules; accepting is atomic and idempotent, appends rather than replaces work, and never changes existing completion states.
- **FR-013 (US7, P3)**: Provide bounded generation requests, clear failures, retry controls, and fully usable manual planning when AI is disabled or unavailable.
- **FR-014 (all stories)**: Return meaningful loading, empty, validation, unauthorized, conflict, and failure states. Never claim persistence until the server confirms it.

### Nonfunctional, security, and privacy requirements

- **NFR-001**: Use Next.js App Router, strict TypeScript without application `any`, Tailwind CSS, ESLint, Prettier, Node.js, and npm. Keep UI, business rules, and persistence responsibilities distinct; use Server Components by default and Client Components only where needed.
- **NFR-002**: Authorize every protected read/write and scope collection queries to the authenticated owner. Missing and foreign resources return indistinguishable 404 outcomes. Never cache private results across users; private HTTP responses use `Cache-Control: no-store`.
- **NFR-003**: Validate input on the server and provide matching client feedback. Titles are 1–120 trimmed characters; descriptions are at most 5,000 characters; display names are 1–80 trimmed characters. Dates are optional valid `YYYY-MM-DD` values; completion is boolean. Reject unsupported update fields and use a 64 KiB maximum JSON request body.
- **NFR-004**: Select authentication and persistence mechanisms only through a documented implementation decision. Before implementation, specify session expiry, credential policy, secure storage, abuse limits, and recovery boundaries. Never store plaintext credentials. Where cookies carry sessions, require Secure in production, HttpOnly, an appropriate SameSite policy, and CSRF protection for state changes. Never place secrets in browser bundles or logs.
- **NFR-005**: Provide semantic labels, keyboard operation, visible focus, associated validation messages, non-color-only progress, and focus management after dialogs. Verify core journeys at 320, 768, and 1280 CSS-pixel viewport widths and 200% zoom without loss of actions or unintended horizontal scrolling.
- **NFR-006**: Persist successful changes across reload and sign-in; enforce all-or-nothing cascades and AI acceptance. Use server-issued revisions for concurrency and derive progress from task records rather than independently editable percentage fields.
- **NFR-007**: Automate important workflow, authorization, validation, concurrency, and data-integrity tests. Every implementation PR must pass formatting, ESLint, strict TypeScript, and applicable tests. Record limitations honestly; documentation checks do not prove application functionality.
- **NFR-008**: On a documented local acceptance-test environment containing 100 goals and 1,000 tasks for one account, target a p95 of at most two seconds for manual list/detail/mutation responses across 30 repeated requests after warm-up, excluding network outages and AI. Report environment and measured results; these are future targets, not current benchmarks.
- **NFR-009**: Use encrypted transport outside localhost; avoid credentials, session tokens, goal text, and AI prompts in routine logs. Render user/AI text safely without executable markup. Retain only needed account and planning data. Rejected AI content is deleted immediately; accepted draft content is removed after creation, retaining only a minimal ownership-linked acceptance receipt until goal deletion. Pending drafts expire after seven days. Do not claim external-provider retention guarantees before a documented provider review.
- **NFR-010**: Rate-limit authentication and AI generation using documented limits before enabling them; return 429 with retry guidance. AI requests must time out within 30 seconds; a draft may contain at most 20 milestones and 100 tasks. Failed or excessive outputs must not partially persist.

### Key Entities and Relationships

| Entity                | Essential attributes                                                                                                                     | Relationships and invariants                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| User                  | Server-issued ID, authenticated identity reference, display name, timezone, revision, created/updated timestamps                         | Owns goals; credential/session mechanism remains a design decision                                       |
| Goal                  | ID, owner ID, title, description, optional target date, revision, timestamps; tags at P2                                                 | One owner; many milestones and tasks; progress is derived                                                |
| Milestone             | ID, goal ID, title, description, optional deadline, revision, timestamps                                                                 | Exactly one goal; tasks must share that goal and its owner                                               |
| Task                  | ID, goal ID, optional milestone ID, title, description, optional deadline, completed boolean, completion timestamp, revision, timestamps | Owner inherited from goal; completion timestamp set on first completion and cleared on reopening         |
| AI draft              | ID, goal ID, owner ID, base goal revision, editable suggested milestones/tasks, revision, created/expiry timestamps                      | P3 only; pending draft is separate from active records; goal plan revision changes on any child mutation |
| AI acceptance receipt | Draft ID, owner/goal ID, created record IDs, acceptance timestamp                                                                        | P3 only; prevents duplicate acceptance without retaining unnecessary generated text                      |

No persistence engine, authentication provider, AI provider, hosting service, or additional package is selected by this specification. The implementation decision must justify capabilities, cost, security, and testing impact before adoption.

### Proposed API contract

These are proposed application-owned endpoints, not existing routes. Implement with named HTTP method exports in `app/api/**/route.ts`, keeping UI `page.tsx` in separate route segments. For example, `/api/goals/{goalId}` maps to `app/api/goals/[goalId]/route.ts`. Dynamic route parameters must follow the installed Next.js documentation's asynchronous `params` convention. Authentication adapters may require a reviewed contract amendment; no provider-specific route is assumed.

Successful reads/updates return JSON; creations return 201 with the resource and its location; deletes/logout return 204 without a body. Collections return `items` and an optional `nextCursor`, with a default limit of 20 and maximum of 100. Unsupported methods return 405. All protected endpoints require a valid session and ownership of every path resource. Revisions accompany reads; PATCH/DELETE and draft acceptance supply an expected revision. Creation takes only allowed resource fields; the server assigns IDs, owner, revisions, and timestamps.

| Method and path                                                   | Behavior / accepted fields                                                                                          | Access and success                                                                        |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| POST `/api/auth/register`                                         | Register using identity proof/credentials required by the reviewed authentication design plus display name/timezone | Public, validated and rate-limited; 201 minimal account acknowledgment, never credentials |
| POST `/api/auth/login`                                            | Validate credentials/identity proof using the selected mechanism                                                    | Public, rate-limited; 200 minimal profile and established session                         |
| POST `/api/auth/logout`                                           | Invalidate current session                                                                                          | Current session or already signed out; 204                                                |
| GET, PATCH `/api/profile`                                         | Read own profile; update display name/timezone and expected revision                                                | Authenticated self only; 200                                                              |
| GET, POST `/api/goals`                                            | List owned goals; create title, description, optional target date; tags/filters added at P2                         | Owner-scoped; 200 / 201                                                                   |
| GET, PATCH, DELETE `/api/goals/{goalId}`                          | Read; edit allowed goal fields; confirmed atomic cascade deletion                                                   | Goal owner; 200 / 200 / 204                                                               |
| GET, POST `/api/goals/{goalId}/milestones`                        | List; create title, description, optional deadline                                                                  | Goal owner; 200 / 201                                                                     |
| GET, PATCH, DELETE `/api/goals/{goalId}/milestones/{milestoneId}` | Read; edit fields; confirmed milestone/task cascade                                                                 | Same goal and owner; 200 / 200 / 204                                                      |
| GET, POST `/api/goals/{goalId}/tasks`                             | List all goal tasks, optionally by milestone; create title, description, deadline, optional milestone ID            | Goal owner and matching milestone; 200 / 201                                              |
| GET, PATCH, DELETE `/api/goals/{goalId}/tasks/{taskId}`           | Read; edit fields/milestone/completed state; confirmed delete                                                       | Same goal and owner; 200 / 200 / 204                                                      |
| GET `/api/dashboard`                                              | Basic owner-scoped summaries at P1; optional filters/visual data at P2                                              | Authenticated self only; 200                                                              |
| POST `/api/goals/{goalId}/ai-drafts`                              | Explicit generation request with planning guidance and consent to displayed payload                                 | Goal owner, P3, rate-limited; 201 pending draft                                           |
| GET, PATCH, DELETE `/api/goals/{goalId}/ai-drafts/{draftId}`      | Read pending draft; edit validated suggestions with expected revision; reject/delete                                | Same goal and owner, P3; 200 / 200 / 204                                                  |
| POST `/api/goals/{goalId}/ai-drafts/{draftId}/accept`             | Accept current reviewed draft with expected draft and goal revisions                                                | Same goal and owner, P3; 200 receipt for initial or repeated acceptance                   |

All API paths have the following error contract where applicable: 400 malformed JSON/query/identifier; 401 missing or expired authentication (or generic login failure); 403 failed CSRF check; 404 missing/foreign/mismatched-parent resource; 409 stale revision, identity registration conflict with non-disclosing wording, or concurrent state conflict; 413 oversized request; 415 unsupported content type; 422 field/deadline validation; 429 rate limit; 500 unexpected internal failure without implementation details. AI additionally returns 502 for unusable provider output, 503 when disabled/unavailable, and 504 for timeout. Errors use a stable code, safe message, and optional field errors without leaking foreign record existence. Failed mutations leave persisted state unchanged.

Completed-task PATCH retries with the latest revision are state-idempotent; stale retries return 409. Repeated deletes return 404 after successful deletion. AI acceptance retries return the original receipt only to the same owner. Creation retries must not be automatic after an uncertain network result; first refresh saved state. User confirmation occurs in the UI before destructive calls, with the cascade impact stated explicitly.

## Assumptions and explicit scope decisions

- These are proposed requirements from the initiator, not a record of team voting or approval. Only Ikpemhinoghena Etiuzale is verified as project initiator.
- A single-user ownership model is the MVP. The course team collaborates on code, not on shared user goal records.
- Tasks may be attached directly to a goal. Milestones are optional; neither milestones nor goals have manually editable completion percentages.
- Deadlines are optional. Date consistency is enforced only where relevant dates exist. Users select a valid IANA timezone during profile setup; default is UTC until changed.
- No assignees, effort estimates, or delivery dates are promised. Dependencies in the backlog determine implementation order.
- This documentation stays on `feature/project-documentation`, which the initiator reports was created from `feature/project-setup`. This is a workflow deviation from the constitution's normal branch-from-main rule. Disclose the rationale (preserving existing setup work) and obtain explicit reviewer approval for the exception; no approval is asserted here.
- The backlog is planning-level work derived from this specification, not output from running `/speckit.tasks` after a completed implementation plan. Its first task supplies the design and Constitution Check required before feature implementation.

## Success Criteria

### Measurable Outcomes

- **SC-001 (US1)**: All registration/login/logout/profile acceptance scenarios pass, and the two-user authorization matrix denies every tested foreign read and mutation with zero data disclosure.
- **SC-002 (US2–US4)**: Every listed CRUD and completion/reopening scenario passes after reload; invalid or interrupted mutations leave zero partial records and zero orphaned children in the test fixtures.
- **SC-003 (US5)**: Zero-task, 2-of-3, all-complete, reopen, reassignment, and deletion fixtures produce the specified counts and percentages in every summary; repeated completion never increases counts twice.
- **SC-004 (US1–US5)**: A reviewer can complete the manual account-to-goal-to-task-to-progress journey using only a keyboard, with all controls named and all validation errors associated with their fields at the specified viewport/zoom sizes.
- **SC-005 (US6)**: Every supported filter returns exactly the expected owned fixture records; visuals expose the same counts as their textual alternatives.
- **SC-006 (US7)**: Successful, edited, rejected, malformed, unavailable, timed-out, repeated-acceptance, and stale-revision draft tests pass with zero unapproved plan mutations or duplicate accepted records.
- **SC-007 (US1–US5)**: All P1 workflows remain usable with AI disabled and meet the documented NFR-008 response-time target in the recorded test environment.
- **SC-008 (all delivered stories)**: Formatting, ESLint, strict TypeScript, and applicable automated workflow/security tests pass before approval; each delivered story has traceable test evidence. None of these future feature outcomes is claimed by the scaffold or this document.
