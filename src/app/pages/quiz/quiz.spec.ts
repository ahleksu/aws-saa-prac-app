import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { QuizService } from '../../core/quiz.service';
import type { Question, QuestionDomain, QuizResultNavigationState } from '../../core/quiz.model';
import { Quiz } from './quiz';

function makeQuestion(
  id: number,
  domain: QuestionDomain,
  type: Question['type'] = 'single',
): Question {
  const answers =
    type === 'single'
      ? [
          {
            text: answerText(id, 'A'),
            status: 'correct' as const,
            explanation: explanationText(id, 'A'),
          },
          {
            text: answerText(id, 'B'),
            status: 'skipped' as const,
            explanation: explanationText(id, 'B'),
          },
          {
            text: answerText(id, 'C'),
            status: 'skipped' as const,
            explanation: explanationText(id, 'C'),
          },
          {
            text: answerText(id, 'D'),
            status: 'skipped' as const,
            explanation: explanationText(id, 'D'),
          },
        ]
      : [
          {
            text: answerText(id, 'A'),
            status: 'correct' as const,
            explanation: explanationText(id, 'A'),
          },
          {
            text: answerText(id, 'B'),
            status: 'correct' as const,
            explanation: explanationText(id, 'B'),
          },
          {
            text: answerText(id, 'C'),
            status: 'skipped' as const,
            explanation: explanationText(id, 'C'),
          },
          {
            text: answerText(id, 'D'),
            status: 'skipped' as const,
            explanation: explanationText(id, 'D'),
          },
          {
            text: answerText(id, 'E'),
            status: 'skipped' as const,
            explanation: explanationText(id, 'E'),
          },
        ];

  return {
    id,
    question: `Question stem ${id}`,
    domain,
    resource: `https://docs.aws.amazon.com/example/${id}`,
    type,
    answers,
  };
}

function answerText(id: number, option: string): string {
  return `Question ${id} Answer ${option}`;
}

function explanationText(id: number, option: string): string {
  return `Question ${id} Answer ${option} explanation`;
}

