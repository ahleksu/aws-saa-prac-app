# SAA CLF Solo Flow Mirror Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the SAA-C03 solo quiz flow so it mirrors the working CLF-C02 app's Home -> Quiz -> Result -> Review experience while obeying this repo's Angular 21 rules.

**Architecture:** Keep the CLF user-facing flow and navigation-state payload names, but translate the implementation to signal-driven Angular 21 components with `ChangeDetectionStrategy.OnPush`, `inject()`, native control flow, and typed helper functions. Keep data loading through `QuizService` and JSON assets; do not import quiz JSON into the bundle.

**Tech Stack:** Angular 21, TypeScript strict mode, signals, PrimeNG 21 controls, Tailwind v4, Chart.js direct canvas components, Vitest via `@angular/build:unit-test`.

---

## Source Review

Reference repo: `/Users/johnalexrobles/Desktop/ahleksu/aws-clf-prac-app`

Use these CLF files as the behavioral reference:

- `src/app/pages/home/home.component.html`: first-screen layout, social row, card grid, disclaimer, support footer. The SAA Home is already mirrored with SAA domain names and live mode omitted.
- `src/app/pages/quiz/quiz.component.ts`: route-based load at lines 63-75, progress at lines 83-87, selection at lines 89-106, correctness at lines 108-132, navigation restore at lines 134-160, finish/finalize payload at lines 163-217.
- `src/app/pages/quiz/quiz.component.html`: progress + Finish Test at lines 1-23, question count/stem at lines 25-31, single/multiple answer cards at lines 33-101, feedback and resource block at lines 103-135, navigation buttons at lines 137-173, confirm dialog at lines 176-223.
- `src/app/pages/result/result.component.ts`: result state parsing at lines 31-54, doughnut config at lines 60-82, stacked bar config at lines 85-138, navigation actions at lines 139-154.
- `src/app/pages/result/result.component.html`: score summary at lines 1-25, all-domain stacked chart at lines 27-40, Review/Retake/Home buttons at lines 42-64.
- `src/app/pages/review-answers/review-answers.component.ts`: review state normalization at lines 49-74, domain filter at lines 77-83, incorrect answer detection at lines 85-87, collapse all at lines 89-91, back-to-result payload at lines 93-124, retake/home at lines 129-135.
- `src/app/pages/review-answers/review-answers.component.html`: filter/chips at lines 10-28, collapse control at lines 30-38, review cards at lines 40-104, footer actions at lines 106-122.

Do not copy these CLF implementation defects:

- `standalone: true`, constructor injection, class-field mutable state, `any`, `*ngIf`, `*ngFor`, `ngClass`, and template-driven state.
- Duplicate `p-dialog` in `quiz.component.html`.
- Review retake hard-coded to `type: 'all'` even after a domain-specific quiz.
- Result refresh behavior that can render empty charts instead of a clear fallback.
- PrimeNG `p-chart` wrapper. SAA must use Chart.js directly per `PLAN.md`.

## Mirror Rules For SAA

- Preserve CLF's visible flow: progress + Finish Test at top, question count, answer cards, inline explanations, correctness feedback, domain/resource block, Back/Check/Next controls, skipped-question finish confirmation, result score chart, all-domain breakdown chart, review filters/chips/cards.
- Adapt exam copy to SAA-C03:
  - Result title: `AWS SAA-C03 Practice Exam - Results`.
  - Review domain options: `Design Secure Architectures`, `Design Resilient Architectures`, `Design High-Performing Architectures`, `Design Cost-Optimized Architectures`.
  - Home live mode remains omitted until P5.
- Use PrimeNG for the same CLF screen primitives where already installed and useful: `p-progressbar`, `p-button`, `p-radiobutton`, `p-checkbox`, `p-dialog`, `p-chip`, `p-select`.
- Use Chart.js direct components for charts, but reuse CLF chart labels, colors, cutout, legend positions, and stacked axis options.
- Keep all component state in signals. Derived values use `computed()`.
- No `standalone: true`, no `ngClass`, no `ngStyle`, no `@HostBinding`, no `@HostListener`.
- Use `@if`, `@for`, and `@switch`.
- Run the smallest relevant test after each task; run full requested validation before each commit.

