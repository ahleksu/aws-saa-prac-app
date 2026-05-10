# PROGRESS.md — Implementation Status

> **AI Copilot Directive:** Update this file immediately after completing each task. Mark `[x]` in `TODOs.md` AND append a one-line status entry under the matching phase below. Capture blockers in §Blockers and any non-trivial choices in §Decisions Log so the next session can resume cold.

---

## Snapshot

- **Today:** 2026-05-10
- **Exam date:** 2026-05-15 (target: T-5 days)
- **Repo state:** P0 complete plus P1 question bank complete; P2 quiz page complete; latest commits tracked in git log.
- **Active phase:** P3 — Result & Review. P0, P1, and P2 complete as of 2026-05-10.

## Phase Status Overview

| Phase | Name | Status | Tasks Done | Notes |
|---|---|---|---|---|
| P0 | Scaffolding & Core | **Complete** | 12 / 12 | P0-T5 superseded by P0-T10; visual diff confirmed by user 2026-05-10; NG0913 fixed via P0-T12 |
| P1 | Question Bank | **Complete** | 8 / 8 | 270 validated questions across all four domains; `all.json` regenerated |
| P2 | Quiz Page | **Complete** | 6 / 6 | Full CLF-style quiz loop implemented with Angular signals |
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
- [x] P0-T12: User-confirmed visual diff of `/` against CLF home matches; AXE clean (no serious/critical). One Angular dev-mode `NG0913` warning surfaced for `ahleksu-notion-face.png` (2400×2400 source rendered at ~120×120). Fix: resized PNG in place to 240×240 (570 KB → 16 KB, 35× reduction) via `sips -z 240 240`; switched `<img>` in `home.ts` to `NgOptimizedImage` (`ngSrc` + `width="120" height="120"`). `tsc --noEmit` clean; `npm test` → 4/4 pass; `ng build` 422 kB / 97 kB transfer (within budgets). — 2026-05-10

