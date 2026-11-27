# Week 04 verification evidence

**Date:** 2026-11-27
**Branch:** `feature/w04-secure-goal-workflow`, created from `feature/w03-team-foundation` at `353fc86`
**Environment:** Windows, Node.js 24.21.0, npm 11.19.0

## Static checks and build

| Check                                  | Result                                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                         | Passed                                                                                                           |
| `npx tsc --noEmit --incremental false` | Passed                                                                                                           |
| `npm run build`                        | Passed. Public pages are partially prerendered, account pages stream behind Suspense, and API routes are dynamic |
| Prettier on committed (LF) content     | Passed for every tracked file                                                                                    |
| `npm audit --omit=dev`                 | 0 vulnerabilities                                                                                                |

## Automated tests (`npm test`)

39 tests passed and 0 failed. They use Node's test runner with an in-memory PostgreSQL (PGlite), the real schema, and the real repositories and API handlers.

- **Validation:**
  - text limits counted by character;
  - unknown and forged `ownerId` fields rejected;
  - valid and impossible dates, IANA time zones and revisions;
  - pagination bounds and tampered cursors;
  - 400, 413 and 415 body handling.
- **Goal API:**
  - full lifecycle with persistence on reload;
  - duplicate titles remain distinct by ID;
  - 422 responses leave stored data unchanged;
  - 409 for stale updates and deletes;
  - target date checked against child deadlines;
  - cursor pagination over five goals.
- **Request safety:**
  - 401 for every goal operation without a session;
  - 403 for a cross-origin create.
- **Ownership:**
  - foreign, missing and malformed IDs return byte-identical 404 bodies;
  - a second user cannot list, update or delete another user's goal.
- **Cascade deletion:**
  - deletes milestones and tasks and reports the counts;
  - a failure injected inside the transaction rolls everything back.
- **Persistence:**
  - immutable owner and parent columns;
  - cross-goal milestone references rejected by the composite foreign key;
  - completion and timestamp consistency;
  - deleting a milestone keeps the goal's direct tasks;
  - database-level title checks.
- **Accounts and sessions:**
  - the first sign-in creates a profile and later sign-ins reuse it;
  - idle and absolute expiry;
  - revocation;
  - forged session IDs rejected.
- **Profile API:**
  - updates persist and affect only the signed-in user;
  - 409, 422, 401 and 403 cases.

## Browser checks in Microsoft Edge

These checks used:

- a production build (`next start`) backed by an in-memory PostgreSQL exposed over the PostgreSQL wire protocol;
- the migration script, run twice against that database to confirm it is idempotent;
- Playwright driving headless Microsoft Edge.

GitHub OAuth was not exercised. Each signed-in browser received a session cookie minted locally with Auth.js's own encoder and a throwaway secret, linked to a real `sessions` row. Every request still passed through the application's real session validation.

All 79 checks passed:

- **Anonymous visitors:**
  - `/`, `/dashboard` and `/login` return 200;
  - `/goals` redirects to `/login`;
  - `/api/goals` returns 401;
  - an unknown route returns 404;
  - the first Tab focuses the skip link.
- **Goal flow:**
  - an empty submission shows a focused alert and marks the field invalid with a description;
  - creating a goal persists it with the session owner, and it survives reload;
  - editing saves the change;
  - a concurrent change produces a 409 message, keeps the entered values, and does not overwrite.
- **Delete dialog:**
  - states the impact on milestones and tasks;
  - Cancel receives focus first;
  - Escape closes it and focus returns to the trigger;
  - Cancel keeps the goal;
  - confirming deletes the goal and its milestones.
- **Second user:**
  - sees the not-found UI with no leaked title;
  - API read and delete return 404;
  - a cross-origin create returns 403.
- **Profile:**
  - display name and time zone save, persist after reload, and update the header;
  - an empty name is rejected.
- **Sign-out:**
  - deletes the server session;
  - replaying the old cookie returns 401.
- **No uncaught page errors.**
- **Responsive layout:** at 320, 768 and 1280 CSS pixels, the home, goals, new, detail, edit and profile pages had no horizontal overflow, exactly one `h1` and one `main`.

Screenshots of the running build are in [evidence/w04](evidence/w04/).

## Not verified

- A live GitHub OAuth App or a hosted database. These need real credentials.
- Screen-reader output and 200% browser zoom.
- Rate limiting, which is not implemented.
- Performance at the specification's scale targets.
- Any deployment.
