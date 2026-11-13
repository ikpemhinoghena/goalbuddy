**Sync Impact Report**

- Version: uninitialized template to 1.0.0 (initial ratification)
- Principles: defined eight principles for code, architecture, styling, security, verification, data, AI, and scope
- Added sections: Additional Constraints; Development Workflow
- Removed sections: none
- Templates: updated `.specify/templates/plan-template.md` and `.specify/templates/tasks-template.md`; reviewed `.specify/templates/spec-template.md` with no changes; no command templates were present to review
- Runtime guidance: reviewed `README.md`; no changes required
- Follow-up items: none

# GoalBuddy Constitution

## Core Principles

### I. Strict, Maintainable TypeScript

All application TypeScript MUST pass strict type checking and MUST NOT use `any`. Code MUST use clear, consistent names and readable control flow. Components and utilities MUST be shared when doing so removes real duplication; abstractions MUST NOT be added without a concrete reuse or complexity benefit. Changes MUST remain as small as the requirement permits.

### II. Next.js App Router Boundaries

Routes MUST follow the Next.js App Router file conventions. Components MUST be Server Components by default; Client Components MUST be limited to browser-only behavior or interactivity that requires them. UI, business rules, and data access MUST have distinct responsibilities. Implementations MUST follow the documentation for the installed Next.js version when APIs or conventions are in question.

### III. Accessible, Responsive Styling

Tailwind CSS utilities MUST be the default styling approach. Custom CSS MUST be limited to cases that utilities cannot express clearly or maintainably. Interfaces MUST adapt to supported viewport sizes and provide semantic structure, keyboard operation, visible focus, and accessible names for interactive controls.

### IV. Security and Privacy by Default

Authentication MUST establish a verified user identity, and authorization MUST be checked for every protected operation and record access. All untrusted input MUST be validated at the relevant boundary. Secrets and private configuration MUST remain in protected environment variables and MUST NOT enter client bundles or source control. User-owned records MUST be isolated so one user cannot read or change another user's data. Sensitive data sent to external services MUST be limited to what the feature requires and justified in its plan.

### V. Verified Changes

Changes MUST pass formatting checks, ESLint, and strict TypeScript checking before a pull request is approved. Important user workflows and security- or data-sensitive behavior MUST have appropriate automated tests; test scope MUST reflect the change's risk and user impact. Verification results and any unavailable checks MUST be reported in the pull request.

### VI. Consistent Goal Data

Goal, milestone, task, deadline, ownership, and progress relationships MUST be validated and kept consistent on every write. Child records MUST belong to the same user and parent goal as the operation that changes them. Progress MUST have one documented source of truth, and updates MUST NOT leave partially applied or contradictory state.

### VII. User-Controlled AI Assistance

AI planning MUST remain optional; users MUST be able to create and manage plans when AI services are unavailable. Generated recommendations MUST be clearly identified and MUST be reviewable and editable before becoming part of a user's plan. Users MUST control whether suggestions are accepted, changed, or discarded. AI service failures MUST produce a recoverable experience without corrupting saved plans.

### VIII. Realistic MVP and Honest Scope

Work MUST prioritize the core goal, milestone, task, deadline, and progress workflow before optional AI assistance. Documentation, issues, and pull requests MUST distinguish implemented behavior from planned capability. Features MUST NOT be represented as complete without implementation and verification evidence. New scope MUST have documented user value and acceptance criteria.

## Additional Constraints

- The required stack is Next.js App Router, TypeScript, Tailwind CSS, ESLint, Prettier, Node.js, and npm.
- No technology or external service may be introduced without a documented future implementation requirement and a rationale for its use.
- The existing Next.js scaffold and project configuration MUST be preserved unless an accepted implementation requirement necessitates a change.
- Source code, configuration, and documentation MUST NOT gain comments, deferred-work markers, placeholders, or filler. Documentation MUST remain professional and complete.
- GoalBuddy's authentication, goal-management, dashboard, and AI-planning capabilities remain planned until implemented; the current scaffold MUST NOT be described as providing them.

## Development Workflow

- Each feature MUST have a GitHub Issue with documented acceptance criteria before implementation begins.
- Work MUST be done on a focused feature branch created from `main`, and submitted through a pull request targeting `main`.
- Pull requests MUST describe the change, acceptance criteria, and results of formatting, lint, type-check, and applicable test commands.
- At least one approving review is required before a pull request is merged into `main`.
- Reviewers MUST check this constitution's applicable principles and confirm that claims about completed behavior are supported by the implementation.

## Governance

This constitution governs project decisions and supersedes conflicting local practices. Amendments MUST be made through a reviewed pull request that states the reason for change and its effect on existing work. Every amendment MUST update the version and last-amended date. Versioning follows semantic versioning: MAJOR for incompatible changes to principles or governance, MINOR for new principles or materially expanded requirements, and PATCH for clarifications and non-semantic wording changes. Feature plans MUST pass the Constitution Check before implementation and recheck it after design; pull requests MUST verify compliance and document any justified exception. Exceptions require explicit rationale and approval in the pull request.

**Version**: 1.0.0 | **Ratified**: 2026-11-13 | **Last Amended**: 2026-11-13
