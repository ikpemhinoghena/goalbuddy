# GoalBuddy design system

Week 03 design established independently on 2026-11-20. No pre-existing product palette or logo was found; the starter used generic Next.js branding. This proposal is implemented in the local foundation and is not a claim of team approval.

| Token             | Value     | Use                                             |
| ----------------- | --------- | ----------------------------------------------- |
| Primary / success | `#16624f` | Main actions, focus, success text               |
| Primary dark      | `#104b3d` | Hover and strong green text                     |
| Secondary         | `#29465b` | Reserved supporting headings/visuals            |
| Accent            | `#b8e976` | Selection and future highlights; dark text only |
| Accent soft       | `#eef8e2` | Preview information background                  |
| Background        | `#fafcfb` | Page surface                                    |
| Surface           | `#edf3f0` | Supporting cards and skeletons                  |
| Foreground        | `#182c25` | Body/headings                                   |
| Muted             | `#52655d` | Supporting readable text                        |
| Border            | `#cbd8d1` | Decorative separators/cards                     |
| Warning           | `#88530b` | Warning text with explicit label                |
| Error             | `#b42318` | Errors with textual explanation                 |

Use the system stack Segoe UI, Arial, Helvetica, sans-serif. The scaffold's Google font download failed during the baseline build; the system stack removes that dependency without adding assets or packages. Body text is 16px, supporting/navigation text 14px, section titles 24–36px, and responsive hero text 48–60px. Use semibold headings and comfortable line heights. The simple `g.` mark is text, not a claimed trademark asset.

Use Tailwind's 4px spacing scale: 8/12px control gaps, 16/24px groups, 32/48/64px section spacing. Main content is `max-w-6xl` (72rem), with 20px horizontal padding, increasing to 32px at `sm`. Keep readable prose within approximately 32–36rem. Default breakpoints remain `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px. Navigation wraps on narrow screens; the hero splits at `lg`; cards stack until space permits.

Cards use white or surface backgrounds, a subtle border, 16–24px radius, 24–40px padding, and minimal shadow. Primary buttons/links use white on primary, 12px vertical padding and 12px radius. Secondary actions use primary text, border and a surface hover. Never create a save/login button without its real behavior. Visible focus uses a 3px primary outline with 4px offset; all navigation is keyboard reachable, with a skip link and one main landmark.

Forms: persistent visible labels above controls; 16px input text; at least 44px control height; muted-color input borders with sufficient contrast; required indicators in text; helper/error IDs connected through `aria-describedby`; `aria-invalid` on invalid fields; submit summary and retained values on failure. Destructive dialogs must name affected records, offer cancel, trap focus, and restore focus. Week 04 implements these conventions in `FormField`, `FormMessage`, `GoalForm`, `ProfileForm`, and the native modal `DeleteGoalDialog`; shared button and field classes live in `components/ui/styles.ts`, with a `danger` button using the error token.

Loading uses a polite status and decorative skeletons hidden from assistive technology; pulse animation respects reduced-motion settings. Empty states explain context and offer an existing destination. Error UI gives safe retry feedback. Progress will expose counts and percentages as text alongside native progress semantics. Never depend on color alone.

The `/dashboard` and `/goals` pages explicitly identify themselves as empty design previews. They use no fixture users, simulated saved goals, or production statistics. Detailed visual/browser verification belongs in the Week 03 evidence report; design conventions alone do not prove WCAG conformance.