## File Structure

- Modify `src/app/core/quiz.model.ts`
  - Own shared typed route/result/review shapes.
  - Add `QuizType`, `DomainSummaryMap`, `ReviewQuestion`, and `QuizResultNavigationState`.
- Create `src/app/core/quiz-results.ts`
  - Own pure helpers for answer matching, review-question projection, and domain summaries.
  - Keeps correctness logic testable outside component templates.
- Create `src/app/core/quiz-results.spec.ts`
  - Unit tests for single/multiple answer correctness, skipped handling, and domain aggregation.
- Modify `src/app/pages/quiz/quiz.ts`
  - Complete CLF quiz behavior using Angular 21 signals and PrimeNG controls.
- Modify `src/app/pages/quiz/quiz.spec.ts`
  - Extend existing P2-T1 coverage with selection, submit, navigation restore, finish confirmation, and finalize payload tests.
- Create `src/app/shared/donut-chart.ts`
  - Thin Chart.js doughnut wrapper with signal inputs and `DestroyRef` cleanup.
- Create `src/app/shared/stacked-bar-chart.ts`
  - Thin Chart.js stacked bar wrapper with signal inputs and `DestroyRef` cleanup.
- Create `src/app/shared/chart-types.ts`
  - Shared input interfaces for chart components.
- Modify `src/app/pages/result/result.ts`
  - Mirror CLF result screen, using typed navigation state and direct chart components.
- Create `src/app/pages/result/result.spec.ts`
  - Verify result state parsing, score/skipped math, domain chart visibility, and navigation.
- Modify `src/app/pages/review-answers/review-answers.ts`
  - Mirror CLF review screen with SAA domains, signal filters, chips, collapse/expand, and review cards.
- Create `src/app/pages/review-answers/review-answers.spec.ts`
  - Verify normalization, filters, correctness labels, back-to-result state, retake type, and missing-state fallback.
- Modify `TODOs.md` and `PROGRESS.md`
  - Mark each P2/P3 task as it lands.

---

## Task 1: Shared Result Types And Pure Helpers

**Files:**

- Modify: `src/app/core/quiz.model.ts`
- Create: `src/app/core/quiz-results.ts`
- Create: `src/app/core/quiz-results.spec.ts`

- [ ] **Step 1: Write failing helper tests**

Add `src/app/core/quiz-results.spec.ts`:

```ts
import type { AnswerEntry, Question } from './quiz.model';
import {
  buildDomainSummary,
  isSelectionCorrect,
  toReviewQuestions,
} from './quiz-results';

const secureSingle: Question = {
  id: 1,
  question: 'Secure single',
  domain: 'Design Secure Architectures',
  type: 'single',
  answers: [
    { text: 'A', status: 'correct', explanation: 'right' },
    { text: 'B', status: 'skipped', explanation: 'wrong' },
    { text: 'C', status: 'skipped', explanation: 'wrong' },
    { text: 'D', status: 'skipped', explanation: 'wrong' },
  ],
};

const resilientMultiple: Question = {
  id: 2,
  question: 'Resilient multiple (Choose TWO)',
  domain: 'Design Resilient Architectures',
  type: 'multiple',
  answers: [
    { text: 'A', status: 'correct', explanation: 'right' },
    { text: 'B', status: 'correct', explanation: 'right' },
    { text: 'C', status: 'skipped', explanation: 'wrong' },
    { text: 'D', status: 'skipped', explanation: 'wrong' },
    { text: 'E', status: 'skipped', explanation: 'wrong' },
  ],
};

describe('quiz result helpers', () => {
  it('checks single and multiple selections by answer text', () => {
    expect(isSelectionCorrect(secureSingle, ['A'])).toBe(true);
    expect(isSelectionCorrect(secureSingle, ['B'])).toBe(false);
    expect(isSelectionCorrect(resilientMultiple, ['B', 'A'])).toBe(true);
    expect(isSelectionCorrect(resilientMultiple, ['A'])).toBe(false);
    expect(isSelectionCorrect(resilientMultiple, ['A', 'C'])).toBe(false);
  });

  it('projects review questions with skipped and correctness flags', () => {
    const answers: Record<number, AnswerEntry> = {
      1: { selected: ['A'], isCorrect: true, submitted: true },
    };

    expect(toReviewQuestions([secureSingle, resilientMultiple], answers)).toEqual([
      {
        ...secureSingle,
        userAnswer: ['A'],
        isCorrect: true,
        isSkipped: false,
      },
      {
        ...resilientMultiple,
        userAnswer: [],
        isCorrect: false,
        isSkipped: true,
      },
    ]);
  });

  it('builds CLF-compatible domain summary objects', () => {
    const reviewQuestions = toReviewQuestions(
      [secureSingle, resilientMultiple],
      { 1: { selected: ['B'], isCorrect: false, submitted: true } },
    );

    expect(buildDomainSummary(reviewQuestions)).toEqual({
      'Design Secure Architectures': { correct: 0, total: 1, skipped: 0 },
      'Design Resilient Architectures': { correct: 0, total: 1, skipped: 1 },
    });
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm test -- --watch=false
```

