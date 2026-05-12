# TODOs.md — SAA-C03 Practice App Implementation Tasks

> **AI Copilot Directive:** Work tasks in phase order. Do not skip phases. After each task: tick `[x]` here AND append a status line to `PROGRESS.md`. Read the `PLAN.md` section referenced by every phase before starting it. Commit messages: `feat(P{n}-T{m}): <summary>`.
>
> **Hard constraint:** exam date is **2026-05-15**. Phases P0–P3 must be complete by **2026-05-12** to leave the user 2 full days of mock-exam practice. If a phase is at risk of slipping, descope from §6.2 volume targets in PLAN.md, never from the schema/validation rules.

---

## Phase P0 — Scaffolding & Core (PLAN §4, §5, §7, §8)

> Goal: routes, models, service, and an empty Home page render at `/`. No real content yet.

- [x] **P0-T1** — Add `provideHttpClient()` to `src/app/app.config.ts`.
  - **Acceptance:** `HttpClient` is injectable in services without errors at runtime.

- [x] **P0-T2** — Create `src/app/core/quiz.model.ts` with the exact `Answer` and `Question` interfaces from PLAN §5. Use the literal-union `domain` type (no plain `string`).
  - **Acceptance:** `tsc --noEmit` passes.

- [x] **P0-T3** — Create `src/app/core/quiz.service.ts` with `providedIn: 'root'`, using `inject(HttpClient)`. Methods: `loadQuestions(type: string): Observable<Question[]>` (GET `/quiz/${type}.json`), plus signal-based `setQuestions/getQuestions/setUserAnswers/getUserAnswers` (or move state into a separate `QuizStateService` — author's call, document choice in PROGRESS.md).
  - **Acceptance:** Unit test (Vitest) for `loadQuestions('secure')` passes against a mocked HTTP response.

- [x] **P0-T4** — Create `public/quiz/` and seed empty `all.json`, `secure.json`, `resilient.json`, `performance.json`, `cost.json` each containing `[]`.
  - **Acceptance:** `curl http://localhost:4200/quiz/secure.json` returns `[]` while dev server is running.

- [x] **P0-T5** — Create `src/app/pages/home/home.ts` (component file, kebab-case selector `app-home`). Use `OnPush`, signals, no `standalone: true`. Render the four domain cards + an "All Domains" card. Wire each to navigate to `/quiz?type={slug}`. Use Tailwind classes only (no PrimeNG). **Superseded by P0-T10 after visual verification required CLF/PrimeNG parity.**
  - **Acceptance:** AXE clean on `/`. Cards keyboard-navigable.

- [x] **P0-T6** — Create stub components for `QuizComponent`, `ResultComponent`, `ReviewAnswersComponent` (just `<h1>` titles for now). Wire them into `src/app/app.routes.ts` per PLAN §7. Add a `**` redirect to `/`.
  - **Acceptance:** Each route renders its title. Navigating between them does not throw.

- [x] **P0-T7** — Update root `App` component template to render `<router-outlet />` only (drop the default scaffold). Keep the test in `app.spec.ts` passing.
  - **Acceptance:** `npm test` green; `/` shows HomeComponent (not the Angular scaffold splash).

> **Alignment tasks (added 2026-05-10):** P0-T5's hand-rolled Home failed manual UX verification. The four tasks below realign the stack with CLF (PrimeNG/Aura-Noir/PrimeIcons/animations) and rewrite Home 1:1 from `aws-clf-prac-app/src/app/pages/home/home.component.html`. P1 stays blocked until P0-T11 acceptance is green.

- [x] **P0-T8** — Install runtime deps: `npm i primeng @primeng/themes primeicons tailwindcss-primeui chart.js @angular/animations` _(swapped `@primeng/themes` → `@primeuix/themes` because the former is deprecated and PrimeNG 21 expects `@primeuix/themes`)_.
  - **Acceptance:** `npm install` succeeds with no peer-dependency errors against Angular 21.

- [x] **P0-T9** — Wire global config to match CLF:
  - `src/app/app.config.ts`: add `provideAnimationsAsync()` and `providePrimeNG({ theme: { preset: <Noir custom Aura> } })` mirroring `aws-clf-prac-app/src/app/app.config.ts:10-71` (zinc primary palette, light-mode only, `darkModeSelector: 'none'`).
  - `src/styles.css`: add `@import "primeicons/primeicons.css";` and `@plugin "tailwindcss-primeui";` (mirror `aws-clf-prac-app/src/styles.css`).
  - `src/index.html`: title → `AWS SAA-C03 Practice Exam App`; favicon points at `app-icon.png` (copy from CLF `public/`).
  - **Acceptance:** `ng build --configuration development` succeeds; PrimeIcons render; no console errors.

- [x] **P0-T10** — Rewrite `src/app/pages/home/home.ts` to mirror `aws-clf-prac-app/src/app/pages/home/home.component.html` 1:1, with these adaptations:
  - Title: `AWS SAA-C03 Practice Exam`.
  - Byline + 4-icon social row: keep verbatim.
  - Cards (5 instead of CLF's 6): "All Domains Quiz" (full width), then 4 SAA domain cards — "Domain 1: Design Secure Architectures (30%)" → `secure`, "Domain 2: Design Resilient Architectures (26%)" → `resilient`, "Domain 3: Design High-Performing Architectures (24%)" → `performance`, "Domain 4: Design Cost-Optimized Architectures (20%)" → `cost`. Each uses `<p-button label="Start Quiz" (onClick)="startQuiz('<slug>')">` and the same `border rounded-lg p-6 shadow-sm hover:shadow-lg transform hover:scale-105 transition duration-300` styling.
  - Live Session card: **omitted** (PLAN §10 defers Live mode); add a one-line note to the disclaimer that Live mode is post-exam.
  - Disclaimer + Support sections: copy verbatim, swap GitHub link to this repo or remove.
  - `[@fadeIn]` animation trigger (600ms ease-out, opacity 0→1, translateY(20px)→0).
  - Keep project rules: no `standalone: true` declaration (omit), `OnPush`, signals, `inject(Router)`, `@if`/`@for`.
  - **Acceptance:** Side-by-side visual diff against CLF home matches; AXE clean; keyboard-navigable.

- [x] **P0-T11** — Verify alignment end-to-end before P1.
  - `npm test` passes (4/4 specs still green).
  - `ng build --configuration development` succeeds; `ng build` (production) inside 500kB initial-warning / 1MB error budgets.
  - Manual `npm start` walk: `/` matches CLF reference (hero, social row, 5 cards with hover scale, disclaimer, support footer); `/quiz?type=secure`, `/result`, `/review` still render their stubs under the new theme.
  - Run AXE in DevTools on `/`; fix all serious/critical issues.
  - **Acceptance:** all four bullets green → tick `[x]`, flip P0 to **Complete** in PROGRESS.md with P0-T5 marked superseded, mark Blocker as RESOLVED, commit `fix(P0): align UX with CLF reference`.

- [x] **P0-T12** — Resolve `NG0913` oversized-image warning surfaced during user's manual verification of P0-T11. `ahleksu-notion-face.png` was 2400×2400 (570 KB) but rendered ~120×120. Resize source to 240×240 (16 KB; 2× retina) and switch the `<img>` in `home.ts` to `NgOptimizedImage` (`ngSrc` + explicit `width`/`height`) per `.claude/CLAUDE.md`'s static-image rule.
  - **Acceptance:** browser console clean of NG0913 on `/`; `tsc --noEmit`, `npm test`, and `ng build` all still pass within budgets.

---

## Phase P1 — Question Bank (PLAN §5, §6)

> Goal: ≥270 validated questions across the four domain JSONs, plus an aggregated `all.json`. **This is the highest-leverage phase for exam prep — invest here before polishing UI.**

- [x] **P1-T1** — Create `scripts/validate-quiz.mjs` (Node ESM, no deps; or use `node:fs`). Validates each `public/quiz/*.json` per PLAN §5 rules. Exit non-zero on any violation. Print a per-file summary `{file, count, single, multiple, errors}`.
  - **Acceptance:** Running on the empty seed files passes (count 0 ok). Running with a deliberately broken question fails with a clear message.

- [x] **P1-T2** — Create `scripts/build-all-json.mjs` that concatenates the four domain files, re-sequences IDs (1..N), and writes `public/quiz/all.json`. Idempotent.
  - **Acceptance:** `node scripts/build-all-json.mjs` completes; `all.json` length equals sum of domain files; `validate-quiz.mjs` still passes after.

- [x] **P1-T3** — Author Domain 1 (Secure) questions until `secure.json` has ≥80 entries. Follow PLAN §6.3 workflow. **Sourcing priority order from PLAN §6.1 — start with AWS official sample + Skill Builder + AWS docs; only paraphrase from third-party sites, never copy verbatim.** Cite `docs.aws.amazon.com` URLs in `resource`.
  - **Acceptance:** `secure.json` ≥80 questions; `validate-quiz.mjs` passes; spot-check 5 random questions for distractor-explanation quality.

- [x] **P1-T4** — Author Domain 2 (Resilient) questions until `resilient.json` has ≥70 entries. Same workflow.

- [x] **P1-T5** — Author Domain 3 (Performance) questions until `performance.json` has ≥65 entries. Same workflow.

- [x] **P1-T6** — Author Domain 4 (Cost) questions until `cost.json` has ≥55 entries. Same workflow.

- [x] **P1-T7** — Run `scripts/build-all-json.mjs` to regenerate `all.json`. Verify total ≥270.

- [x] **P1-T8** — Add a `NOTICES.md` in repo root listing every external source used (AWS official, Skill Builder, any CC-licensed community repos). Required for §6.1 attribution discipline.

---

## Phase P2 — Quiz Page (PLAN §7, §8)

> Goal: full quiz loop for both `single` and `multiple` types, with state preserved across navigation.

- [x] **P2-T1** — Implement `QuizComponent` per the signal shape in PLAN §8. Read `?type=` from `ActivatedRoute`, call `QuizService.loadQuestions(type)`. When `type === 'all'`, shuffle and slice to 65.
  - **Acceptance:** Visiting `/quiz?type=secure` shows question 1 of N.

- [x] **P2-T2** — Implement single-choice rendering with native radio-style buttons (Tailwind). Implement multi-choice rendering with native checkboxes. Mark from selection using signal-backed sets.
  - **Acceptance:** Toggling answers updates the visual state; keyboard (Tab + Space/Enter) works.

- [x] **P2-T3** — Implement Submit/Check Answer logic (mirror CLF `quiz.component.ts:108-132` but using signals). Show inline explanation per answer with green/red borders. Disable answer toggling once submitted for that question.
  - **Acceptance:** Multi-correct comparison uses sorted-array equality. Single-correct uses string equality.

- [x] **P2-T4** — Implement Next / Back navigation. Persist per-question state in the `answerState` signal map keyed by `Question.id`, restored on navigation.
  - **Acceptance:** Going Back to a previously answered question shows the prior selection and explanation. Going Forward to a never-visited one is blank.

- [x] **P2-T5** — Implement "Finish Test". If unanswered count > 0, show one confirm dialog. On confirm, navigate to `/result` via `Router.navigate(['/result'], { state: {...} })` with the CLF-compatible payload extended for SAA skipped tracking: `{ total, correct, skipped, timestamp, domainSummary, type, questions }`.
  - **Acceptance:** Clicking Finish on a half-answered run prompts; submitting via the dialog routes to `/result`.

- [x] **P2-T6** — Progress indicator driven by the `progress` computed signal.

---

## Phase P3 — Result & Review (PLAN §7, §9)

> Goal: visual feedback after a run, plus a filterable review of every question.

- [x] **P3-T1** — Ensure `chart.js` is installed for direct chart components. Do not use the PrimeNG chart wrapper.
  - **Note:** `chart.js` is installed. PrimeNG UI components were adopted earlier during P0 UX alignment; charts still use Chart.js directly.

- [x] **P3-T2** — Create `src/app/shared/donut-chart.ts` standalone component. `input()` for `{labels, data, colors}`. `effect()` initializes Chart.js instance; cleans up via `DestroyRef.onDestroy()`.

- [x] **P3-T3** — Create `src/app/shared/stacked-bar-chart.ts` analogous to T2.

- [x] **P3-T4** — Implement `ResultComponent`. Read state via `Router.getCurrentNavigation()?.extras.state` in the constructor (it's available before route activation). Compute `score = round(correct/total*100)`. Render donut + bar charts. Buttons: "Review Questions", "Retake Test", "Go to Homepage".
  - **Acceptance:** Refreshing `/result` falls back gracefully (no crash, redirect to `/`).

- [x] **P3-T5** — Implement `ReviewAnswersComponent` with a domain filter (signals). Each question shows the user's selection, correctness, the correct answer(s), and explanations for every option. Mirror CLF's `review-answers.component.ts:31-60` logic but using signals.

- [x] **P3-T6** — Result and Review must color-code with WCAG-AA contrast (don't rely on color alone — use icons or text labels too).

---

## Phase P4 — Polish & Exam Readiness Gate (PLAN §11, §14)

- [x] **P4-T1** — Run AXE in DevTools on `/`, `/quiz?type=secure`, `/result`, `/review`. Fix all serious/critical issues.

- [x] **P4-T2** — Mobile pass: 360px width minimum. Verify Quiz page is usable thumb-friendly.
  - **Note:** User-confirmed mobile pass on 2026-05-10.

- [x] **P4-T3** — `npm run build` succeeds within budgets. If component CSS exceeds 4kB, split or move to global styles.

- [x] **P4-T4** — Take one full mock run (`type=all`, 65 questions). Capture pain points → file follow-up tasks here.
  - **Note:** User-confirmed full mock run on 2026-05-10; no new pain-point task was requested.

- [x] **P4-T5** — Definition of Done checklist (PLAN §14) all ticked. Tag the commit `v1.0-exam-ready`.

- [x] **P4-T6** — Fix SAA answer-position bias. Rebalance `secure`, `resilient`, `performance`, and `cost` JSON so correct answers are distributed across positions; regenerate `all.json`; add runtime answer shuffling and validator guardrails for duplicate answer text, extreme first-answer bias, and all-leading multiple-choice correct sets.
  - **Acceptance:** `node scripts/validate-quiz.mjs` passes; answer-position audit no longer reports `270/270` first-answer correctness; runtime specs prove answers shuffle while domain question order is preserved.

- [x] **P4-T7** — Manager verification before branch publication. Read-only review branch diff for scope, Angular rules, context-file accuracy, and run `node scripts/validate-quiz.mjs`, `npm test -- --watch=false`, `npm run build`, plus answer-position audit.
  - **Acceptance:** Manager approves before feature branch is pushed to `origin`; do not push directly to `origin/main`.

---

## Phase P5 — Out of Scope Until After Exam

> Listed for completeness. Do **not** start any of these before 2026-05-16.

- [ ] P5-T1 — Live/Kahoot mode (study `aws-clf-prac-app/PLAN.md §3–§13`).
- [ ] P5-T2 — Vercel / EC2 deployment.
- [ ] P5-T3 — Question authoring UI.
- [ ] P5-T4 — Spaced-repetition for missed questions.

---

## Phase P6 — Official AWS Samples + Hands-On Prep CLI (PLAN §15)

> Goal: add AWS's official 10-question SAA-C03 sample set to the quiz bank and create a sibling CLI repository for hands-on lab tracking.

- [x] **P6-T1** — Add `scripts/check-official-samples.mjs` plus `npm run check:official-samples`.
  - **Acceptance:** Running the script fails before the official sample questions are present and passes after all 10 are added.

- [x] **P6-T2** — Add the 10 official AWS SAA-C03 sample questions from the AWS PDF into the domain JSON files.
  - **Acceptance:** Domain files validate cleanly; `npm run check:official-samples` reports all 10 official samples present.

- [x] **P6-T3** — Regenerate `public/quiz/all.json` from the four domain files.
  - **Acceptance:** `all.json` contains 280 questions with ids `1..280`, and `node scripts/validate-quiz.mjs` passes.

- [x] **P6-T4** — Update `NOTICES.md`, `PLAN.md`, `PROGRESS.md`, and this file for the official sample addition and sibling repository task.
  - **Acceptance:** Context docs cite the official AWS sample PDF, the 280-question total, and the `aws-saa-prep` CLI scope.

- [x] **P6-T5** — Create `/Users/johnalexrobles/Desktop/ahleksu/aws-saa-prep` as a standalone Python `uv` CLI repository.
  - **Acceptance:** The repo has `pyproject.toml`, README, `src/`, tests, and `.git`; `uv run pytest` and `uv run ruff check .` pass.

- [x] **P6-T6** — Implement CLI commands for hands-on lab management.
  - **Acceptance:** `init`, `new`, `list`, `show`, `status`, and `learn` work against structured lab folders with metadata and README templates.
