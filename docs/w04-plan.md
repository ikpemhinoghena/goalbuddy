# GoalBuddy Week 04 implementation plan

Prepared independently on 2026-11-20. No delivery date or inactive teammate commitment is assumed. The [milestone](https://github.com/ikpemhinoghena/goalbuddy/milestone/1) is **Week 04 - Secure goal workflow**. Its seven issues are assigned to `ikpemhinoghena`; milestone creation and assignments were read back from GitHub.

## Prioritized backlog

| Order         | Existing issue                                                                                                                                            | Priority | Dependency                        | Delivery boundary                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------- | -------------------------------------------------------------------------------- |
| 1             | [#3 T001 design](https://github.com/ikpemhinoghena/goalbuddy/issues/3)                                                                                    | P1       | None                              | Review local plan; settle provider/session policies and branch exception         |
| 2             | [#5 T003 validation](https://github.com/ikpemhinoghena/goalbuddy/issues/5)                                                                                | P1       | #3                                | Pure input validation, safe HTTP errors, matching client feedback                |
| 3             | [#4 T002 persistence](https://github.com/ikpemhinoghena/goalbuddy/issues/4)                                                                               | P1       | #3                                | Schema/constraint tests, then transactional data access                          |
| 4             | [#6 T004 accounts](https://github.com/ikpemhinoghena/goalbuddy/issues/6)                                                                                  | P1       | #3, #4, #5                        | Server identity/session lifecycle, then account/profile UI                       |
| 5             | [#7 T005 ownership](https://github.com/ikpemhinoghena/goalbuddy/issues/7)                                                                                 | P1       | #4, #6                            | Owner-scoped operations and two-user rejection tests                             |
| Alongside 2–5 | [#8 T006 shell/forms](https://github.com/ikpemhinoghena/goalbuddy/issues/8)                                                                               | P1       | #3                                | Extend existing shell with real forms/dialogs; check focus and failure retention |
| 6             | [#9 T007 goal CRUD](https://github.com/ikpemhinoghena/goalbuddy/issues/9)                                                                                 | P1       | #4, #5, #7, #8                    | API lifecycle and tests, then owned goal screens/deletion confirmation           |
| Follow-on     | [#10 T008 milestones](https://github.com/ikpemhinoghena/goalbuddy/issues/10)                                                                              | P1       | #9                                | Nested operations and rollback tests                                             |
| Follow-on     | [#11 T009 tasks](https://github.com/ikpemhinoghena/goalbuddy/issues/11)                                                                                   | P1       | #9, #10                           | Direct-goal and milestone tasks; completion/reopening                            |
| Follow-on     | [#12 T010 progress](https://github.com/ikpemhinoghena/goalbuddy/issues/12)                                                                                | P1       | #11                               | Shared calculation, weighted totals, timezone boundaries                         |
| Follow-on     | [#13 T011 dashboard/acceptance](https://github.com/ikpemhinoghena/goalbuddy/issues/13)                                                                    | P1       | #6–#12                            | Real dashboard, full manual workflow, accessibility/performance evidence         |
| Later         | [#14 T012 organization](https://github.com/ikpemhinoghena/goalbuddy/issues/14), [#15 T013 visuals](https://github.com/ikpemhinoghena/goalbuddy/issues/15) | P2       | P1 then organization              | Tags/filtering, accessible visual summaries                                      |
| Optional      | [#16 T014 drafts](https://github.com/ikpemhinoghena/goalbuddy/issues/16), [#17 T015 acceptance](https://github.com/ikpemhinoghena/goalbuddy/issues/17)    | P3       | Manual MVP and draft dependencies | Consent, safe drafts and atomic user-approved acceptance                         |

The milestone targets one secure vertical slice through goal CRUD, not a promise to finish the entire MVP in one week. Pull #10–#13 into a later iteration or the milestone only after prerequisites pass and capacity is known. Independent work means one implementer can proceed without waiting for inactive teammates; it does not remove authentication or ownership prerequisites. Validation, pure model review, and presentation work can proceed while provider configuration is pending. Integration must wait for valid credentials, isolated test storage and the security decision.

Existing issues were retained rather than duplicated. Backend/frontend delivery slices were added to #4, #6 and #9, with existing acceptance criteria preserved. P1 has 11 issues, P2 two, P3 two. The repository has 15 issues, exceeding the assignment's minimum eight. No additional issue is needed solely for that count.

## Project Board reconciliation

Verified public board: **GoalBuddy Development Board**, project 1, 15 linked repository issues, initially all Todo; In Progress and Done each zero. Repository issue bodies, labels, milestone and assignees were updated and verified. The existing Git credential has repository access but GraphQL rejected Projects access for missing `read:project`; no scope was silently changed. Project mutation requires an authorized connection with `project` access or manual editing by the owner.

Exact outstanding board changes, after access is available:

1. Keep the existing 15 issue items; add none unless a fresh inspection proves an item is missing.
2. Move #3 and #8 to **In Progress** while their remaining acceptance/review work is open. Leave #4–#7 and #9–#17 in **Todo**. Do not move previews to Done.
3. Add or reuse a single-select **Priority** field with P1/P2/P3. Set #3–#13 to P1, #14–#15 to P2, #16–#17 to P3. Repository labels already carry these priorities.
4. Show repository Assignees and Milestone fields. Preserve the verified owner assignment and milestone for #3–#9.
5. Add **In Review** status if absent. Move items there only when a real PR is submitted and all described implementation is reviewable.
6. Order the initial slice #3, #5, #4, #6, #7, #8, #9; show the Week 04 milestone filter as a saved view if useful. Preserve existing views.
7. Re-read the item count, membership, statuses, priorities and milestone after saving. Record actual results; this document is not evidence those custom-field changes succeeded.

## Verification and release sequence

Test pure validation before APIs; test persistence/authorization before exposing saved data; test goal CRUD through reload and sign-in; then add milestones/tasks/progress. Add keyboard, responsive and screen-reader checks alongside each real form. Before deployment, run formatting, lint, strict types, production build, workflow/security tests, and environment/secret checks. Configure a preview deployment only after providers and safe test data are ready. Confirm authentication redirects and owner isolation in that environment. No deployment was made in Week 03.

## Asynchronous Microsoft Teams update

Suggested field order for each factual update: date and author; completed work with evidence; current issue and next action; blocker with the exact assistance needed; review link only when a real PR exists; independent-work statement when relevant.

Prepared update for 2026-11-20: “I continued GoalBuddy independently under the instructor permission I previously reported. Week 03 architecture, four-entity data model, visual foundation and local preview routes are prepared. The existing 15 issues now have priorities and linked dependencies; #3–#9 form the Week 04 secure-goal milestone and are assigned to me. The changes are uncommitted pending my chosen commit message. Next is review of the provider/security decisions, then validation and persistence. Project custom-field edits require Projects access, and an assigned teammate PR is still needed for the separate review requirement. No team meeting or peer approval occurred in this work.”

This message is a draft only; nothing was sent to Microsoft Teams.