Expected: fail because `src/app/core/quiz-results.ts` does not exist.

- [ ] **Step 3: Add shared types**

In `src/app/core/quiz.model.ts`, add these exports without removing existing model fields:

```ts
export type QuizType = 'all' | 'secure' | 'resilient' | 'performance' | 'cost';

export interface DomainSummaryEntry {
  correct: number;
  total: number;
  skipped: number;
}

export type DomainSummaryMap = Partial<Record<QuestionDomain, DomainSummaryEntry>>;

export interface ReviewQuestion extends Question {
  userAnswer: string[];
  isCorrect: boolean;
  isSkipped: boolean;
}

export interface QuizResultNavigationState {
  total: number;
  correct: number;
  skipped: number;
  timestamp: number;
  domainSummary: DomainSummaryMap;
  type: QuizType;
  questions: ReviewQuestion[];
}
```

- [ ] **Step 4: Add pure helpers**

Create `src/app/core/quiz-results.ts`:

```ts
import type {
  AnswerEntry,
  DomainSummaryEntry,
  DomainSummaryMap,
  Question,
  QuestionDomain,
  ReviewQuestion,
} from './quiz.model';

export function correctAnswerTexts(question: Question): string[] {
  return question.answers
    .filter((answer) => answer.status === 'correct')
    .map((answer) => answer.text);
}

export function isSelectionCorrect(question: Question, selected: string[]): boolean {
  const expected = [...correctAnswerTexts(question)].sort();
  const actual = [...selected].sort();

  if (question.type === 'single') {
    return actual.length === 1 && actual[0] === expected[0];
  }

  return actual.length === expected.length && actual.every((answer, index) => answer === expected[index]);
}

export function toReviewQuestions(
  questions: Question[],
  answers: Record<number, AnswerEntry>,
): ReviewQuestion[] {
  return questions.map((question) => {
    const entry = answers[question.id];
    const selected = entry?.selected ?? [];
    const hasAnswer = selected.length > 0;

    return {
      ...question,
      userAnswer: selected,
      isCorrect: hasAnswer && isSelectionCorrect(question, selected),
      isSkipped: !hasAnswer,
    };
  });
}

export function buildDomainSummary(questions: ReviewQuestion[]): DomainSummaryMap {
  return questions.reduce<DomainSummaryMap>((summary, question) => {
    const domain = question.domain;
    const current: DomainSummaryEntry = summary[domain] ?? {
      correct: 0,
      total: 0,
      skipped: 0,
    };

    summary[domain] = {
      total: current.total + 1,
      correct: current.correct + (question.isCorrect ? 1 : 0),
      skipped: current.skipped + (question.isSkipped ? 1 : 0),
    };

    return summary;
  }, {});
}

export function countCorrect(questions: ReviewQuestion[]): number {
  return questions.filter((question) => question.isCorrect).length;
}

export function countSkipped(questions: ReviewQuestion[]): number {
  return questions.filter((question) => question.isSkipped).length;
}

export function domainSummaryToBreakdown(summary: DomainSummaryMap): Array<{
  domain: QuestionDomain;
  correct: number;
  incorrect: number;
  skipped: number;
}> {
  return Object.entries(summary).map(([domain, entry]) => ({
    domain: domain as QuestionDomain,
    correct: entry.correct,
    incorrect: entry.total - entry.correct - entry.skipped,
    skipped: entry.skipped,
  }));
}
```

