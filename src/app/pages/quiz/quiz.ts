import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

import { QuizService } from '../../core/quiz.service';
import type {
  Answer,
  AnswerEntry,
  Question,
  QuizResultNavigationState,
  QuizType,
} from '../../core/quiz.model';
import {
  buildDomainSummary,
  countCorrect,
  countSkipped,
  isSelectionCorrect,
  toReviewQuestions,
} from '../../core/quiz-results';
import { prepareQuestions } from '../../core/quiz-randomization';

const quizTypes: readonly QuizType[] = ['all', 'secure', 'resilient', 'performance', 'cost'];

const quizTypeLabels: Record<QuizType, string> = {
  all: 'All Domains',
  secure: 'Design Secure Architectures',
  resilient: 'Design Resilient Architectures',
  performance: 'Design High-Performing Architectures',
  cost: 'Design Cost-Optimized Architectures',
};

function isQuizType(value: string | null): value is QuizType {
  return value !== null && quizTypes.includes(value as QuizType);
}

function normalizeQuizType(value: string | null): QuizType {
  return isQuizType(value) ? value : 'all';
}

@Component({
  selector: 'app-quiz',
  imports: [ButtonModule, DialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="max-w-4xl mx-auto px-4 py-10">
      @if (isLoading()) {
        <p class="text-sm text-gray-600" role="status" aria-live="polite">Loading questions...</p>
      } @else if (error()) {
        <section class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900" role="alert">
          <h1 class="text-xl font-semibold">Quiz unavailable</h1>
          <p class="mt-2">{{ error() }}</p>
        </section>
      } @else if (currentQuestion(); as question) {
        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="w-full">
            <div
              class="h-3 overflow-hidden rounded-full bg-gray-200"
              role="progressbar"
              aria-label="Quiz progress"
              aria-valuemin="0"
              aria-valuemax="100"
              [attr.aria-valuenow]="progressValue()"
              [attr.aria-valuetext]="'Question ' + questionPosition() + ' of ' + totalQuestions()"
            >
              <div
                class="h-full rounded-full bg-zinc-950 transition-[width]"
                [style.width.%]="progress()"
              ></div>
            </div>
          </div>
          <p-button
            label="Finish Test"
            icon="pi pi-flag"
            severity="danger"
            styleClass="w-full whitespace-nowrap sm:w-auto !border-red-700 !bg-red-700 !text-white hover:!border-red-800 hover:!bg-red-800"
            (onClick)="finishTest()"
          />
        </div>

        <section aria-labelledby="question-heading">
          <div class="mb-4">
            <p class="text-sm text-gray-600">
              Question {{ questionPosition() }} of {{ totalQuestions() }}
            </p>
            <p class="mt-1 text-sm text-gray-500">{{ quizTitle() }}</p>
          </div>

          <h1 id="question-heading" class="text-lg font-medium leading-snug text-gray-950">
            {{ question.question }}
          </h1>

          <fieldset class="my-6 space-y-4">
            <legend class="sr-only">Answer choices</legend>

            @switch (question.type) {
              @case ('single') {
                @for (answer of question.answers; track answer.text) {
                  <label
                    class="flex cursor-pointer items-start gap-3 rounded border p-3 transition"
                    [class.border-purple-600]="isSelected(answer.text) && !showExplanation()"
                    [class.border-green-500]="showExplanation() && isCorrectAnswer(answer)"
                    [class.bg-green-50]="showExplanation() && isCorrectAnswer(answer)"
                    [class.border-red-500]="showExplanation() && isSelectedWrongAnswer(answer)"
                    [class.bg-red-50]="showExplanation() && isSelectedWrongAnswer(answer)"
                    [class.hover:shadow-sm]="!showExplanation()"
                    [class.cursor-not-allowed]="showExplanation()"
                  >
                    <input
                      class="mt-1 size-4 accent-purple-700"
                      type="radio"
                      [attr.name]="'question-' + question.id"
                      [value]="answer.text"
                      [checked]="isSelected(answer.text)"
                      [disabled]="showExplanation()"
                      (change)="selectSingle(answer.text)"
                    />

                    <span class="block">
                      <span class="flex flex-col gap-1 sm:flex-row sm:items-center">
                        <span class="font-medium text-gray-950">{{ answer.text }}</span>
                        @if (showExplanation()) {
                          <span
                            class="w-fit rounded px-2 py-0.5 text-xs font-semibold"
                            [class.bg-green-100]="isCorrectAnswer(answer)"
                            [class.text-green-800]="isCorrectAnswer(answer)"
                            [class.bg-red-100]="isSelectedWrongAnswer(answer)"
                            [class.text-red-800]="isSelectedWrongAnswer(answer)"
                            [class.bg-gray-100]="isDistractor(answer)"
                            [class.text-gray-700]="isDistractor(answer)"
                          >
                            {{ answerStatusLabel(answer) }}
                          </span>
                        }
                      </span>
                      @if (showExplanation()) {
                        <span class="mt-1 block text-sm text-gray-700">
                          <span class="font-semibold">Explanation:</span> {{ answer.explanation }}
                        </span>
                      }
                    </span>
                  </label>
                }
              }
              @case ('multiple') {
                @for (answer of question.answers; track answer.text) {
                  <label
                    class="flex cursor-pointer items-start gap-3 rounded border p-3 transition"
                    [class.border-purple-600]="isSelected(answer.text) && !showExplanation()"
                    [class.border-green-500]="showExplanation() && isCorrectAnswer(answer)"
                    [class.bg-green-50]="showExplanation() && isCorrectAnswer(answer)"
                    [class.border-red-500]="showExplanation() && isSelectedWrongAnswer(answer)"
                    [class.bg-red-50]="showExplanation() && isSelectedWrongAnswer(answer)"
                    [class.hover:shadow-sm]="!showExplanation()"
                    [class.cursor-not-allowed]="showExplanation()"
                  >
                    <input
                      class="mt-1 size-4 accent-purple-700"
                      type="checkbox"
                      [value]="answer.text"
                      [checked]="isSelected(answer.text)"
                      [disabled]="showExplanation()"
                      (change)="toggleMultiple(answer.text)"
                    />

                    <span class="block">
                      <span class="flex flex-col gap-1 sm:flex-row sm:items-center">
                        <span class="font-medium text-gray-950">{{ answer.text }}</span>
                        @if (showExplanation()) {
                          <span
                            class="w-fit rounded px-2 py-0.5 text-xs font-semibold"
                            [class.bg-green-100]="isCorrectAnswer(answer)"
                            [class.text-green-800]="isCorrectAnswer(answer)"
                            [class.bg-red-100]="isSelectedWrongAnswer(answer)"
                            [class.text-red-800]="isSelectedWrongAnswer(answer)"
                            [class.bg-gray-100]="isDistractor(answer)"
                            [class.text-gray-700]="isDistractor(answer)"
                          >
                            {{ answerStatusLabel(answer) }}
                          </span>
                        }
                      </span>
                      @if (showExplanation()) {
                        <span class="mt-1 block text-sm text-gray-700">
                          <span class="font-semibold">Explanation:</span> {{ answer.explanation }}
                        </span>
                      }
                    </span>
                  </label>
                }
              }
            }
          </fieldset>

          @if (showExplanation()) {
            <div
              class="mb-4 rounded border p-4 text-sm"
              role="status"
              aria-live="polite"
              [class.border-green-400]="isCorrect()"
              [class.bg-green-100]="isCorrect()"
              [class.text-green-700]="isCorrect()"
              [class.border-red-400]="!isCorrect()"
              [class.bg-red-100]="!isCorrect()"
              [class.text-red-700]="!isCorrect()"
            >
              {{
                isCorrect()
                  ? 'Correct answer. Good job!'
                  : 'Incorrect answer. Review the explanation.'
              }}
            </div>

            <div class="mb-6 text-sm text-gray-700">
              <p><span class="font-semibold">Domain:</span> {{ question.domain }}</p>
              @if (question.resource) {
                <a
                  class="mt-2 inline-block text-blue-700 underline"
                  [href]="question.resource"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Resource
                </a>
              }
            </div>
          }

          <div class="mt-6 flex flex-col justify-between gap-4 sm:flex-row">
            <p-button
              label="Back"
              icon="pi pi-arrow-left"
              severity="secondary"
              styleClass="w-full sm:w-auto"
              [disabled]="!canGoBack()"
              (onClick)="goBack()"
            />

            @if (!showExplanation()) {
              <p-button
                label="Check Answer"
                icon="pi pi-check"
                iconPos="right"
                severity="info"
                styleClass="w-full sm:w-auto"
                [disabled]="!canCheckAnswer()"
                (onClick)="checkAnswer()"
              />
            } @else {
              <p-button
                label="Next Question"
                icon="pi pi-arrow-right"
                iconPos="right"
                severity="success"
                styleClass="w-full sm:w-auto"
                [disabled]="!canGoNext()"
                (onClick)="goNext()"
              />
            }
          </div>
        </section>

        @if (showConfirmDialog()) {
          <p-dialog
            header="Finish Test?"
            [visible]="showConfirmDialog()"
            (visibleChange)="showConfirmDialog.set($event)"
            [modal]="true"
            styleClass="w-[25rem] max-w-[calc(100vw-2rem)]"
          >
            <p class="text-sm text-gray-700">
              You have not answered all questions. Are you sure you want to finish and view results?
            </p>
            <div class="mt-6 flex justify-end gap-2">
              <p-button label="Cancel" severity="secondary" (onClick)="cancelFinish()" />
              <p-button label="Finish Anyway" icon="pi pi-check" (onClick)="confirmFinish()" />
            </div>
          </p-dialog>
        }
      } @else {
        <section
          class="rounded-lg border border-gray-200 bg-white p-6 text-gray-700 shadow-sm"
          role="status"
        >
          <h1 class="text-xl font-semibold">No questions available</h1>
          <p class="mt-2">Choose another quiz type from the home page and try again.</p>
        </section>
      }
    </main>
  `,
})
export class Quiz {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);

  readonly questions = signal<Question[]>([]);
  readonly currentIndex = signal(0);
  readonly answerState = signal<Record<number, AnswerEntry>>({});
  readonly selectedAnswers = signal<string[]>([]);
  readonly showConfirmDialog = signal(false);
  readonly selectedType = signal<QuizType>('all');
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly totalQuestions = computed(() => this.questions().length);
  readonly progress = computed(() =>
    this.totalQuestions() === 0 ? 0 : ((this.currentIndex() + 1) / this.totalQuestions()) * 100,
  );
  readonly progressValue = computed(() => Math.round(this.progress()));
  readonly questionPosition = computed(() =>
    this.totalQuestions() === 0 ? 0 : this.currentIndex() + 1,
  );
  readonly currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  readonly currentAnswer = computed(() => {
    const question = this.currentQuestion();
    return question ? this.answerState()[question.id] : undefined;
  });
  readonly showExplanation = computed(() => this.currentAnswer()?.submitted ?? false);
  readonly isCorrect = computed(() => this.currentAnswer()?.isCorrect ?? false);
  readonly canCheckAnswer = computed(
    () => this.selectedAnswers().length > 0 && !this.showExplanation(),
  );
  readonly canGoBack = computed(() => this.currentIndex() > 0);
  readonly canGoNext = computed(() => this.currentIndex() < this.totalQuestions() - 1);
  readonly quizTitle = computed(() => quizTypeLabels[this.selectedType()]);

  constructor() {
    this.route.queryParamMap
      .pipe(
        map((params) => normalizeQuizType(params.get('type'))),
        distinctUntilChanged(),
        tap((type) => {
          this.selectedType.set(type);
          this.currentIndex.set(0);
          this.answerState.set({});
          this.selectedAnswers.set([]);
          this.showConfirmDialog.set(false);
          this.isLoading.set(true);
          this.error.set(null);
        }),
        switchMap((type) =>
          this.quizService.loadQuestions(type).pipe(
            map((questions) => ({
              questions: prepareQuestions(type, questions),
              error: null,
            })),
            catchError(() =>
              of({
                questions: [],
                error: 'Unable to load quiz questions. Return home and try again.',
              }),
            ),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ questions, error }) => {
        this.questions.set(questions);
        this.quizService.setQuestions(questions);
        this.restoreSelectionForCurrentQuestion();
        this.error.set(error);
        this.isLoading.set(false);
      });
  }

  isSelected(answerText: string): boolean {
    return this.selectedAnswers().includes(answerText);
  }

  isCorrectAnswer(answer: Answer): boolean {
    return answer.status === 'correct';
  }

  isSelectedWrongAnswer(answer: Answer): boolean {
    return this.isSelected(answer.text) && !this.isCorrectAnswer(answer);
  }

  isDistractor(answer: Answer): boolean {
    return !this.isCorrectAnswer(answer) && !this.isSelectedWrongAnswer(answer);
  }

  answerStatusLabel(answer: Answer): 'Correct answer' | 'Your incorrect selection' | 'Distractor' {
    if (this.isCorrectAnswer(answer)) {
      return 'Correct answer';
    }

    if (this.isSelectedWrongAnswer(answer)) {
      return 'Your incorrect selection';
    }

    return 'Distractor';
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
        ? selected.filter((current) => current !== answerText)
        : [...selected, answerText],
    );
  }

  checkAnswer(): void {
    const question = this.currentQuestion();

    if (!question || !this.canCheckAnswer()) {
      return;
    }

    const selected = this.selectedAnswers();
    const entry: AnswerEntry = {
      selected: [...selected],
      isCorrect: isSelectionCorrect(question, selected),
      submitted: true,
    };

    this.answerState.update((state) => ({
      ...state,
      [question.id]: entry,
    }));
  }

  goBack(): void {
    if (!this.canGoBack()) {
      return;
    }

    this.currentIndex.update((index) => index - 1);
    this.restoreSelectionForCurrentQuestion();
  }

  goNext(): void {
    if (!this.canGoNext()) {
      return;
    }

    this.currentIndex.update((index) => index + 1);
    this.restoreSelectionForCurrentQuestion();
  }

  finishTest(): void {
    const answeredCount = Object.values(this.answerState()).filter(
      (entry) => entry.submitted,
    ).length;

    if (answeredCount < this.totalQuestions()) {
      this.showConfirmDialog.set(true);
      return;
    }

    this.finalizeQuiz();
  }

  cancelFinish(): void {
    this.showConfirmDialog.set(false);
  }

  confirmFinish(): void {
    this.showConfirmDialog.set(false);
    this.finalizeQuiz();
  }

  private finalizeQuiz(): void {
    const questions = this.questions();
    const answers = this.answerState();
    const reviewQuestions = toReviewQuestions(questions, answers);
    const state: QuizResultNavigationState = {
      total: questions.length,
      correct: countCorrect(reviewQuestions),
      skipped: countSkipped(reviewQuestions),
      timestamp: Date.now(),
      domainSummary: buildDomainSummary(reviewQuestions),
      type: this.selectedType(),
      questions: reviewQuestions,
    };

    this.quizService.setQuestions(questions);
    this.quizService.setUserAnswers(answers);
    void this.router.navigate(['/result'], { state });
  }

  private restoreSelectionForCurrentQuestion(): void {
    const question = this.currentQuestion();

    if (!question) {
      this.selectedAnswers.set([]);
      return;
    }

    this.selectedAnswers.set(this.answerState()[question.id]?.selected ?? []);
  }
}
