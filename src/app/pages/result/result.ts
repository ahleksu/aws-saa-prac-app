import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import type {
  Answer,
  DomainSummaryMap,
  QuestionDomain,
  QuizResultNavigationState,
  QuizType,
  ReviewQuestion,
} from '../../core/quiz.model';
import { domainSummaryToBreakdown } from '../../core/quiz-results';
import type { DonutChartInput, StackedBarChartInput } from '../../shared/chart-types';
import { DonutChart } from '../../shared/donut-chart';
import { StackedBarChart } from '../../shared/stacked-bar-chart';

const RESULT_COLORS = {
  correct: '#16a34a',
  incorrect: '#ef4444',
  skipped: '#9CA3AF',
} as const;

@Component({
  selector: 'app-result',
  imports: [ButtonModule, DatePipe, DonutChart, StackedBarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (result()) {
      <div class="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10 text-center">
        <h1 class="text-2xl font-bold mb-1">
          AWS SAA-C03 Practice Exam - Results
        </h1>
        <p class="text-gray-600 mb-6">
          You completed {{ totalQuestions() }} questions
        </p>

        <div class="card flex flex-col items-center justify-center mb-8">
          <div class="w-full max-w-xs">
            <app-donut-chart [chartData]="donutChartData()" />
          </div>
          <p class="text-xl font-semibold mt-3">
            {{ score() }}% correct ({{ correctAnswers() }}/{{ totalQuestions() }})
          </p>
          <p class="text-sm text-gray-500">
            {{ skippedAnswers() }} skipped out of {{ totalQuestions() }} questions.
          </p>
          <p class="text-sm text-gray-500">
            Completed on {{ finishedAt() | date: 'fullDate' }} at
            {{ finishedAt() | date: 'shortTime' }}
          </p>
        </div>

        @if (quizType() === 'all') {
          <section class="text-left mb-8" aria-labelledby="domains-heading">
            <h2 id="domains-heading" class="text-lg font-semibold mb-4">Domains</h2>
            <div class="card overflow-x-auto">
              <div class="min-w-[500px] w-full h-[24rem]">
                <app-stacked-bar-chart [chartData]="stackedBarChartData()" />
              </div>

              <table class="mt-6 min-w-[500px] w-full text-sm">
                <caption class="sr-only">
                  Domain score breakdown by correct, incorrect, and skipped answers
                </caption>
                <thead>
                  <tr class="border-b text-left">
                    <th scope="col" class="py-2 pr-4 font-semibold">Domain</th>
                    <th scope="col" class="py-2 px-4 font-semibold text-right">
                      Correct
                    </th>
                    <th scope="col" class="py-2 px-4 font-semibold text-right">
                      Incorrect
                    </th>
                    <th scope="col" class="py-2 pl-4 font-semibold text-right">
                      Skipped
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @for (domain of domainBreakdown(); track domain.domain) {
                    <tr class="border-b last:border-b-0">
                      <th scope="row" class="py-2 pr-4 font-medium">
                        {{ domain.domain }}
                      </th>
                      <td class="py-2 px-4 text-right">{{ domain.correct }}</td>
                      <td class="py-2 px-4 text-right">{{ domain.incorrect }}</td>
                      <td class="py-2 pl-4 text-right">{{ domain.skipped }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        <div class="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <p-button
            label="Review Questions"
            icon="pi pi-eye"
            styleClass="w-full sm:w-auto"
            (onClick)="goToReview()"
          />
          <p-button
            label="Retake Test"
            icon="pi pi-refresh"
            severity="warn"
            styleClass="w-full sm:w-auto !border-amber-800 !bg-amber-800 !text-white hover:!border-amber-900 hover:!bg-amber-900"
            (onClick)="retakeQuiz()"
          />
          <p-button
            label="Go to Homepage"
            icon="pi pi-home"
            severity="secondary"
            styleClass="w-full sm:w-auto"
            (onClick)="goHome()"
          />
        </div>
      </div>
    } @else {
      <p class="px-4 py-10 text-center text-gray-600">Returning to homepage...</p>
    }
  `,
})
export class Result {
  private readonly router = inject(Router);

  readonly result = signal<QuizResultNavigationState | null>(this.readResultState());
  readonly totalQuestions = computed(() => this.result()?.total ?? 0);
  readonly correctAnswers = computed(() => this.result()?.correct ?? 0);
  readonly skippedAnswers = computed(() => this.result()?.skipped ?? 0);
  readonly score = computed(() => {
    const total = this.totalQuestions();

    if (total === 0) {
      return 0;
    }

    return Math.round((this.correctAnswers() / total) * 100);
  });
  readonly finishedAt = computed(() => new Date(this.result()?.timestamp ?? Date.now()));
  readonly quizType = computed<QuizType>(() => this.result()?.type ?? 'all');
  readonly domainBreakdown = computed(() =>
    domainSummaryToBreakdown(this.result()?.domainSummary ?? {}),
  );
  readonly donutChartData = computed<DonutChartInput>(() => {
    const incorrect = Math.max(
      this.totalQuestions() - this.correctAnswers() - this.skippedAnswers(),
      0,
    );

    return {
      labels: ['Correct', 'Incorrect', 'Skipped'],
      data: [this.correctAnswers(), incorrect, this.skippedAnswers()],
      colors: [RESULT_COLORS.correct, RESULT_COLORS.incorrect, RESULT_COLORS.skipped],
    };
  });
  readonly stackedBarChartData = computed<StackedBarChartInput>(() => ({
    labels: this.domainBreakdown().map((entry) => entry.domain),
    datasets: [
      {
        label: 'Correct',
        backgroundColor: RESULT_COLORS.correct,
        data: this.domainBreakdown().map((entry) => entry.correct),
      },
      {
        label: 'Incorrect',
        backgroundColor: RESULT_COLORS.incorrect,
        data: this.domainBreakdown().map((entry) => entry.incorrect),
      },
      {
        label: 'Skipped',
        backgroundColor: RESULT_COLORS.skipped,
        data: this.domainBreakdown().map((entry) => entry.skipped),
      },
    ],
  }));

  constructor() {
    if (!this.result()) {
      this.router.navigate(['/']);
    }
  }

  goToReview(): void {
    const result = this.result();

    if (!result) {
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

  private readResultState(): QuizResultNavigationState | null {
    const navigationState = this.router.getCurrentNavigation()?.extras.state;

    return (
      this.toResultState(navigationState) ??
      this.toResultState(history.state)
    );
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
      if (questions === null || !this.isReviewQuestion(entry)) {
        return null;
      }

      questions.push(entry);
      return questions;
    }, []);
  }

  private isReviewQuestion(value: unknown): value is ReviewQuestion {
    if (!isRecord(value)) {
      return false;
    }

    const id = value['id'];
    const question = value['question'];
    const domain = value['domain'];
    const type = value['type'];
    const answers = value['answers'];
    const userAnswer = value['userAnswer'];
    const isCorrect = value['isCorrect'];
    const isSkipped = value['isSkipped'];

    return (
      isFiniteNumber(id) &&
      typeof question === 'string' &&
      isQuestionDomain(domain) &&
      (type === 'single' || type === 'multiple') &&
      Array.isArray(answers) &&
      answers.every(isAnswer) &&
      Array.isArray(userAnswer) &&
      userAnswer.every((answer) => typeof answer === 'string') &&
      typeof isCorrect === 'boolean' &&
      typeof isSkipped === 'boolean'
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isQuestionDomain(value: unknown): value is QuestionDomain {
  return (
    value === 'Design Secure Architectures' ||
    value === 'Design Resilient Architectures' ||
    value === 'Design High-Performing Architectures' ||
    value === 'Design Cost-Optimized Architectures'
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

function isQuizType(value: unknown): value is QuizType {
  return (
    value === 'all' ||
    value === 'secure' ||
    value === 'resilient' ||
    value === 'performance' ||
    value === 'cost'
  );
}