- [ ] **Step 5: Verify helpers pass**

Run:

```bash
npm test -- --watch=false
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/core/quiz.model.ts src/app/core/quiz-results.ts src/app/core/quiz-results.spec.ts
git commit -m "feat(P2): add quiz result helpers"
```

---

## Task 2: Complete Quiz Interaction Mirror

**Files:**

- Modify: `src/app/pages/quiz/quiz.ts`
- Modify: `src/app/pages/quiz/quiz.spec.ts`
- Modify: `TODOs.md`
- Modify: `PROGRESS.md`

- [ ] **Step 1: Write failing Quiz specs**

Extend `src/app/pages/quiz/quiz.spec.ts` with tests for:

- Single-choice answer selection enables `Check Answer`.
- Multiple-choice answer toggling keeps selected answers in a signal-backed array.
- Submitting a correct single answer shows `Correct answer. Good job!` and answer explanations.
- Submitting an incorrect multiple answer shows `Incorrect answer. Review the explanation.`
- Back/Next restores submitted state for a prior question.
- Finish with unanswered questions opens one confirmation dialog.
- Finish after all questions answered navigates to `/result` with CLF-compatible state keys: `total`, `correct`, `skipped`, `timestamp`, `domainSummary`, `type`, `questions`.

Use DOM queries by accessible text where possible. Use `provideRouter([])` and a router spy for navigation.

- [ ] **Step 2: Run the failing tests**

Run:

```bash
npm test -- --watch=false
```

Expected: failures for missing answer rendering, submit logic, navigation restore, progress bar, and finalize behavior.

- [ ] **Step 3: Implement signal state**

In `src/app/pages/quiz/quiz.ts`, keep existing loading behavior and add these signals/computed values:

```ts
readonly answerState = signal<Record<number, AnswerEntry>>({});
readonly selectedAnswers = signal<string[]>([]);
readonly showConfirmDialog = signal(false);
readonly progress = computed(() =>
  this.totalQuestions() === 0 ? 0 : (this.questionPosition() / this.totalQuestions()) * 100,
);
readonly currentAnswer = computed(() => {
  const question = this.currentQuestion();
  return question ? this.answerState()[question.id] : undefined;
});
readonly showExplanation = computed(() => this.currentAnswer()?.submitted ?? false);
readonly isCorrect = computed(() => this.currentAnswer()?.isCorrect ?? false);
readonly canCheckAnswer = computed(() => this.selectedAnswers().length > 0 && !this.showExplanation());
readonly canGoBack = computed(() => this.currentIndex() > 0);
readonly canGoNext = computed(() => this.currentIndex() < this.totalQuestions() - 1);
```

Add methods:

```ts
isSelected(answerText: string): boolean {
  return this.selectedAnswers().includes(answerText);
}

selectSingle(answerText: string): void {
  if (this.showExplanation()) {
    return;
  }

  this.selectedAnswers.set([answerText]);
}

toggleMultiple(answerText: string): void {
  if (this.showExplanation()) {
    return;
  }

  this.selectedAnswers.update((selected) =>
    selected.includes(answerText)
      ? selected.filter((item) => item !== answerText)
      : [...selected, answerText],
  );
}

checkAnswer(): void {
  const question = this.currentQuestion();
  if (!question || this.selectedAnswers().length === 0) {
    return;
  }

  const selected = this.selectedAnswers();
  this.answerState.update((state) => ({
    ...state,
    [question.id]: {
      selected,
      isCorrect: isSelectionCorrect(question, selected),
      submitted: true,
    },
  }));
}

goNext(): void {
  if (this.canGoNext()) {
    this.currentIndex.update((index) => index + 1);
    this.restoreCurrentSelection();
  }
}

goBack(): void {
  if (this.canGoBack()) {
    this.currentIndex.update((index) => index - 1);
    this.restoreCurrentSelection();
  }
}

private restoreCurrentSelection(): void {
  const question = this.currentQuestion();
  this.selectedAnswers.set(question ? (this.answerState()[question.id]?.selected ?? []) : []);
}
```

