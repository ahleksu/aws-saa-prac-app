# PROGRESS.md — Implementation Status

> **AI Copilot Directive:** Update this file immediately after completing each task. Mark `[x]` in `TODOs.md` AND append a one-line status entry under the matching phase below. Capture blockers in §Blockers and any non-trivial choices in §Decisions Log so the next session can resume cold.

---

## Snapshot

- **Today:** 2026-05-10
- **Exam date:** 2026-05-15 (target: T-5 days)
- **Repo state:** fresh Angular 21 scaffold (commit `2b9c285 initial commit`); no domain code yet.
- **Active phase:** P0 — alignment complete pending user's manual visual diff + AXE pass; P1 unblocked once that lands.

## Phase Status Overview

| Phase | Name | Status | Tasks Done | Notes |
|---|---|---|---|---|
| P0 | Scaffolding & Core | **CLI-Verified (manual visual pending)** | 11 / 11 | P0-T5 superseded by P0-T10; deps + Aura/Noir + Home rewrite landed |
| P1 | Question Bank | **Not Started** | 0 / 8 | Highest leverage for exam prep |
| P2 | Quiz Page | **Not Started** | 0 / 6 | Depends on P0 + P1-T3 minimum |
| P3 | Result & Review | **Not Started** | 0 / 6 | Depends on P2 |
| P4 | Polish & Readiness Gate | **Not Started** | 0 / 5 | Final exam-ready bar |
| P5 | Post-exam (Live mode etc.) | **Deferred** | 0 / 4 | Do not start before 2026-05-16 |

---

## Phase P0 — Scaffolding & Core
<!-- Append a line per task as it's completed: "- [x] P0-T1: <one-line outcome> — YYYY-MM-DD" -->

- [x] P0-T1: `provideHttpClient()` registered in `app.config.ts`; tsc --noEmit clean — 2026-05-10
- [x] P0-T2: `src/app/core/quiz.model.ts` with literal-union `domain`, `Answer`, `Question`, plus shared `AnswerEntry`, `DomainSummary`, `QuizResultState` types for downstream phases — 2026-05-10
- [x] P0-T3: `QuizService` (providedIn root, inject(HttpClient)) — exposes `loadQuestions`, signal-backed `setQuestions/getQuestions/setUserAnswers/getUserAnswers`, plus `reset()`. Vitest covers `loadQuestions('secure')` against `HttpTestingController` and signal round-trip — 2026-05-10
- [x] P0-T4: `public/quiz/{all,secure,resilient,performance,cost}.json` seeded with `[]` — 2026-05-10
- [x] P0-T5: Hand-rolled Tailwind card grid landed but **failed manual UX verification** — superseded by P0-T10 (mirror CLF `home.component.html`). — 2026-05-10
- [x] P0-T6: Stub `Quiz`/`Result`/`ReviewAnswers` page components plus lazy-loaded routes in `app.routes.ts`; `**` redirects to `/` — 2026-05-10
- [x] P0-T7: Root `App` component reduced to `<router-outlet />`; `app.spec.ts` updated to assert outlet renders. `npm test` → 4/4 pass; `ng build --configuration development` succeeds — 2026-05-10
- [x] P0-T8: `npm i primeng @primeuix/themes primeicons tailwindcss-primeui chart.js @angular/animations` — clean install, no peer-dep errors against Angular 21. `@primeng/themes` deprecated in favor of `@primeuix/themes` for PrimeNG 21+; swapped accordingly. — 2026-05-10
- [x] P0-T9: `app.config.ts` adds `provideAnimationsAsync()` + `providePrimeNG({ theme: { preset: Noir } })` mirroring CLF Aura/Noir zinc palette. `styles.css` adds `primeicons.css` import + `tailwindcss-primeui` plugin. `index.html` title → `AWS SAA-C03 Practice Exam App`; favicon → `app-icon.png`. Copied `app-icon.png` and `ahleksu-notion-face.png` from CLF `public/`. — 2026-05-10
- [x] P0-T10: Rewrote `home.ts` to mirror CLF `home.component.html` 1:1 — hero (title + byline + 4 social PrimeIcons), 5-card grid (All Domains + 4 SAA domains, Live Session card omitted per PLAN §10), disclaimer block, support footer. Uses `<p-button>`, `[@fadeIn]` 600ms ease-out, OnPush, `inject(Router)`. — 2026-05-10
- [x] P0-T11: `tsc --noEmit` clean; `npm test` → 4/4 pass; `ng build` (production) initial bundle 417 kB raw / 95 kB transfer, well inside 500 kB-warn / 1 MB-error budgets; `ng serve` boots cleanly, `/` returns 200, `/quiz/secure.json` serves `[]`. **Manual visual diff vs CLF + AXE on `/` still owed by user** — flagged below. — 2026-05-10

