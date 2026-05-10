import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { QuizService } from '../../core/quiz.service';
import type { Question, QuestionDomain } from '../../core/quiz.model';
import { Quiz } from './quiz';

function makeQuestion(id: number, domain: QuestionDomain): Question {
  return {
    id,
    question: `Question stem ${id}`,
    domain,
    type: 'single',
    answers: [
      { text: 'Answer A', status: 'correct', explanation: 'Correct' },
      { text: 'Answer B', status: 'skipped', explanation: 'Incorrect' },
      { text: 'Answer C', status: 'skipped', explanation: 'Incorrect' },
      { text: 'Answer D', status: 'skipped', explanation: 'Incorrect' },
    ],
  };
}

describe('Quiz', () => {
  let fixture: ComponentFixture<Quiz>;
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let quizService: {
    loadQuestions: ReturnType<typeof vi.fn>;
    setQuestions: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    queryParamMap$ = new BehaviorSubject(convertToParamMap({ type: 'secure' }));
    quizService = {
      loadQuestions: vi.fn(),
      setQuestions: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Quiz],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamMap$.asObservable() },
        },
        { provide: QuizService, useValue: quizService },
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
});
