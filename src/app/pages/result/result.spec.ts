import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import type {
  QuestionDomain,
  QuizResultNavigationState,
  ReviewQuestion,
} from '../../core/quiz.model';
import { Result } from './result';

const chartMock = vi.hoisted(() => ({
  construct: vi.fn(),
  destroy: vi.fn(),
  register: vi.fn(),
}));

vi.mock('chart.js', () => {
  class MockChart {
    static register(...registerables: unknown[]): void {
      chartMock.register(...registerables);
    }

    constructor(...args: unknown[]) {
      chartMock.construct(...args);
    }

    destroy(): void {
      chartMock.destroy();
    }
  }

  return {
    ArcElement: class MockArcElement {},
    BarController: class MockBarController {},
    BarElement: class MockBarElement {},
    CategoryScale: class MockCategoryScale {},
    Chart: MockChart,
    DoughnutController: class MockDoughnutController {},
    Legend: class MockLegend {},
    LinearScale: class MockLinearScale {},
    Tooltip: class MockTooltip {},
  };
});

describe('Result', () => {
  let fixture: ComponentFixture<Result>;
  let router: {
    getCurrentNavigation: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    router = {
      getCurrentNavigation: vi.fn(),
      navigate: vi.fn(),
    };
    chartMock.construct.mockClear();
    chartMock.destroy.mockClear();
    chartMock.register.mockClear();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as CanvasRenderingContext2D,
    );
    history.replaceState({}, '', location.pathname);

    await TestBed.configureTestingModule({
      imports: [Result],
      providers: [{ provide: Router, useValue: router }],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads navigation state and renders title, completed count, score, and skipped count', () => {
    router.getCurrentNavigation.mockReturnValue({
      extras: { state: resultState({ total: 4, correct: 3, skipped: 1 }) },
    });

    fixture = TestBed.createComponent(Result);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('AWS SAA-C03 Practice Exam - Results');
    expect(compiled.textContent).toContain('You completed 4 questions');
    expect(compiled.textContent).toContain('75% correct (3/4)');
    expect(compiled.textContent).toContain('1 skipped out of 4 questions.');
    expect(compiled.textContent).toContain('Completed on');
  });

  it('scores a zero-question result as 0%', () => {
    router.getCurrentNavigation.mockReturnValue({
      extras: { state: resultState({ total: 0, correct: 0, skipped: 0 }) },
    });

    fixture = TestBed.createComponent(Result);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      '0% correct (0/0)',
    );
  });

  it('shows the domain chart only for all-domain results', () => {
    router.getCurrentNavigation.mockReturnValue({
      extras: { state: resultState({ type: 'all' }) },
    });

    fixture = TestBed.createComponent(Result);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('app-stacked-bar-chart'),
    ).not.toBeNull();

    router.getCurrentNavigation.mockReturnValue({
      extras: { state: resultState({ type: 'secure' }) },
    });

    const domainFixture = TestBed.createComponent(Result);
    domainFixture.detectChanges();

    expect(
      (domainFixture.nativeElement as HTMLElement).querySelector('app-stacked-bar-chart'),
    ).toBeNull();
  });

  it('renders an accessible domain breakdown table for all-domain results', () => {
    router.getCurrentNavigation.mockReturnValue({
      extras: { state: resultState({ type: 'all' }) },
    });

    fixture = TestBed.createComponent(Result);
    fixture.detectChanges();

    const tableText = textFrom('table');
    expect(tableText).toContain('Domain');
    expect(tableText).toContain('Correct');
    expect(tableText).toContain('Incorrect');
    expect(tableText).toContain('Skipped');
    expect(tableText).toContain('Design Secure Architectures');
    expect(tableText).toContain('1');
    expect(tableText).toContain('Design Resilient Architectures');
    expect(tableText).toContain('Design Cost-Optimized Architectures');
  });

  it('navigates to review with questions, type, and result state', () => {
    const state = resultState({ type: 'resilient' });
    router.getCurrentNavigation.mockReturnValue({ extras: { state } });

    fixture = TestBed.createComponent(Result);
    fixture.detectChanges();
    button('Review Questions').click();

    expect(router.navigate).toHaveBeenCalledWith(['/review'], {
      state: {
        questions: state.questions,
        type: 'resilient',
        resultState: state,
      },
    });
  });

  it('retakes the quiz with the result type preserved', () => {
    router.getCurrentNavigation.mockReturnValue({
      extras: { state: resultState({ type: 'performance' }) },
    });

    fixture = TestBed.createComponent(Result);
    fixture.detectChanges();
    button('Retake Test').click();

    expect(router.navigate).toHaveBeenCalledWith(['/quiz'], {
      queryParams: { type: 'performance' },
    });
  });

  it('redirects home when result state is missing', () => {
    router.getCurrentNavigation.mockReturnValue(null);

    fixture = TestBed.createComponent(Result);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('uses valid history state when current navigation state is unavailable', () => {
    const state = resultState({ total: 5, correct: 4, skipped: 1, type: 'cost' });
    router.getCurrentNavigation.mockReturnValue(null);
    history.replaceState(state, '', location.pathname);

    fixture = TestBed.createComponent(Result);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('You completed 5 questions');
    expect(compiled.textContent).toContain('80% correct (4/5)');
    expect(router.navigate).not.toHaveBeenCalledWith(['/']);
  });

  it('redirects home when history state has malformed nested result data', () => {
    router.getCurrentNavigation.mockReturnValue(null);
    history.replaceState(
      {
        ...resultState(),
        domainSummary: {
          'Design Secure Architectures': {
            correct: '1',
            total: 1,
            skipped: 0,
          },
        },
      } satisfies Record<string, unknown>,
      '',
      location.pathname,
    );

    fixture = TestBed.createComponent(Result);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('redirects home when history state has malformed review question answers', () => {
    router.getCurrentNavigation.mockReturnValue(null);
    history.replaceState(
      {
        ...resultState(),
        questions: [
          {
            ...reviewQuestion(1, 'Design Secure Architectures', true, false),
            answers: [
              {
                text: 'Answer with invalid status',
                status: 'incorrect',
                explanation: 'Invalid status should reject the result state',
              },
            ],
          },
        ],
      } satisfies Record<string, unknown>,
      '',
      location.pathname,
    );

    fixture = TestBed.createComponent(Result);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

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

  function textFrom(selector: string): string {
    const compiled = fixture.nativeElement as HTMLElement;
    const element = compiled.querySelector(selector);

    if (!element) {
      throw new Error(`Could not find element "${selector}"`);
    }

    return element.textContent ?? '';
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