### P0 Alignment Decisions
- Used `@primeuix/themes` (PrimeNG 21's current theme package) instead of CLF's `@primeng/themes@^19` — npm flagged the latter as deprecated on install. The Aura/Noir preset (zinc palette, light-mode only, `darkModeSelector: 'none'`) is identical to CLF; only the import path moves from `@primeng/themes/aura` → `@primeuix/themes/aura`.
- Live Session card omitted from Home (deferred to P5 per PLAN §10); replaced with a one-line note in the disclaimer ("Live multiplayer mode is deferred to a post-exam release") so the visual omission is explicit.

### P0 Decisions
- Kept quiz state in `QuizService` (not a separate `QuizStateService`) since the surface is small and PLAN §8 keeps state per-component via signals; the service just persists handoff to `/result` and `/review`. Revisit in P2 if cross-component coupling appears.
- Routes are lazy-loaded via `loadComponent` per PLAN §4 / repo lazy-loading convention, even for stubs, so P2/P3 swaps don't change routing shape.

## Phase P1 — Question Bank

**Volume tracker** (target from PLAN §6.2):

| Domain | File | Authored | Target | % |
|---|---|---|---|---|
| Secure | `secure.json` | 0 | 80 | 0% |
| Resilient | `resilient.json` | 0 | 70 | 0% |
| Performance | `performance.json` | 0 | 65 | 0% |
| Cost | `cost.json` | 0 | 55 | 0% |
| **All** | `all.json` | 0 | 270 | 0% |

<!-- Update the table after every authoring batch (recommended cadence: every 10 questions). -->

## Phase P2 — Quiz Page

## Phase P3 — Result & Review

## Phase P4 — Polish & Exam Readiness Gate

---

## Decisions Log
<!-- Format: "YYYY-MM-DD — <decision> — <reason>" -->

- 2026-05-10 — Defer Live/Kahoot mode until after exam — only 5 days to exam, solo mode is sufficient for prep. (PLAN §10)
- 2026-05-10 — Drop PrimeNG, use Tailwind v4 + plain HTML; charts via `chart.js` directly — keeps bundle small and aligns with this repo's existing stack. (PLAN §4)
- 2026-05-10 — Mirror CLF question schema verbatim so `quiz.service.ts` logic ports without translation — but rebuild components on signals + OnPush per project rules. (PLAN §5, §8)
- 2026-05-10 — **Reverse "no PrimeNG" decision**; adopt PrimeNG 21 (Aura/Noir preset, light-mode only) + PrimeIcons + `tailwindcss-primeui` + `@angular/animations`. Required to port CLF templates 1:1 inside the 5-day budget; bundle cost (~150-200kB gz) is well within the 500kB-warn / 1MB-error budget configured in `angular.json`. _(Supersedes the earlier "Drop PrimeNG" decision dated 2026-05-10.)_ (PLAN §4)

## Blockers
<!-- Format: "YYYY-MM-DD — <blocker> — <what would unblock>" -->

- 2026-05-10 — Home page diverged from CLF reference UX (hand-rolled Tailwind grid; no PrimeNG/Aura-Noir theme; missing social-icon row, fadeIn animation, disclaimer block, support footer). Manual visual verification by user **failed P0-T5 acceptance** even though `tsc`, `npm test`, and `ng build` all passed. Unblock: adopt PrimeNG (decided), then re-author Home + global config to mirror CLF (P0-T8…T11). — **RESOLVED 2026-05-10 (CLI checks).** User must still confirm side-by-side visual diff and AXE-clean `/` to flip P0 to fully Complete.

## Open Questions for the User
<!-- Surface these in chat at the next session start, not via docs. -->

- 2026-05-10 — Run `npm start`, open `/` in a browser, and visually diff against the CLF home (`/Users/johnalexrobles/Desktop/ahleksu/aws-clf-prac-app` running locally). Confirm the layout, copy, hover-scale, social row, disclaimer, and support footer all match — then run AXE in DevTools and report any serious/critical issues. P1 stays soft-blocked on this verification.