describe('Quiz', () => {
  let fixture: ComponentFixture<Quiz>;
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let quizService: {
    loadQuestions: ReturnType<typeof vi.fn>;
    setQuestions: ReturnType<typeof vi.fn>;
    setUserAnswers: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    queryParamMap$ = new BehaviorSubject(convertToParamMap({ type: 'secure' }));
    quizService = {
      loadQuestions: vi.fn(),
      setQuestions: vi.fn(),
      setUserAnswers: vi.fn(),
    };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Quiz],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamMap$.asObservable() },
        },
        { provide: QuizService, useValue: quizService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('loads the selected domain type and shows question 1 of N', () => {
    const questions = [
      makeQuestion(1, 'Design Secure Architectures'),
      makeQuestion(2, 'Design Secure Architectures'),
      makeQuestion(3, 'Design Secure Architectures'),
    ];
    quizService.loadQuestions.mockReturnValue(of(questions));

    fixture = TestBed.createComponent(Quiz);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(quizService.loadQuestions).toHaveBeenCalledWith('secure');
    expect(quizService.setQuestions).toHaveBeenCalledWith(questions);
    expect(compiled.textContent).toContain('Question 1 of 3');
    expect(compiled.textContent).toContain('Question stem 1');
  });

  it('loads all questions and stores a 65-question shuffled exam run', () => {
    const questions = Array.from({ length: 70 }, (_, index) =>
      makeQuestion(index + 1, 'Design Resilient Architectures'),
    );
    queryParamMap$.next(convertToParamMap({ type: 'all' }));
    quizService.loadQuestions.mockReturnValue(of(questions));

    fixture = TestBed.createComponent(Quiz);
    fixture.detectChanges();

    const storedQuestions = quizService.setQuestions.mock.calls[0][0] as Question[];
    const compiled = fixture.nativeElement as HTMLElement;
    expect(quizService.loadQuestions).toHaveBeenCalledWith('all');
    expect(storedQuestions).toHaveLength(65);
    expect(questions).toHaveLength(70);
    expect(compiled.textContent).toContain('Question 1 of 65');
  });

  it('falls back to all questions for unsupported route types', () => {
    const questions = [makeQuestion(1, 'Design Cost-Optimized Architectures')];
    queryParamMap$.next(convertToParamMap({ type: 'invalid' }));
    quizService.loadQuestions.mockReturnValue(of(questions));

    fixture = TestBed.createComponent(Quiz);
    fixture.detectChanges();

    expect(quizService.loadQuestions).toHaveBeenCalledWith('all');
    expect(quizService.setQuestions).toHaveBeenCalledWith(questions);
  });

  it('enables Check Answer after a single-choice selection', () => {
    quizService.loadQuestions.mockReturnValue(of([makeQuestion(1, 'Design Secure Architectures')]));

    fixture = TestBed.createComponent(Quiz);
    fixture.detectChanges();

    expect(button('Check Answer').disabled).toBe(true);

    input(answerText(1, 'A')).click();
    fixture.detectChanges();

    expect(input(answerText(1, 'A')).checked).toBe(true);
    expect(button('Check Answer').disabled).toBe(false);
  });

  it('shows correctness feedback and every explanation after a correct single-choice submit', () => {
    quizService.loadQuestions.mockReturnValue(of([makeQuestion(1, 'Design Secure Architectures')]));

    fixture = TestBed.createComponent(Quiz);
    fixture.detectChanges();

    input(answerText(1, 'A')).click();
    fixture.detectChanges();
    button('Check Answer').click();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Correct answer. Good job!');
    expect(answerCard(answerText(1, 'A')).textContent).toContain('Correct answer');
    expect(compiled.textContent).toContain(explanationText(1, 'A'));
    expect(compiled.textContent).toContain(explanationText(1, 'B'));
    expect(compiled.textContent).toContain('Domain: Design Secure Architectures');
    expect(link('View Resource').getAttribute('href')).toBe(
      'https://docs.aws.amazon.com/example/1',
    );
  });

  it('toggles multiple-choice selections and shows incorrect feedback after submit', () => {
    quizService.loadQuestions.mockReturnValue(
      of([makeQuestion(1, 'Design Secure Architectures', 'multiple')]),
    );

    fixture = TestBed.createComponent(Quiz);
    fixture.detectChanges();

    input(answerText(1, 'A')).click();
    fixture.detectChanges();
    expect(input(answerText(1, 'A')).checked).toBe(true);
    expect(button('Check Answer').disabled).toBe(false);

    input(answerText(1, 'A')).click();
    fixture.detectChanges();
    expect(input(answerText(1, 'A')).checked).toBe(false);
    expect(button('Check Answer').disabled).toBe(true);

    input(answerText(1, 'A')).click();
    input(answerText(1, 'C')).click();
    fixture.detectChanges();
    button('Check Answer').click();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Incorrect answer. Review the explanation.');
    expect(answerCard(answerText(1, 'A')).textContent).toContain('Correct answer');
    expect(answerCard(answerText(1, 'B')).textContent).toContain('Correct answer');
    expect(answerCard(answerText(1, 'C')).textContent).toContain('Your incorrect selection');
    expect(compiled.textContent).toContain(explanationText(1, 'C'));
  });

  it('restores submitted state when navigating back and forward', () => {
    quizService.loadQuestions.mockReturnValue(
      of([
        makeQuestion(1, 'Design Secure Architectures'),
        makeQuestion(2, 'Design Cost-Optimized Architectures'),
      ]),
    );

    fixture = TestBed.createComponent(Quiz);
    fixture.detectChanges();

    input(answerText(1, 'B')).click();
    fixture.detectChanges();
    button('Check Answer').click();
    fixture.detectChanges();
    button('Next Question').click();
    fixture.detectChanges();

    input(answerText(2, 'A')).click();
    fixture.detectChanges();
    button('Check Answer').click();
    fixture.detectChanges();
    button('Back').click();
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Question stem 1');
    expect(compiled.textContent).toContain('Incorrect answer. Review the explanation.');
    expect(input(answerText(1, 'B')).checked).toBe(true);
    expect(compiled.textContent).toContain(explanationText(1, 'B'));

    button('Next Question').click();
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Question stem 2');
    expect(compiled.textContent).toContain('Correct answer. Good job!');
    expect(input(answerText(2, 'A')).checked).toBe(true);
  });

  it('opens one confirmation dialog for unanswered questions and cancel closes it', () => {
    quizService.loadQuestions.mockReturnValue(
      of([
        makeQuestion(1, 'Design Secure Architectures'),
        makeQuestion(2, 'Design Cost-Optimized Architectures'),
      ]),
    );

    fixture = TestBed.createComponent(Quiz);
    fixture.detectChanges();

    button('Finish Test').click();
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent?.match(/Finish Test\?/g)).toHaveLength(1);
    expect(compiled.textContent).toContain(
      'You have not answered all questions. Are you sure you want to finish and view results?',
    );

    button('Cancel').click();
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Finish Test?');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('finishes unanswered questions from the confirmation dialog and marks skipped review state', () => {
    const questions = [
      makeQuestion(1, 'Design Secure Architectures'),
      makeQuestion(2, 'Design Cost-Optimized Architectures'),
    ];
    quizService.loadQuestions.mockReturnValue(of(questions));

    fixture = TestBed.createComponent(Quiz);
    fixture.detectChanges();

    input(answerText(1, 'A')).click();
    fixture.detectChanges();
    button('Check Answer').click();
    fixture.detectChanges();
    button('Finish Test').click();
    fixture.detectChanges();
    button('Finish Anyway').click();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/result'], {
      state: expect.objectContaining<Partial<QuizResultNavigationState>>({
        total: 2,
        correct: 1,
        skipped: 1,
        type: 'secure',
        domainSummary: {
          'Design Secure Architectures': { correct: 1, total: 1, skipped: 0 },
          'Design Cost-Optimized Architectures': { correct: 0, total: 1, skipped: 1 },
        },
      }),
    });

    const state = router.navigate.mock.calls[0][1].state as QuizResultNavigationState;
    expect(state.questions[1]).toEqual(
      expect.objectContaining({
        id: 2,
        userAnswer: [],
        isCorrect: false,
        isSkipped: true,
      }),
    );
  });

  it('finalizes directly when all questions are answered and navigates with the typed result state', () => {
    const questions = [
      makeQuestion(1, 'Design Secure Architectures'),
      makeQuestion(2, 'Design Cost-Optimized Architectures'),
    ];
    quizService.loadQuestions.mockReturnValue(of(questions));

    fixture = TestBed.createComponent(Quiz);
    fixture.detectChanges();

    input(answerText(1, 'A')).click();
    fixture.detectChanges();
    button('Check Answer').click();
    fixture.detectChanges();
    button('Next Question').click();
    fixture.detectChanges();

    input(answerText(2, 'B')).click();
    fixture.detectChanges();
    button('Check Answer').click();
    fixture.detectChanges();
    button('Finish Test').click();
    fixture.detectChanges();

    expect(quizService.setQuestions).toHaveBeenCalledWith(questions);
    expect(quizService.setUserAnswers).toHaveBeenCalledWith({
      1: { selected: [answerText(1, 'A')], isCorrect: true, submitted: true },
      2: { selected: [answerText(2, 'B')], isCorrect: false, submitted: true },
    });
    expect(router.navigate).toHaveBeenCalledWith(['/result'], {
      state: expect.objectContaining<Partial<QuizResultNavigationState>>({
        total: 2,
        correct: 1,
        skipped: 0,
        type: 'secure',
        domainSummary: {
          'Design Secure Architectures': { correct: 1, total: 1, skipped: 0 },
          'Design Cost-Optimized Architectures': { correct: 0, total: 1, skipped: 0 },
        },
      }),
    });

    const state = router.navigate.mock.calls[0][1].state as QuizResultNavigationState;
    expect(typeof state.timestamp).toBe('number');
    expect(state.questions).toEqual([
      expect.objectContaining({
        id: 1,
        userAnswer: [answerText(1, 'A')],
        isCorrect: true,
        isSkipped: false,
      }),
      expect.objectContaining({
        id: 2,
        userAnswer: [answerText(2, 'B')],
        isCorrect: false,
        isSkipped: false,
      }),
    ]);
  });

  function button(label: string): HTMLButtonElement {
    const compiled = fixture.nativeElement as HTMLElement;
    const match = Array.from(compiled.querySelectorAll('button')).find((candidate) =>
      candidate.textContent?.includes(label),
    );

    if (!(match instanceof HTMLButtonElement)) {
      throw new Error(`Button not found: ${label}`);
    }

    return match;
  }

  function input(value: string): HTMLInputElement {
    const compiled = fixture.nativeElement as HTMLElement;
    const match = Array.from(compiled.querySelectorAll('input')).find(
      (candidate) => candidate.value === value,
    );

    if (!(match instanceof HTMLInputElement)) {
      throw new Error(`Input not found: ${value}`);
    }

    return match;
  }

  function answerCard(answer: string): HTMLElement {
    const compiled = fixture.nativeElement as HTMLElement;
    const match = Array.from(compiled.querySelectorAll('label')).find((candidate) =>
      candidate.textContent?.includes(answer),
    );

    if (!(match instanceof HTMLElement)) {
      throw new Error(`Answer card not found: ${answer}`);
    }

    return match;
  }

  function link(label: string): HTMLAnchorElement {
    const compiled = fixture.nativeElement as HTMLElement;
    const match = Array.from(compiled.querySelectorAll('a')).find((candidate) =>
      candidate.textContent?.includes(label),
    );

    if (!(match instanceof HTMLAnchorElement)) {
      throw new Error(`Link not found: ${label}`);
    }

    return match;
  }
});
