# PLAN.md — AWS SAA-C03 Practice App

> **AI Copilot Directive:** This is the source of truth for the SAA practice app. Read it in full before implementing any phase. After every task: tick the box in `TODOs.md` and append a status line to `PROGRESS.md`. Do not skip phases.

---

## 1. Goal & Constraints

Build a self-paced quiz SPA to help the user (`@ahleksu`) prepare for **AWS Certified Solutions Architect – Associate (SAA-C03)** scheduled **2026-05-15**. Only **5 days** between today (2026-05-10) and exam day, so:

- **Solo Practice Mode** is the only in-scope feature for the exam-prep window. Live/Kahoot mode from the sibling CLF repo is **explicitly deferred** — see §10.
- Prioritize a working question bank, working quiz/review/result loop, and zero-config local dev. Hosting is optional.
- Re-use the proven UX shape from `aws-clf-prac-app` but adapt to this repo's modern stack (Angular 21, Vitest, Tailwind v4, PrimeNG 21/Aura-Noir, Chart.js direct).

## 2. Reference Repository

`/Users/johnalexrobles/Desktop/ahleksu/aws-clf-prac-app` is the working CLF-C02 app. We mirror its solo-mode UX and JSON schema, but **do not** copy its dependency list verbatim — see §4 for the diff.

Key files in the CLF repo to study before each phase:

| Phase | CLF reference files |
|---|---|
| Models / JSON shape | `src/app/core/quiz.model.ts`, `public/quiz/cloud_concepts.json` |
| Quiz logic | `src/app/pages/quiz/quiz.component.ts` |
| Result charts | `src/app/pages/result/result.component.ts` |
| Review filters | `src/app/pages/review-answers/review-answers.component.ts` |
| Routing | `src/app/app.routes.ts` |
| Service | `src/app/core/quiz.service.ts` |

## 3. Exam Domains (from `.context/AWS_SAA_EXAM_GUIDE.md`)

| Code | Domain | Weight | Slug (file/route) |
|---|---|---|---|
| D1 | Design Secure Architectures | 30% | `secure` |
| D2 | Design Resilient Architectures | 26% | `resilient` |
| D3 | Design High-Performing Architectures | 24% | `performance` |
| D4 | Design Cost-Optimized Architectures | 20% | `cost` |

`domain` field in each question MUST be one of: `Design Secure Architectures`, `Design Resilient Architectures`, `Design High-Performing Architectures`, `Design Cost-Optimized Architectures`. No other strings are allowed.

## 4. Stack Decisions (diff from CLF repo)

