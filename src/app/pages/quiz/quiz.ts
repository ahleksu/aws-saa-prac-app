import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

import { QuizService } from '../../core/quiz.service';
import type { Question } from '../../core/quiz.model';

const quizTypes = ['all', 'secure', 'resilient', 'performance', 'cost'] as const;
type QuizType = (typeof quizTypes)[number];

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
        <section
          class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          aria-labelledby="question-heading"
        >
          <div
            class="flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p class="text-sm font-semibold text-gray-700">
              Question {{ questionPosition() }} of {{ totalQuestions() }}
            </p>
            <p class="text-sm text-gray-500">{{ quizTitle() }}</p>
          </div>

          <h1 id="question-heading" class="mt-6 text-2xl font-bold leading-snug text-gray-950">
            {{ question.question }}
          </h1>
        </section>
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
  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);

  readonly questions = signal<Question[]>([]);
  readonly currentIndex = signal(0);
  readonly selectedType = signal<QuizType>('all');
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly totalQuestions = computed(() => this.questions().length);
  readonly questionPosition = computed(() =>
    this.totalQuestions() === 0 ? 0 : this.currentIndex() + 1,
  );
  readonly currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  readonly quizTitle = computed(() => quizTypeLabels[this.selectedType()]);

  constructor() {
    this.route.queryParamMap
      .pipe(
        map((params) => normalizeQuizType(params.get('type'))),
        distinctUntilChanged(),
        tap((type) => {
          this.selectedType.set(type);
          this.currentIndex.set(0);
          this.isLoading.set(true);
          this.error.set(null);
        }),
        switchMap((type) =>
          this.quizService.loadQuestions(type).pipe(
            map((questions) => ({
              questions: this.prepareQuestions(type, questions),
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
        this.error.set(error);
        this.isLoading.set(false);
      });
  }

  private prepareQuestions(type: QuizType, questions: Question[]): Question[] {
    if (type !== 'all') {
      return questions;
    }

    return this.shuffleQuestions(questions).slice(0, 65);
  }

  private shuffleQuestions(questions: Question[]): Question[] {
    const shuffled = [...questions];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  }
}