- [ ] **Step 4: Implement CLF-mirrored Quiz template**

Mirror CLF layout in one inline template:

- Top row:
  - `<p-progressbar [value]="progress()" styleClass="h-3">`
  - `<p-button label="Finish Test" icon="pi pi-flag" severity="danger" ...>`
- Question:
  - `Question {{ questionPosition() }} of {{ totalQuestions() }}`
  - Current stem.
- Answers:
  - Use `@switch (question.type)`.
  - Use `@for (answer of question.answers; track answer.text)`.
  - Use `p-radiobutton` for single and `p-checkbox` for multiple.
  - Use `[class.border-purple-600]`, `[class.border-green-500]`, `[class.bg-green-50]`, `[class.border-red-500]`, `[class.bg-red-50]`, `[class.hover:shadow-sm]` instead of `ngClass`.
  - Disable or ignore toggles after submit.
- Feedback:
  - Correct text: `Correct answer. Good job!`
  - Incorrect text: `Incorrect answer. Review the explanation.`
- Domain/resource:
  - Show domain and resource link after submit.
  - Link text should be `View Resource` with an accessible label; avoid relying on emoji.
- Navigation:
  - `Back`, `Check Answer`, `Next Question` buttons with CLF icons/severities.
- Confirmation:
  - Render a single `p-dialog` or accessible Tailwind modal. If using `p-dialog`, do not use `[style]`; use `styleClass="w-[25rem] max-w-[calc(100vw-2rem)]"`.

- [ ] **Step 5: Implement finalize payload**

Use helper functions from Task 1:

```ts
finishTest(): void {
  if (Object.keys(this.answerState()).length < this.totalQuestions()) {
    this.showConfirmDialog.set(true);
    return;
  }

  this.finalizeQuiz();
}

confirmFinish(): void {
  this.showConfirmDialog.set(false);
  this.finalizeQuiz();
}

cancelFinish(): void {
  this.showConfirmDialog.set(false);
}

finalizeQuiz(): void {
  const questions = toReviewQuestions(this.questions(), this.answerState());
  const state: QuizResultNavigationState = {
    total: questions.length,
    correct: countCorrect(questions),
    skipped: countSkipped(questions),
    timestamp: Date.now(),
    domainSummary: buildDomainSummary(questions),
    type: this.selectedType(),
    questions,
  };

  this.quizService.setQuestions(this.questions());
  this.quizService.setUserAnswers(this.answerState());
  this.router.navigate(['/result'], { state });
}
```

- [ ] **Step 6: Verify and update tracking**

Run:

```bash
npm test -- --watch=false
npm run build
node scripts/validate-quiz.mjs
```

Expected: all pass.

Update:

- `TODOs.md`: mark P2-T2, P2-T3, P2-T4, P2-T5, and P2-T6 done if all behavior lands in this task.
- `PROGRESS.md`: add one status line for each completed P2 task.

- [ ] **Step 7: Commit**

```bash
git add src/app/pages/quiz/quiz.ts src/app/pages/quiz/quiz.spec.ts TODOs.md PROGRESS.md
git commit -m "feat(P2): complete quiz interaction flow"
```

---

## Task 3: Direct Chart.js Components

**Files:**

- Create: `src/app/shared/donut-chart.ts`
- Create: `src/app/shared/stacked-bar-chart.ts`
- Create: `src/app/shared/chart-types.ts`
- Create: `src/app/shared/donut-chart.spec.ts`
- Create: `src/app/shared/stacked-bar-chart.spec.ts`

- [ ] **Step 1: Write shallow component tests**

Test that each chart component creates a `<canvas>` and accepts required inputs without throwing in JSDOM.