### P0 Alignment Decisions
- Used `@primeuix/themes` (PrimeNG 21's current theme package) instead of CLF's `@primeng/themes@^19` — npm flagged the latter as deprecated on install. The Aura/Noir preset (zinc palette, light-mode only, `darkModeSelector: 'none'`) is identical to CLF; only the import path moves from `@primeng/themes/aura` → `@primeuix/themes/aura`.
- Live Session card omitted from Home (deferred to P5 per PLAN §10); replaced with a one-line note in the disclaimer ("Live multiplayer mode is deferred to a post-exam release") so the visual omission is explicit.

### P0 Decisions
- Kept quiz state in `QuizService` (not a separate `QuizStateService`) since the surface is small and PLAN §8 keeps state per-component via signals; the service just persists handoff to `/result` and `/review`. Revisit in P2 if cross-component coupling appears.
- Routes are lazy-loaded via `loadComponent` per PLAN §4 / repo lazy-loading convention, even for stubs, so P2/P3 swaps don't change routing shape.

## Phase P1 — Question Bank

- [x] P1-T1: `scripts/validate-quiz.mjs` (Node ESM, no deps). Validates schema + single/multiple invariants (single = exactly 4 answers / 1 correct; multiple = ≥5 answers, ≥2 correct, stem must include `(Choose TWO)`/`(Choose THREE)` and correct count must match) + unique IDs per file + domain whitelist (4 SAA literals) + resource URL host whitelist (`docs.aws.amazon.com`, `aws.amazon.com`, `wa.aws.amazon.com`, https only). Accepts optional file/dir args (default scans `public/quiz/`). Positive run on empty seeds → 5/5 OK exit 0; negative run on `/tmp` fixture with 9 deliberate violations → exits 1 with all 9 errors anchored to `q[i] (id=N) ...`. — 2026-05-10
- [x] P1-T2: `scripts/build-all-json.mjs` (Node ESM, no deps). Reads the 4 domain files in stable order (secure → resilient → performance → cost, matching §3 weights so `git diff all.json` is minimal), concatenates, re-sequences IDs `1..N`, writes `public/quiz/all.json` with 2-space indent + trailing newline. Two consecutive runs produce identical SHA (`cd0d4cc…` for the empty case) — idempotent; `git diff all.json` is empty after. Validator still passes (5/5 OK exit 0). — 2026-05-10
- [x] P1-T3: Authored `secure.json` to 80 questions (60 single, 20 multiple), covering IAM, Organizations/SCPs, federation, VPC controls, WAF/Shield, GuardDuty/Macie, Secrets Manager, KMS, S3 data protection, backups, replication, and TLS. `node scripts/validate-quiz.mjs public/quiz/secure.json` clean; spot check found original scenario stems, AWS docs resources, and no exact duplicate stems. — 2026-05-10
- [x] P1-T4: Authored `resilient.json` to 70 questions (52 single, 18 multiple), covering SQS/SNS/EventBridge, Step Functions, Lambda/ECS, ELB/Auto Scaling, Route 53 failover, RDS/Aurora HA, DynamoDB global tables/PITR, S3 replication, AWS Backup, DR patterns, and X-Ray. Validator clean; no exact duplicate stems. — 2026-05-10
- [x] P1-T5: Authored `performance.json` to 65 questions (49 single, 16 multiple), covering S3/EBS/EFS/FSx performance, placement groups, scaling policies, Lambda tuning, RDS/Aurora/read replicas, DynamoDB/DAX, ElastiCache, CloudFront/Global Accelerator, Direct Connect, Kinesis, Firehose, Glue, Athena, EMR, and DataSync. Validator clean; no exact duplicate stems. — 2026-05-10
- [x] P1-T6: Authored `cost.json` to 55 questions (42 single, 13 multiple), covering S3 lifecycle/storage classes, EBS/EFS right-sizing, Spot/Savings Plans/RI, Compute Optimizer, Lambda/Fargate, DynamoDB/RDS/Aurora cost controls, NAT gateway placement, VPC endpoints, CloudFront, Direct Connect/VPN, Transit Gateway, and peering. Validator clean; no exact duplicate stems. — 2026-05-10
- [x] P1-T7: Regenerated `public/quiz/all.json` via `node scripts/build-all-json.mjs`; output contains 270 questions resequenced `1..270` in stable domain order. Full validator clean: `all.json` count=270, single=203, multiple=67, errors=0. — 2026-05-10
- [x] P1-T8: Added `NOTICES.md` documenting AWS official sources, Skill Builder official practice set URL, public topic-seed samplers, reviewed GitHub repositories, and the no-verbatim-copy rule for third-party practice content. — 2026-05-10

**Volume tracker** (target from PLAN §6.2):

| Domain | File | Authored | Target | % |
|---|---|---|---|---|
| Secure | `secure.json` | 80 | 80 | 100% |
| Resilient | `resilient.json` | 70 | 70 | 100% |
| Performance | `performance.json` | 65 | 65 | 100% |
| Cost | `cost.json` | 55 | 55 | 100% |
| **All** | `all.json` | 270 | 270 | 100% |

<!-- Update the table after every authoring batch (recommended cadence: every 10 questions). -->

## Phase P2 — Quiz Page

- [x] P2-T1: `Quiz` reads `?type=` via `ActivatedRoute`, normalizes unsupported values to `all`, calls `QuizService.loadQuestions(type)`, shuffles and slices `all` runs to 65 questions, persists loaded questions through `QuizService.setQuestions`, and renders "Question 1 of N" with the first stem. Added focused Vitest coverage for domain, all-domain, and unsupported type loading. `npm test -- --watch=false`, `npm run build`, and `node scripts/validate-quiz.mjs` pass. — 2026-05-10
- [x] P2-T2: Added single-choice radio and multiple-choice checkbox rendering backed by `selectedAnswers` signal state, with visible selected-card borders and keyboard-friendly native inputs. — 2026-05-10
- [x] P2-T3: Added Check Answer logic using `isSelectionCorrect`; submitted questions show all explanations, correct answers in green, selected wrong answers in red, and correctness feedback with domain/resource details. — 2026-05-10
- [x] P2-T4: Added Back/Next navigation and per-question restore from `answerState`, preserving submitted selections, correctness, and explanations when moving between questions. — 2026-05-10
- [x] P2-T5: Added Finish Test flow with exactly one confirmation dialog for unanswered runs; finalization builds typed `QuizResultNavigationState`, calls `QuizService.setQuestions/setUserAnswers`, and navigates to `/result`. — 2026-05-10
- [x] P2-T6: Added PrimeNG progress bar driven by the `progress` computed signal plus top-level Finish Test action. — 2026-05-10

## Phase P3 — Result & Review

## Phase P4 — Polish & Exam Readiness Gate

---

## Decisions Log
<!-- Format: "YYYY-MM-DD — <decision> — <reason>" -->

- 2026-05-10 — Defer Live/Kahoot mode until after exam — only 5 days to exam, solo mode is sufficient for prep. (PLAN §10)
- 2026-05-10 — Drop PrimeNG, use Tailwind v4 + plain HTML; charts via `chart.js` directly — keeps bundle small and aligns with this repo's existing stack. (PLAN §4)
- 2026-05-10 — Mirror CLF question schema verbatim so `quiz.service.ts` logic ports without translation — but rebuild components on signals + OnPush per project rules. (PLAN §5, §8)
- 2026-05-10 — **Reverse "no PrimeNG" decision**; adopt PrimeNG 21 (Aura/Noir preset, light-mode only) + PrimeIcons + `tailwindcss-primeui` + `@angular/animations`. Required to port CLF templates 1:1 inside the 5-day budget; bundle cost (~150-200kB gz) is well within the 500kB-warn / 1MB-error budget configured in `angular.json`. _(Supersedes the earlier "Drop PrimeNG" decision dated 2026-05-10.)_ (PLAN §4)
- 2026-05-10 — Disable Angular CLI persistent cache in `angular.json` — plain `npm run build` repeatedly aborted with `SIGABRT` in the native LMDB cache path under Node 24/macOS; `CI=true npm run build` passed, proving the app build was clean. Disabling the cache makes normal local builds reliable with only a rebuild-speed tradeoff.

## Blockers
<!-- Format: "YYYY-MM-DD — <blocker> — <what would unblock>" -->

- 2026-05-10 — Home page diverged from CLF reference UX (hand-rolled Tailwind grid; no PrimeNG/Aura-Noir theme; missing social-icon row, fadeIn animation, disclaimer block, support footer). Manual visual verification by user **failed P0-T5 acceptance** even though `tsc`, `npm test`, and `ng build` all passed. Unblock: adopt PrimeNG (decided), then re-author Home + global config to mirror CLF (P0-T8…T11). — **RESOLVED 2026-05-10 (CLI checks).** User must still confirm side-by-side visual diff and AXE-clean `/` to flip P0 to fully Complete.

## Open Questions for the User
<!-- Surface these in chat at the next session start, not via docs. -->

- None.
