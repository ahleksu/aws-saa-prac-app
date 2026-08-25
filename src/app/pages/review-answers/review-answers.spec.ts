import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import type {
  Question,
  QuestionDomain,
  QuizResultNavigationState,
  QuizType,
  ReviewQuestion,
} from '../../core/quiz.model';
import { QuizService } from '../../core/quiz.service';
import { ReviewAnswers } from './review-answers';

type DomainFilter = QuestionDomain | 'All domains';

interface ReviewAnswersPublicApi {
  selectedDomain: { set(value: DomainFilter): void };
  totalQuestions(): number;
  correctAnswers(): number;
  incorrectAnswers(): number;
  skippedAnswers(): number;
}

describe('ReviewAnswers', () => {
  let fixture: ComponentFixture<ReviewAnswers>;
  let router: {
    getCurrentNavigation: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
  };
  let route: { snapshot: { data: Record<string, unknown> } };
  let quizService: { loadQuestions: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    router = {
      getCurrentNavigation: vi.fn(),
      navigate: vi.fn(),
    };
    route = { snapshot: { data: {} } };
    quizService = { loadQuestions: vi.fn() };
    history.replaceState({}, '', location.pathname);

    await TestBed.configureTestingModule({
      imports: [ReviewAnswers],
      providers: [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: route },
        { provide: QuizService, useValue: quizService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects home when questions state is missing', () => {
    router.getCurrentNavigation.mockReturnValue(null);

    fixture = TestBed.createComponent(ReviewAnswers);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(quizService.loadQuestions).not.toHaveBeenCalled();
  });

  it('loads every question from the all-question review route without result state', () => {
    route.snapshot.data = { reviewMode: 'allQuestions' };
    router.getCurrentNavigation.mockReturnValue(null);
    quizService.loadQuestions.mockReturnValue(
      of([question(10, 'Design Secure Architectures')]),
    );

    fixture = TestBed.createComponent(ReviewAnswers);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(quizService.loadQuestions).toHaveBeenCalledWith('all');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(compiled.textContent).toContain('1 Question');
    expect(compiled.textContent).toContain('Question stem 10');
    expect(compiled.textContent).toContain('Question 10 Answer A explanation');
    expect(answerCard('Question 10 Answer A').textContent).toContain('Correct answer');
    expect(compiled.textContent).not.toContain('Back to Result Overview');
    expect(compiled.textContent).not.toContain('Skipped');
  });

  it('reads questions, type, and resultState from navigation state and renders chips and cards', () => {
    const state = resultState({ type: 'performance' });
    router.getCurrentNavigation.mockReturnValue({
      extras: {
        state: {
          questions: state.questions,
          type: 'performance',
          resultState: state,
        },
      },
    });

    fixture = TestBed.createComponent(ReviewAnswers);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('3 Total');
    expect(compiled.textContent).toContain('1 Correct');
    expect(compiled.textContent).toContain('1 Incorrect');
    expect(compiled.textContent).toContain('1 Skipped');
    expect(compiled.textContent).toContain('Question stem 1');
    expect(compiled.textContent).toContain('Question stem 2');
    expect(compiled.textContent).toContain('Question stem 3');
    expect(link('View Resource').getAttribute('href')).toBe(
      'https://docs.aws.amazon.com/example/1',
    );
  });

  it('computes total, correct, incorrect, and skipped counts', () => {
    renderWithState({
      questions: [
        reviewQuestion(1, 'Design Secure Architectures', true, false),
        reviewQuestion(2, 'Design Resilient Architectures', false, false),
        reviewQuestion(3, 'Design High-Performing Architectures', false, true),
        reviewQuestion(4, 'Design Cost-Optimized Architectures', false, false),
      ],
      type: 'all',
    });

    const component = fixture.componentInstance as ReviewAnswers & ReviewAnswersPublicApi;
    expect(component.totalQuestions()).toBe(4);
    expect(component.correctAnswers()).toBe(1);
    expect(component.incorrectAnswers()).toBe(2);
    expect(component.skippedAnswers()).toBe(1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('2 Incorrect');
  });

  it('narrows displayed cards with the domain filter', () => {
    renderWithState();

    const component = fixture.componentInstance as ReviewAnswers & ReviewAnswersPublicApi;
    component.selectedDomain.set('Design Resilient Architectures');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Question stem 1');
    expect(compiled.textContent).toContain('Question stem 2');
    expect(compiled.textContent).not.toContain('Question stem 3');
  });

  it('collapse and expand hides and shows answer explanations', () => {
    renderWithState();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Question 1 Answer A explanation',
    );

    button('Collapse all questions').click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(
      'Question 1 Answer A explanation',
    );

    button('Expand all questions').click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Question 1 Answer A explanation',
    );
  });

  it('labels correct answers and user-selected wrong answers with text', () => {
    renderWithState({
      questions: [reviewQuestion(2, 'Design Resilient Architectures', false, false)],
      type: 'resilient',
    });

    const compiled = fixture.nativeElement as HTMLElement;
    expect(answerCard('Question 2 Answer A').textContent).toContain('Correct answer');
    expect(answerCard('Question 2 Answer B').textContent).toContain(
      'Your incorrect selection',
    );
    expect(answerCard('Question 2 Answer C').textContent).toContain('Distractor');
    expect(compiled.textContent).toContain('Incorrect answer');
  });

  it('preserves the original type and resultState when going back to results', () => {
    const state = resultState({ type: 'cost' });
    renderWithState({
      questions: state.questions,
      type: 'cost',
      resultState: state,
    });

    button('Back to Result Overview').click();

    expect(router.navigate).toHaveBeenCalledWith(['/result'], { state });
  });

  it('rebuilds result state when original resultState is missing', () => {
    const dateNow = vi.spyOn(Date, 'now').mockReturnValue(1_778_400_000_000);
    const questions = [
      reviewQuestion(1, 'Design Secure Architectures', true, false),
      reviewQuestion(2, 'Design Secure Architectures', false, true),
      reviewQuestion(3, 'Design Resilient Architectures', false, false),
    ];
    renderWithState({ questions, type: 'secure' });

    button('Back to Result Overview').click();

    expect(dateNow).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/result'], {
      state: {
        total: 3,
        correct: 1,
        skipped: 1,
        timestamp: 1_778_400_000_000,
        domainSummary: {
          'Design Secure Architectures': { correct: 1, total: 2, skipped: 1 },
          'Design Resilient Architectures': { correct: 0, total: 1, skipped: 0 },
        },
        type: 'secure',
        questions,
      } satisfies QuizResultNavigationState,
    });
  });

  it('retakes the quiz with the original type preserved', () => {
    renderWithState({ type: 'performance' });

    button('Retake Test').click();

    expect(router.navigate).toHaveBeenCalledWith(['/quiz'], {
      queryParams: { type: 'performance' },
    });
  });

  function renderWithState(
    state: {
      questions?: ReviewQuestion[];
      type?: QuizType;
      resultState?: QuizResultNavigationState;
    } = {},
  ): void {
    const questions = state.questions ?? resultState().questions;
    router.getCurrentNavigation.mockReturnValue({
      extras: {
        state: {
          questions,
          type: state.type ?? 'all',
          resultState: state.resultState,
        },
      },
    });

    fixture = TestBed.createComponent(ReviewAnswers);
    fixture.detectChanges();
  }

  function button(label: string): HTMLButtonElement {
    const compiled = fixture.nativeElement as HTMLElement;
    const match = Array.from(compiled.querySelectorAll('button')).find((candidate) =>
      candidate.textContent?.includes(label),
    );

    if (!(match instanceof HTMLButtonElement)) {
      throw new Error(`Could not find button "${label}"`);
    }

    return match;
  }

  function link(label: string): HTMLAnchorElement {
    const compiled = fixture.nativeElement as HTMLElement;
    const match = Array.from(compiled.querySelectorAll('a')).find((candidate) =>
      candidate.textContent?.includes(label),
    );

    if (!(match instanceof HTMLAnchorElement)) {
      throw new Error(`Could not find link "${label}"`);
    }

    return match;
  }

  function answerCard(answerText: string): HTMLElement {
    const compiled = fixture.nativeElement as HTMLElement;
    const match = Array.from(compiled.querySelectorAll('[data-testid="answer-card"]')).find(
      (candidate) => candidate.textContent?.includes(answerText),
    );

    if (!(match instanceof HTMLElement)) {
      throw new Error(`Could not find answer card "${answerText}"`);
    }

    return match;
  }
});

