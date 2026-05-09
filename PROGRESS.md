# PROGRESS.md — Implementation Status

> **AI Copilot Directive:** Update this file immediately after completing each task. Mark `[x]` in `TODOs.md` AND append a one-line status entry under the matching phase below. Capture blockers in §Blockers and any non-trivial choices in §Decisions Log so the next session can resume cold.

---

## Snapshot

- **Today:** 2026-05-10
- **Exam date:** 2026-05-15 (target: T-5 days)
- **Repo state:** fresh Angular 21 scaffold (commit `2b9c285 initial commit`); no domain code yet.
- **Active phase:** P0 — complete; P1 next.

## Phase Status Overview

| Phase | Name | Status | Tasks Done | Notes |
|---|---|---|---|---|
| P0 | Scaffolding & Core | **Complete** | 7 / 7 | Routes, model, service, stubs landed |
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
- [x] P0-T5: `src/app/pages/home/home.ts` Tailwind card grid, `app-home` selector, OnPush, RouterLink → `/quiz?type=<slug>` for all five cards — 2026-05-10
- [x] P0-T6: Stub `Quiz`/`Result`/`ReviewAnswers` page components plus lazy-loaded routes in `app.routes.ts`; `**` redirects to `/` — 2026-05-10
- [x] P0-T7: Root `App` component reduced to `<router-outlet />`; `app.spec.ts` updated to assert outlet renders. `npm test` → 4/4 pass; `ng build --configuration development` succeeds — 2026-05-10

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

## Blockers
<!-- Format: "YYYY-MM-DD — <blocker> — <what would unblock>" -->

_(none)_

## Open Questions for the User
<!-- Surface these in chat at the next session start, not via docs. -->

- None yet.