| Concern | CLF repo (Angular 19) | SAA repo (Angular 21) — what to use |
|---|---|---|
| Angular | 19 | **21.2** (already in `package.json`) |
| Components | `standalone: true` declared | **Omit `standalone: true`** (default in v20+) — project rule |
| Change detection | mostly default | **`ChangeDetectionStrategy.OnPush` everywhere** — project rule |
| State | mixed fields/services | **Signals (`signal`, `computed`)** for component state |
| Inputs/outputs | decorators | **`input()` / `output()` functions** |
| DI | constructor injection | **`inject()`** function |
| Control flow | `*ngIf`, `*ngFor` | **`@if`, `@for`, `@switch`** |
| UI library | PrimeNG 19 + PrimeIcons | **PrimeNG 21 + PrimeIcons + `tailwindcss-primeui` plugin (Aura/Noir preset, light-mode only)** — mirror CLF stack so templates port verbatim. _(Reversed 2026-05-10 after Home page diverged; see Decisions Log.)_ |
| Charts | `primeng/chart` (wraps Chart.js) | **`chart.js` directly** in a thin signal-driven component (skip the `primeng/chart` wrapper, but reuse CLF's exact Chart.js `data` + `options` configs from `result.component.ts`). |
| Animations | `@angular/animations` | **`provideAnimationsAsync()`** required by PrimeNG. Reuse CLF's `[@fadeIn]` trigger on Home/Quiz mount. |
| Tests | Karma + Jasmine | **Vitest** (already configured by `@angular/build:unit-test`) |
| HTTP client | `provideHttpClient()` (manual add) | Add `provideHttpClient()` to `app.config.ts` |
| Backend | Node.js + Socket.io on EC2 | **None.** Solo mode reads JSON from `public/quiz/`. |

> **Mirror rule (added 2026-05-10):** If a CLF screen uses a PrimeNG component, the SAA equivalent uses the same component with the same props/severity/icons unless SAA scope explicitly differs (e.g., Live Session card, deferred per §10). Don't reinvent primitives.

## 5. Question Schema

Mirror `aws-clf-prac-app/src/app/core/quiz.model.ts` exactly so the same `quiz.service.ts` logic ports cleanly:

```ts
export interface Answer {
  text: string;
  status: 'correct' | 'skipped';   // 'skipped' = distractor; 'correct' = right answer
  explanation: string;             // shown after submit; non-empty for both correct and distractor
}

export interface Question {
  id: number;                       // unique within the file; integer; gaps are fine
  question: string;                 // scenario stem; can contain newlines
  domain:
    | 'Design Secure Architectures'
    | 'Design Resilient Architectures'
    | 'Design High-Performing Architectures'
    | 'Design Cost-Optimized Architectures';
  resource?: string;                // canonical AWS docs URL backing the correct answer
  type: 'single' | 'multiple';      // 'multiple' implies ≥2 correct answers; show "(Choose TWO/THREE)"
  answers: Answer[];                // 4 entries for single, 5+ for multiple
}
```

### Validation rules (apply in P1 build script)

- `single` → exactly **one** answer with `status: 'correct'`.
- `multiple` → **two or more** answers with `status: 'correct'`; stem must say `(Choose TWO)` / `(Choose THREE)`.
- Every distractor needs a real `explanation` of why it is wrong (the CLF bank's distinguishing strength — preserve this).
- `resource` URL points to `docs.aws.amazon.com`, `aws.amazon.com/blogs/...`, or an AWS whitepaper. Third-party blogs are not acceptable as the canonical source.
- `id` is unique per file. `all.json` is the union of the four domain files (regenerate via script — see TODOs P1-T7).
- Answer order is defense in depth: authored JSON banks keep correct answers balanced across positions, and quiz runtime shuffles answer choices per run before display/result/review state. Source order must never teach the user an answer-position pattern.

## 6. Question Bank Strategy

The user asked to "scrape and search comprehensively online for all sample questions" and copy them into the bank. **Read this section before scraping.**

### 6.1 Sourcing tiers (preferred → least preferred)

1. **AWS official sample questions** (10 free questions in the SAA-C03 official sample PDF on the AWS certification page). Reproduce verbatim with attribution in `resource`.
2. **AWS Skill Builder free Exam Prep Official Practice Question Set** (20 questions, free tier, AWS-authored). Cite the Skill Builder URL.
3. **AWS whitepapers + Well-Architected lenses + service FAQs** — author original scenario questions grounded in these docs. Use the doc URL as `resource`.
4. **Open-source community banks** (CC-licensed GitHub repos, e.g., aws-certification practice question collections). Only ingest when the LICENSE permits; preserve attribution in a NOTICES file.
5. **Third-party paid practice exams** (Tutorials Dojo, Whizlabs, Stephane Maarek, ExamTopics). **Do NOT copy verbatim** — paraphrase the underlying scenario, replace named entities, and re-derive distractors from the AWS doc. Cite the AWS doc as `resource`, not the third-party site.

### 6.2 Volume targets

| Domain | Target Q's | Rationale |
|---|---|---|
| Design Secure Architectures | ≥80 | Highest weight (30%) |
| Design Resilient Architectures | ≥70 | 26% |
| Design High-Performing Architectures | ≥65 | 24% |
| Design Cost-Optimized Architectures | ≥55 | 20% |
| **Total** | **≥270** | CLF bank had 390 across 4 domains — match the density |

### 6.3 Authoring workflow (per question)

1. Pick a task statement from §4 of the exam guide (`.context/AWS_SAA_EXAM_GUIDE.md`).
2. Identify the AWS service combination tested (e.g., S3 + KMS + bucket policy).
3. Write a 2–4 sentence business scenario (company, workload, constraint).
4. Provide 4 answers (or 5+ for `multiple`); make distractors plausible (CLF style — distractors test a real misconception).
5. Write a short explanation for each distractor stating the specific flaw, plus the canonical-doc URL.
6. Append to the matching domain JSON; bump `id`.

## 7. Routes & Pages

```
/                  HomeComponent          domain selector + start CTA
/quiz?type={slug}  QuizComponent          one question at a time, single/multi, skip-aware
/result            ResultComponent        donut (correct/incorrect/skipped) + stacked bar by domain
/review            ReviewAnswersComponent filterable answer review
**                 redirect → /
```

`type` query param values: `all`, `secure`, `resilient`, `performance`, `cost`.

When `type=all`, shuffle and slice to **65 questions** (the SAA scored question count). For domain-specific runs, deliver all questions in that file.

## 8. Component Architecture

All new components MUST follow the project rules in `.claude/CLAUDE.md`:

- `ChangeDetectionStrategy.OnPush` in every `@Component` decorator.
- No `standalone: true` (default in v20+).
- Use signals for component state; `computed()` for derived values.
- Use `input()` / `output()` functions, not decorators.
- Use `inject()` for DI.
- Use `@if` / `@for` / `@switch` — never `*ngIf` / `*ngFor` / `ngClass` / `ngStyle`.
- Host bindings go inside the `host` object.

### Suggested signal-based `QuizComponent` shape (replaces the CLF class-fields version)

```ts
readonly questions = signal<Question[]>([]);
readonly currentIndex = signal(0);
readonly answerState = signal<Record<number, AnswerEntry>>({});
readonly currentQuestion = computed(() => this.questions()[this.currentIndex()]);
readonly progress = computed(() =>
  this.questions().length === 0 ? 0
  : ((this.currentIndex() + 1) / this.questions().length) * 100,
);
readonly isAnswered = computed(() => !!this.answerState()[this.currentQuestion()?.id]);
```

State flows through `update()` / `set()` only — never `mutate()`.

## 9. Charts (chart.js directly, no `primeng/chart`)

Add `chart.js` directly (the rest of the UI is PrimeNG, but for charts we skip the `primeng/chart` wrapper). Build one `<app-donut-chart>` and one `<app-stacked-bar-chart>` standalone component, each with `input()` for data and an `effect()` that re-creates the chart instance when inputs change. Destroy the chart on `DestroyRef`.

**Reuse the CLF Chart.js config exactly** — colors `#16a34a` (correct) / `#ef4444` (incorrect) / `#9CA3AF` (skipped); donut `cutout: '60%'`, `legend.position: 'bottom'`; stacked bar `scales.x.stacked = scales.y.stacked = true`, `legend.position: 'top'`. The CLF wrapper passes the same shape via `[data]` / `[options]`.

## 10. Out of Scope (for now)

- Live/Kahoot multiplayer mode (`/host`, `/join`, leaderboard, instructor answer-key) — defer until **after the exam**. The CLF repo's Phase 1–10 backend work would consume the entire remaining 5-day budget.
- AWS deployment (EC2, Vercel, S3+CloudFront). Local `ng serve` is sufficient before exam day.
- Auth, persistence, accounts, analytics.
- Internationalization. UI is English-only.

If the user requests Live mode after the exam, restart with the CLF repo's `PLAN.md §3–§13` as the template.

## 11. Accessibility & Performance Budgets

- Must pass AXE checks; meet WCAG AA on color contrast, focus management, ARIA.
- Initial bundle warning at 500kB / error at 1MB (already configured in `angular.json`).
- Component-style warning at 4kB / error at 8kB.
- Quiz JSON files are loaded via `HttpClient`; do **not** import them as static modules (would balloon bundle size).

## 12. Testing Strategy

- Unit tests via Vitest only — no Karma. Cover:
  - `QuizService.loadQuestions(type)` returns parsed `Question[]`.
  - Answer-correctness logic for `single` and `multiple` (sorted-array comparison).
  - Domain summary aggregation in result navigation.
- A `scripts/validate-quiz.mjs` script must pass on every commit: schema check + `single`/`multiple` invariants + unique IDs + unique answer text per question + `domain` whitelist + `resource` URL host whitelist + answer-position guardrails.

## 13. Dev Loop

```bash
npm install
npm start                    # ng serve → http://localhost:4200
npm test                     # vitest; add -- --watch=false for a one-shot run
npm run build                # production build to dist/
node scripts/validate-quiz.mjs   # validate quiz JSON schema and invariants
node scripts/build-all-json.mjs  # regenerate public/quiz/all.json
```

## 14. Definition of Done (exam-readiness gate)

The app is "exam-ready" when, in order:

1. ✅ All 4 domain JSONs exist and pass `validate-quiz.mjs` with totals from §6.2.
2. ✅ `public/quiz/all.json` regenerated and matches the union of the 4 files.
3. ✅ Home → Quiz → Result → Review loop works end-to-end for `type=all` and each domain slug.
4. ✅ AXE shows zero serious/critical issues on every route.
5. ✅ `ng build` (production) passes within budgets.
6. ✅ User has run a full mock exam (`type=all`, 65 questions) and reviewed every wrong answer.