function resultState(
  overrides: Partial<QuizResultNavigationState> = {},
): QuizResultNavigationState {
  const questions = overrides.questions ?? [
    reviewQuestion(1, 'Design Secure Architectures', true, false),
    reviewQuestion(2, 'Design Resilient Architectures', false, false),
    reviewQuestion(3, 'Design Cost-Optimized Architectures', false, true),
  ];

  return {
    total: 3,
    correct: 1,
    skipped: 1,
    timestamp: new Date('2026-05-10T08:30:00.000Z').getTime(),
    domainSummary: {
      'Design Secure Architectures': { correct: 1, total: 1, skipped: 0 },
      'Design Resilient Architectures': { correct: 0, total: 1, skipped: 0 },
      'Design Cost-Optimized Architectures': { correct: 0, total: 1, skipped: 1 },
    },
    type: 'all',
    questions,
    ...overrides,
  };
}

function reviewQuestion(
  id: number,
  domain: QuestionDomain,
  isCorrect: boolean,
  isSkipped: boolean,
): ReviewQuestion {
  return {
    id,
    question: `Question stem ${id}`,
    domain,
    resource: `https://docs.aws.amazon.com/example/${id}`,
    type: 'single',
    answers: [
      {
        text: `Question ${id} Answer A`,
        status: 'correct',
        explanation: `Question ${id} Answer A explanation`,
      },
      {
        text: `Question ${id} Answer B`,
        status: 'skipped',
        explanation: `Question ${id} Answer B explanation`,
      },
      {
        text: `Question ${id} Answer C`,
        status: 'skipped',
        explanation: `Question ${id} Answer C explanation`,
      },
      {
        text: `Question ${id} Answer D`,
        status: 'skipped',
        explanation: `Question ${id} Answer D explanation`,
      },
    ],
    userAnswer: isSkipped ? [] : [`Question ${id} Answer ${isCorrect ? 'A' : 'B'}`],
    isCorrect,
    isSkipped,
  };
}

function question(id: number, domain: QuestionDomain): Question {
  const { userAnswer, isCorrect, isSkipped, ...baseQuestion } = reviewQuestion(
    id,
    domain,
    false,
    false,
  );

  return baseQuestion;
}
