import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { SelectModule } from 'primeng/select';

import type {
  Answer,
  DomainSummaryMap,
  QuestionDomain,
  QuizResultNavigationState,
  QuizType,
  ReviewQuestion,
} from '../../core/quiz.model';
import { buildDomainSummary } from '../../core/quiz-results';

type DomainFilter = QuestionDomain | 'All domains';

interface DomainOption {
  label: DomainFilter;
  value: DomainFilter;
}

interface ReviewNavigationState {
  questions: ReviewQuestion[];
  type: QuizType;
  resultState: QuizResultNavigationState | null;
}

@Component({
  selector: 'app-review-answers',
  imports: [FormsModule, ButtonModule, ChipModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (allQuestions().length > 0) {
      <div class="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <p-button
          icon="pi pi-arrow-left"
          label="Back to Result Overview"
          (onClick)="goBack()"
        />

        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div class="w-full md:w-80">
            <label
              for="review-domain-filter"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Domain
            </label>
            <p-select
              inputId="review-domain-filter"
              [options]="domainOptions"
              optionLabel="label"
              optionValue="value"
              [ngModel]="selectedDomain()"
              (onChange)="setSelectedDomain($event.value)"
              ariaLabel="Filter by domain"
              class="w-full"
            />
          </div>

          <div class="flex flex-wrap gap-3">
            <p-chip [label]="totalQuestions() + ' Total'" />
            <p-chip
              [label]="correctAnswers() + ' Correct'"
              class="bg-green-100 text-green-900"
            />
            <p-chip
              [label]="incorrectAnswers() + ' Incorrect'"
              class="bg-red-100 text-red-900"
            />
            <p-chip
              [label]="skippedAnswers() + ' Skipped'"
              class="bg-gray-100 text-gray-800"
            />
          </div>
        </div>

        <div class="flex justify-end">
          <p-button
            [label]="showAll() ? 'Collapse all questions' : 'Expand all questions'"
            [icon]="showAll() ? 'pi pi-minus' : 'pi pi-plus'"
            severity="secondary"
            (onClick)="toggleCollapseAll()"
          />
        </div>

        <section class="space-y-6" aria-label="Reviewed questions">
          @for (question of filteredQuestions(); track question.id) {
            <article class="border border-gray-200 rounded-md p-5 md:p-6 bg-white shadow-sm space-y-4">
              <p class="text-xs text-gray-600 font-semibold uppercase">
                {{ question.domain }}
              </p>

              <h2 class="text-base md:text-lg font-semibold text-gray-900">
                {{ question.question }}
              </h2>

              @if (question.resource) {
                <a
                  [href]="question.resource"
                  class="inline-flex items-center gap-2 text-sm font-medium text-blue-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span class="pi pi-external-link text-xs" aria-hidden="true"></span>
                  View Resource
                </a>
              }

              @if (showAll()) {
                <div class="space-y-3" aria-label="Answer explanations">
                  @for (answer of question.answers; track answer.text) {
                    <div
                      data-testid="answer-card"
                      class="rounded-md border p-4 space-y-2"
                      [class.bg-green-50]="isCorrectAnswer(answer)"
                      [class.border-green-600]="isCorrectAnswer(answer)"
                      [class.text-green-950]="isCorrectAnswer(answer)"
                      [class.bg-red-50]="isUserIncorrect(question, answer)"
                      [class.border-red-600]="isUserIncorrect(question, answer)"
                      [class.text-red-950]="isUserIncorrect(question, answer)"
                      [class.bg-white]="!isCorrectAnswer(answer) && !isUserIncorrect(question, answer)"
                      [class.border-gray-300]="!isCorrectAnswer(answer) && !isUserIncorrect(question, answer)"
                    >
                      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <p class="font-medium text-sm md:text-base">
                          {{ answer.text }}
                        </p>
                        <span
                          class="text-xs font-semibold uppercase"
                          [class.text-green-800]="isCorrectAnswer(answer)"
                          [class.text-red-800]="isUserIncorrect(question, answer)"
                          [class.text-gray-700]="!isCorrectAnswer(answer) && !isUserIncorrect(question, answer)"
                        >
                          {{ answerLabel(question, answer) }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-700">
                        <span class="font-semibold">Explanation:</span>
                        {{ answer.explanation }}
                      </p>
                    </div>
                  }
                </div>
              }

              <div
                class="text-sm px-4 py-3 rounded-md border font-semibold"
                [class.bg-green-50]="question.isCorrect"
                [class.border-green-600]="question.isCorrect"
                [class.text-green-900]="question.isCorrect"
                [class.bg-red-50]="!question.isCorrect && !question.isSkipped"
                [class.border-red-600]="!question.isCorrect && !question.isSkipped"
                [class.text-red-900]="!question.isCorrect && !question.isSkipped"
                [class.bg-gray-50]="question.isSkipped"
                [class.border-gray-400]="question.isSkipped"
                [class.text-gray-800]="question.isSkipped"
              >
                {{ questionStatusLabel(question) }}
              </div>
            </article>
          }
        </section>

        <div class="flex flex-col md:flex-row justify-center gap-4 pt-2">
          <p-button
            label="Retake Test"
            icon="pi pi-refresh"
            severity="warn"
            styleClass="w-full md:w-auto !border-amber-800 !bg-amber-800 !text-white hover:!border-amber-900 hover:!bg-amber-900"
            (onClick)="retakeTest()"
          />
          <p-button
            label="Go to Homepage"
            icon="pi pi-home"
            severity="secondary"
            styleClass="w-full md:w-auto"
            (onClick)="goHome()"
          />
        </div>
      </div>
    } @else {
      <p class="px-4 py-10 text-center text-gray-600">Returning to homepage...</p>
    }
  `,
})
export class ReviewAnswers {
  private readonly router = inject(Router);

  readonly allQuestions = signal<ReviewQuestion[]>([]);
  readonly selectedDomain = signal<DomainFilter>('All domains');
  readonly showAll = signal(true);
  readonly quizType = signal<QuizType>('all');
  readonly resultState = signal<QuizResultNavigationState | null>(null);

  readonly domainOptions: DomainOption[] = [
    { label: 'All domains', value: 'All domains' },
    { label: 'Design Secure Architectures', value: 'Design Secure Architectures' },
    { label: 'Design Resilient Architectures', value: 'Design Resilient Architectures' },
    {
      label: 'Design High-Performing Architectures',
      value: 'Design High-Performing Architectures',
    },
    {
      label: 'Design Cost-Optimized Architectures',
      value: 'Design Cost-Optimized Architectures',
    },
  ];

  readonly filteredQuestions = computed(() => {
    const selectedDomain = this.selectedDomain();

    if (selectedDomain === 'All domains') {
      return this.allQuestions();
    }

    return this.allQuestions().filter((question) => question.domain === selectedDomain);
  });
  readonly totalQuestions = computed(() => this.allQuestions().length);
  readonly correctAnswers = computed(
    () => this.allQuestions().filter((question) => question.isCorrect).length,
  );
  readonly skippedAnswers = computed(
    () => this.allQuestions().filter((question) => question.isSkipped).length,
  );
  readonly incorrectAnswers = computed(
    () =>
      this.totalQuestions() -
      this.correctAnswers() -
      this.skippedAnswers(),
  );

  constructor() {
    const state = this.readReviewState();

    if (!state) {
      this.router.navigate(['/']);
      return;
    }

    this.allQuestions.set(state.questions);
    this.quizType.set(state.type);
    this.resultState.set(state.resultState);
  }

  setSelectedDomain(value: unknown): void {
    if (isDomainFilter(value)) {
      this.selectedDomain.set(value);
    }
  }

  toggleCollapseAll(): void {
    this.showAll.update((current) => !current);
  }

  isCorrectAnswer(answer: Answer): boolean {
    return answer.status === 'correct';
  }

  isUserIncorrect(question: ReviewQuestion, answer: Answer): boolean {
    return question.userAnswer.includes(answer.text) && answer.status !== 'correct';
  }

  answerLabel(question: ReviewQuestion, answer: Answer): string {
    if (this.isCorrectAnswer(answer)) {
      return 'Correct answer';
    }

    if (this.isUserIncorrect(question, answer)) {
      return 'Your incorrect selection';
    }

    return 'Distractor';
  }

  questionStatusLabel(question: ReviewQuestion): string {
    if (question.isSkipped) {
      return 'Skipped';
    }

    return question.isCorrect ? 'Correct answer' : 'Incorrect answer';
  }

  goBack(): void {
    this.router.navigate(['/result'], {
      state: this.resultState() ?? this.rebuildResultState(),
    });
  }

  retakeTest(): void {
    this.router.navigate(['/quiz'], { queryParams: { type: this.quizType() } });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  private rebuildResultState(): QuizResultNavigationState {
    return {
      total: this.totalQuestions(),
      correct: this.correctAnswers(),
      skipped: this.skippedAnswers(),
      timestamp: Date.now(),
      domainSummary: buildDomainSummary(this.allQuestions()),
      type: this.quizType(),
      questions: this.allQuestions(),
    };
  }

  private readReviewState(): ReviewNavigationState | null {
    const navigationState = this.router.getCurrentNavigation()?.extras.state;

    return (
      this.toReviewState(navigationState) ??
      this.toReviewState(readHistoryState())
    );
  }

  private toReviewState(value: unknown): ReviewNavigationState | null {
    if (!isRecord(value)) {
      return null;
    }

    const questions = this.toReviewQuestions(value['questions']);
    const resultState = this.toResultState(value['resultState']);
    const type = isQuizType(value['type']) ? value['type'] : resultState?.type;

    if (!questions || questions.length === 0 || !type) {
      return null;
    }

    return {
      questions,
      type,
      resultState,
    };
  }

  private toResultState(value: unknown): QuizResultNavigationState | null {
    if (!isRecord(value)) {
      return null;
    }

    const total = value['total'];
    const correct = value['correct'];
    const skipped = value['skipped'];
    const timestamp = value['timestamp'];
    const domainSummary = this.toDomainSummaryMap(value['domainSummary']);
    const type = value['type'];
    const questions = this.toReviewQuestions(value['questions']);

    if (
      !isFiniteNumber(total) ||
      !isFiniteNumber(correct) ||
      !isFiniteNumber(skipped) ||
      !isFiniteNumber(timestamp) ||
      !domainSummary ||
      !isQuizType(type) ||
      !questions
    ) {
      return null;
    }

    return {
      total,
      correct,
      skipped,
      timestamp,
      domainSummary,
      type,
      questions,
    };
  }

  private toDomainSummaryMap(value: unknown): DomainSummaryMap | null {
    if (!isRecord(value)) {
      return null;
    }

    return Object.entries(value).reduce<DomainSummaryMap | null>(
      (summary, [domain, entry]) => {
        if (summary === null || !isQuestionDomain(domain) || !isRecord(entry)) {
          return null;
        }

        const correct = entry['correct'];
        const total = entry['total'];
        const skipped = entry['skipped'];

        if (!isFiniteNumber(correct) || !isFiniteNumber(total) || !isFiniteNumber(skipped)) {
          return null;
        }

        summary[domain] = { correct, total, skipped };
        return summary;
      },
      {},
    );
  }

  private toReviewQuestions(value: unknown): ReviewQuestion[] | null {
    if (!Array.isArray(value)) {
      return null;
    }

    return value.reduce<ReviewQuestion[] | null>((questions, entry) => {
      if (questions === null || !isReviewQuestion(entry)) {
        return null;
      }

      questions.push(entry);
      return questions;
    }, []);
  }
}

function readHistoryState(): unknown {
  return typeof history === 'undefined' ? null : history.state;
}

function isReviewQuestion(value: unknown): value is ReviewQuestion {
  if (!isRecord(value)) {
    return false;
  }

  const id = value['id'];
  const question = value['question'];
  const domain = value['domain'];
  const type = value['type'];
  const resource = value['resource'];
  const answers = value['answers'];
  const userAnswer = value['userAnswer'];
  const isCorrect = value['isCorrect'];
  const isSkipped = value['isSkipped'];

  return (
    isFiniteNumber(id) &&
    typeof question === 'string' &&
    isQuestionDomain(domain) &&
    (resource === undefined || typeof resource === 'string') &&
    (type === 'single' || type === 'multiple') &&
    Array.isArray(answers) &&
    answers.every(isAnswer) &&
    Array.isArray(userAnswer) &&
    userAnswer.every((answer) => typeof answer === 'string') &&
    typeof isCorrect === 'boolean' &&
    typeof isSkipped === 'boolean'
  );
}

function isAnswer(value: unknown): value is Answer {
  if (!isRecord(value)) {
    return false;
  }

  const text = value['text'];
  const status = value['status'];
  const explanation = value['explanation'];

  return (
    typeof text === 'string' &&
    (status === 'correct' || status === 'skipped') &&
    typeof explanation === 'string'
  );
}

function isDomainFilter(value: unknown): value is DomainFilter {
  return value === 'All domains' || isQuestionDomain(value);
}

function isQuestionDomain(value: unknown): value is QuestionDomain {
  return (
    value === 'Design Secure Architectures' ||
    value === 'Design Resilient Architectures' ||
    value === 'Design High-Performing Architectures' ||
    value === 'Design Cost-Optimized Architectures'
  );
}

function isQuizType(value: unknown): value is QuizType {
  return (
    value === 'all' ||
    value === 'secure' ||
    value === 'resilient' ||
    value === 'performance' ||
    value === 'cost'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