- [ ] **Step 2: Implement chart input types**

Create `src/app/shared/chart-types.ts`:

```ts
export interface DonutChartInput {
  labels: string[];
  data: number[];
  colors: string[];
}

export interface StackedBarDataset {
  label: string;
  backgroundColor: string;
  data: number[];
}

export interface StackedBarChartInput {
  labels: string[];
  datasets: StackedBarDataset[];
}
```

- [ ] **Step 3: Implement `DonutChart`**

Requirements:

- Selector: `app-donut-chart`.
- Inputs via `input.required<DonutChartInput>()`.
- Template: one `<canvas #canvas aria-label="Score breakdown chart" role="img"></canvas>`.
- Register Chart.js `ArcElement`, `Tooltip`, `Legend`, and `DoughnutController`.
- Recreate the chart in an `effect()` when input changes.
- Destroy chart on `DestroyRef.onDestroy()`.
- Options mirror CLF: `cutout: '60%'`, legend bottom.

- [ ] **Step 4: Implement `StackedBarChart`**

Requirements:

- Selector: `app-stacked-bar-chart`.
- Inputs via `input.required<StackedBarChartInput>()`.
- Template: one `<canvas #canvas aria-label="Domain score breakdown chart" role="img"></canvas>`.
- Register Chart.js bar pieces.
- Recreate the chart in an `effect()`.
- Destroy chart on `DestroyRef.onDestroy()`.
- Options mirror CLF: `responsive: true`, `maintainAspectRatio: false`, top legend, stacked x/y axes, tick color `#4B5563`, grid color `#E5E7EB`.

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- --watch=false
npm run build
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/shared/chart-types.ts src/app/shared/donut-chart.ts src/app/shared/stacked-bar-chart.ts src/app/shared/*.spec.ts
git commit -m "feat(P3): add direct Chart.js components"
```

---

## Task 4: Result Page Mirror

**Files:**

- Modify: `src/app/pages/result/result.ts`
- Create: `src/app/pages/result/result.spec.ts`
- Modify: `TODOs.md`
- Modify: `PROGRESS.md`

- [ ] **Step 1: Write failing Result specs**

Cover:

- Reads `QuizResultNavigationState` from `Router.getCurrentNavigation()?.extras.state`.
- Computes `score = Math.round(correct / total * 100)` with `0` when total is `0`.
- Computes skipped count from state.
- Shows doughnut summary for all quiz types.
- Shows stacked domain chart only when `type === 'all'`.
- `Review Questions` navigates to `/review` with `{ questions, type, resultState }`.
- `Retake Test` navigates to `/quiz?type=<same type>`.
- Missing state redirects home.

- [ ] **Step 2: Implement signal state**

Use:

```ts
private readonly router = inject(Router);
readonly result = signal<QuizResultNavigationState | null>(null);
readonly totalQuestions = computed(() => this.result()?.total ?? 0);
readonly correctAnswers = computed(() => this.result()?.correct ?? 0);
readonly skippedAnswers = computed(() => this.result()?.skipped ?? 0);
readonly score = computed(() =>
  this.totalQuestions() === 0 ? 0 : Math.round((this.correctAnswers() / this.totalQuestions()) * 100),
);
readonly finishedAt = computed(() => new Date(this.result()?.timestamp ?? Date.now()));
readonly quizType = computed(() => this.result()?.type ?? 'all');
readonly domainBreakdown = computed(() =>
  domainSummaryToBreakdown(this.result()?.domainSummary ?? {}),
);
```

- [ ] **Step 3: Implement CLF-mirrored Result template**

Mirror CLF layout with SAA title:

- `AWS SAA-C03 Practice Exam - Results`
- `You completed N questions`
- Card with `app-donut-chart`
- Score line: `{{ score() }}% correct ({{ correctAnswers() }}/{{ totalQuestions() }})`
- Skipped line.
- Completed date/time using Angular date pipe.
- All-domain domain chart section only when `quizType() === 'all'`.
- Buttons:
  - `Review Questions`, icon `pi pi-eye`
  - `Retake Test`, icon `pi pi-refresh`, severity `warn`
  - `Go to Homepage`, icon `pi pi-home`, severity `secondary`

- [ ] **Step 4: Implement navigation actions**

```ts
goToReview(): void {
  const result = this.result();
  if (!result) {
    this.router.navigate(['/']);
    return;
  }

  this.router.navigate(['/review'], {
    state: {
      questions: result.questions,
      type: result.type,
      resultState: result,
    },
  });
}

retakeQuiz(): void {
  this.router.navigate(['/quiz'], { queryParams: { type: this.quizType() } });
}

goHome(): void {
  this.router.navigate(['/']);
}
```

- [ ] **Step 5: Verify and update tracking**

Run:

```bash
npm test -- --watch=false
npm run build
node scripts/validate-quiz.mjs
```

Update `TODOs.md` and `PROGRESS.md` for relevant P3 tasks.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/result/result.ts src/app/pages/result/result.spec.ts TODOs.md PROGRESS.md
git commit -m "feat(P3): implement result overview"
```

---

## Task 5: Review Answers Page Mirror

**Files:**

- Modify: `src/app/pages/review-answers/review-answers.ts`
- Create: `src/app/pages/review-answers/review-answers.spec.ts`
- Modify: `TODOs.md`
- Modify: `PROGRESS.md`

- [ ] **Step 1: Write failing Review specs**

Cover:

- Missing questions state redirects home.
- Reads `questions`, `type`, and optional `resultState` from navigation state.
- Computes total/correct/incorrect/skipped chips.
- Domain filter narrows cards.
- Collapse/expand hides/shows answer explanations.
- Correct answers are visibly labeled as correct.
- User-selected wrong answers are visibly labeled as selected incorrect.
- Back to result preserves original type and result state.
- Retake preserves original type, not hard-coded `all`.

- [ ] **Step 2: Implement review signals**

Use:

```ts
readonly allQuestions = signal<ReviewQuestion[]>([]);
readonly selectedDomain = signal<QuestionDomain | 'All domains'>('All domains');
readonly showAll = signal(true);
readonly quizType = signal<QuizType>('all');
readonly resultState = signal<QuizResultNavigationState | null>(null);

readonly filteredQuestions = computed(() =>
  this.selectedDomain() === 'All domains'
    ? this.allQuestions()
    : this.allQuestions().filter((question) => question.domain === this.selectedDomain()),
);
readonly totalQuestions = computed(() => this.allQuestions().length);
readonly correctAnswers = computed(() => this.allQuestions().filter((question) => question.isCorrect).length);
readonly skippedAnswers = computed(() => this.allQuestions().filter((question) => question.isSkipped).length);
readonly incorrectAnswers = computed(
  () => this.totalQuestions() - this.correctAnswers() - this.skippedAnswers(),
);
```

- [ ] **Step 3: Implement SAA domain options**

Use exact SAA domains:

```ts
readonly domainOptions = [
  { name: 'All domains', value: 'All domains' },
  { name: 'Design Secure Architectures', value: 'Design Secure Architectures' },
  { name: 'Design Resilient Architectures', value: 'Design Resilient Architectures' },
  { name: 'Design High-Performing Architectures', value: 'Design High-Performing Architectures' },
  { name: 'Design Cost-Optimized Architectures', value: 'Design Cost-Optimized Architectures' },
] as const;
```

- [ ] **Step 4: Implement CLF-mirrored Review template**

Mirror CLF layout:

- Top `Back to Result Overview` button.
- `p-select` for domain filter.
- `p-chip` totals.
- Collapse/expand button.
- `@for` review cards.
- Resource link.
- Answer blocks with explicit text labels:
  - `Correct answer`
  - `Your incorrect selection`
  - `Distractor`
- Status block:
  - `Skipped`
  - `Correct answer`
  - `Incorrect answer`
- Footer `Retake Test` and `Go to Homepage`.

Use `[class...]` bindings instead of `ngClass`.

- [ ] **Step 5: Implement navigation**

Back to result:

```ts
goBack(): void {
  const result = this.resultState();
  if (result) {
    this.router.navigate(['/result'], { state: result });
    return;
  }

  const questions = this.allQuestions();
  const rebuilt: QuizResultNavigationState = {
    total: questions.length,
    correct: this.correctAnswers(),
    skipped: this.skippedAnswers(),
    timestamp: Date.now(),
    domainSummary: buildDomainSummary(questions),
    type: this.quizType(),
    questions,
  };

  this.router.navigate(['/result'], { state: rebuilt });
}

retakeTest(): void {
  this.router.navigate(['/quiz'], { queryParams: { type: this.quizType() } });
}
```

- [ ] **Step 6: Verify and update tracking**

Run:

```bash
npm test -- --watch=false
npm run build
node scripts/validate-quiz.mjs
```

Update `TODOs.md` and `PROGRESS.md` for relevant P3 tasks.

- [ ] **Step 7: Commit**

```bash
git add src/app/pages/review-answers/review-answers.ts src/app/pages/review-answers/review-answers.spec.ts TODOs.md PROGRESS.md
git commit -m "feat(P3): implement answer review"
```

---

## Task 6: Mirror Verification Pass

**Files:**

- Modify only files required by verification findings.
- Modify: `TODOs.md`
- Modify: `PROGRESS.md`

- [ ] **Step 1: Run CLI checks**

```bash
npm test -- --watch=false
npm run build
node scripts/validate-quiz.mjs
```

Expected:

- All tests pass.
- Production build stays under budget.
- Quiz validator reports 5 files and 0 errors.

- [ ] **Step 2: Browser-check solo flow**

Start dev server:

```bash
npm start
```

Verify manually or with browser automation:

- `/` matches accepted SAA Home.
- `/quiz?type=secure` loads all 80 secure questions and starts at `Question 1 of 80`.
- `/quiz?type=all` loads 65 questions.
- Single-choice selection, Check Answer, explanation, domain, and resource work.
- Multiple-choice selection, Check Answer, explanation, domain, and resource work.
- Back/Next restores submitted and unsubmitted selections.
- Finish unanswered test opens exactly one confirmation dialog.
- Finish routes to `/result`.
- Result shows score, skipped count, completed date/time, buttons.
- Result shows domain stacked bar only for `type=all`.
- Review route shows chips, SAA domain filter, collapse/expand, cards, resources, and footer actions.
- Retake from Result and Review preserves the original `type`.

- [ ] **Step 3: Accessibility pass**

Run AXE on:

- `/`
- `/quiz?type=secure`
- `/result` after a completed run
- `/review` after navigating from result

Fix all serious and critical issues. Also verify:

- All icon-only links/buttons have accessible names.
- Modal focus is trapped or returns to the triggering control.
- Color-coded answer/result states include text labels, not color alone.
- Keyboard users can select answers and complete the flow.

- [ ] **Step 4: Mobile pass**

At 360px width:

- Progress + Finish Test stack without overlap.
- Answer cards do not overflow.
- Buttons stack and fit.
- Result charts stay inside the viewport.
- Review cards and chips wrap cleanly.

- [ ] **Step 5: Update readiness docs**

Update `TODOs.md` and `PROGRESS.md`:

- Mark remaining P2/P3 tasks complete if verified.
- Add validation command results.
- Add any P4 findings as follow-up tasks instead of burying them.

- [ ] **Step 6: Commit**

```bash
git add TODOs.md PROGRESS.md src/app
git commit -m "test: verify solo quiz flow parity"
```

---

## Self-Review

- Spec coverage: This plan covers CLF Home parity status, Quiz answer/render/finish behavior, Result charts/navigation, Review filter/cards/navigation, Chart.js direct components, and final accessibility/mobile verification.
- Scope: Live/Kahoot mode, hosting, auth, persistence, and post-exam features remain out of scope.
- Type consistency: Shared types use `QuizType`, `ReviewQuestion`, `DomainSummaryMap`, and `QuizResultNavigationState` across Quiz, Result, and Review.
- Known deliberate deviations from CLF: no live mode, no duplicated dialog, no PrimeNG chart wrapper, no hard-coded all-domain retake, no Angular 19 patterns, no `ngClass`.
